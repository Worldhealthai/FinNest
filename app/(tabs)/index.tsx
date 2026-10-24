import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import AddISAContributionModal, { ISAContribution } from '@/components/AddISAContributionModal';
import EditISAContributionModal from '@/components/EditISAContributionModal';
import {
  Screen,
  Card,
  Button,
  IconTile,
  ListItem,
  ListGroup,
  ProgressBar,
  Chip,
  EmptyState,
  SectionHeader,
  ActionSheet,
} from '@/components/ui';
import type { SheetAction } from '@/components/ui';
import { Colors, Type, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import {
  ISA_ANNUAL_ALLOWANCE,
  LIFETIME_ISA_MAX,
  LIFETIME_ISA_BONUS_RATE,
  ISA_TYPE_ORDER,
  ISA_LABELS,
  ISA_ICONS,
  isaColor,
  getDaysUntilTaxYearEnd,
  formatCurrency,
} from '@/constants/isaData';
import { getCurrentTaxYear, isDateInTaxYear, parseDateKey } from '@/utils/taxYear';
import { loadISASettings, isFlexibleFromSettings, ISAAccountSettings } from '@/utils/isaSettings';
import {
  loadContributions,
  saveContribution,
  updateContribution as updateContributionDB,
  deleteContribution as deleteContributionDB,
  ISAContribution as DBContribution,
} from '@/lib/contributions';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { sendISALimitNotification } from '@/utils/notificationService';
import { haptics } from '@/utils/haptics';

const CONTRIBUTIONS_STORAGE_KEY = '@finnest_contributions';
const ACTIVITY_PREVIEW_COUNT = 6;

// For flexible ISAs a withdrawal frees the allowance again; for non-flexible
// ISAs the withdrawn amount stays counted. Settings must already be loaded —
// this runs during render, so it can't await the async isISAFlexible().
const countsTowardAllowance = (c: ISAContribution, settings: ISAAccountSettings) =>
  !(c.withdrawn && isFlexibleFromSettings(settings, c.provider, c.isaType));

const calculateAllowanceUsed = (contributions: ISAContribution[], settings: ISAAccountSettings) =>
  contributions.reduce((sum, c) => (countsTowardAllowance(c, settings) ? sum + c.amount : sum), 0);

const formatShortDate = (date: string) =>
  parseDateKey(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

interface Confirmation {
  title: string;
  message: string;
  actionLabel: string;
  icon: SheetAction['icon'];
  destructive?: boolean;
  onConfirm: () => void;
}

function HomeScreen() {
  const { isGuest, userProfile } = useOnboarding();
  const [contributions, setContributions] = useState<ISAContribution[]>([]);
  const [isaSettings, setIsaSettings] = useState<ISAAccountSettings>({});
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selected, setSelected] = useState<ISAContribution | null>(null);
  const [menuFor, setMenuFor] = useState<ISAContribution | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const currentTaxYear = getCurrentTaxYear();
  const daysLeft = getDaysUntilTaxYearEnd();

  // ─── Derived figures for the current tax year ───
  const yearContributions = useMemo(
    () =>
      contributions
        .filter((c) => isDateInTaxYear(parseDateKey(c.date), currentTaxYear))
        .sort((a, b) => parseDateKey(b.date).getTime() - parseDateKey(a.date).getTime()),
    [contributions, currentTaxYear.startYear]
  );

  const allowanceUsed = useMemo(
    () => calculateAllowanceUsed(yearContributions, isaSettings),
    [yearContributions, isaSettings]
  );
  const remaining = Math.max(0, ISA_ANNUAL_ALLOWANCE - allowanceUsed);
  const exceededBy = Math.max(0, allowanceUsed - ISA_ANNUAL_ALLOWANCE);
  const usedFraction = allowanceUsed / ISA_ANNUAL_ALLOWANCE;

  const byType = useMemo(() => {
    const result: Record<string, { used: number; active: number; providers: Set<string> }> = {};
    ISA_TYPE_ORDER.forEach((t) => (result[t] = { used: 0, active: 0, providers: new Set() }));
    yearContributions.forEach((c) => {
      const bucket = result[c.isaType];
      if (!bucket) return;
      if (countsTowardAllowance(c, isaSettings)) bucket.used += c.amount;
      if (!c.withdrawn) bucket.active += c.amount;
      bucket.providers.add(c.provider);
    });
    return result;
  }, [yearContributions, isaSettings]);

  const typesInUse = ISA_TYPE_ORDER.filter((t) => byType[t].providers.size > 0);
  const lisaPaidIn = Math.min(byType.lifetime.active, LIFETIME_ISA_MAX);
  const lisaBonus = lisaPaidIn * LIFETIME_ISA_BONUS_RATE;
  const lisaBonusLeft = (LIFETIME_ISA_MAX - lisaPaidIn) * LIFETIME_ISA_BONUS_RATE;
  const hasEverUsedLisa = contributions.some((c) => c.isaType === 'lifetime');
  const hasOlderContributions = contributions.length > yearContributions.length;

  const filteredActivity = typeFilter ? yearContributions.filter((c) => c.isaType === typeFilter) : yearContributions;
  const visibleActivity = showAllActivity ? filteredActivity : filteredActivity.slice(0, ACTIVITY_PREVIEW_COUNT);

  // One contextual insight, highest priority first — never a stack of banners
  const insight = useMemo(() => {
    if (exceededBy > 0) {
      return {
        icon: 'alert-circle-outline' as const,
        tone: Colors.negative,
        text: `You're ${formatCurrency(exceededBy)} over this year's allowance. Contact your ISA provider about the excess.`,
      };
    }
    if (usedFraction >= 0.9 && remaining > 0) {
      return {
        icon: 'flag-outline' as const,
        tone: Colors.accent,
        text: `Nearly there — only ${formatCurrency(remaining)} of allowance left this tax year.`,
      };
    }
    if (daysLeft <= 30 && remaining > 0) {
      return {
        icon: 'time-outline' as const,
        tone: Colors.caution,
        text: `${daysLeft} days until the tax year ends. Unused allowance (${formatCurrency(remaining)}) won't carry over.`,
      };
    }
    if (hasEverUsedLisa && lisaBonusLeft > 0) {
      return {
        icon: 'gift-outline' as const,
        tone: Colors.positive,
        text: `You can still earn up to ${formatCurrency(lisaBonusLeft)} in Lifetime ISA bonus this year.`,
      };
    }
    return null;
  }, [exceededBy, usedFraction, remaining, daysLeft, hasEverUsedLisa, lisaBonusLeft]);

  // ─── Data loading & persistence ───
  const loadData = useCallback(async () => {
    try {
      setIsaSettings(await loadISASettings());
      if (isGuest) {
        const saved = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
        setContributions(saved ? JSON.parse(saved) : []);
      } else {
        setContributions(await loadContributions());
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoaded(true);
    }
  }, [isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const persistGuest = async (next: ISAContribution[]) => {
    setContributions(next);
    try {
      await AsyncStorage.setItem(CONTRIBUTIONS_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Error saving contributions:', error);
    }
  };

  const handleAddContribution = async (contribution: ISAContribution) => {
    let next = contributions;
    if (isGuest) {
      next = [...contributions, contribution];
      await persistGuest(next);
    } else {
      // Authenticated: the Edge Function validates allowance limits server-side
      const result = await saveContribution(contribution as Omit<DBContribution, 'id'>);
      if (result.error) {
        setNotice({ title: "Couldn't add contribution", message: result.error });
        return;
      }
      await loadData();
    }

    haptics.success();
    const updatedYear = (isGuest ? next : [...contributions, contribution]).filter((c) =>
      isDateInTaxYear(parseDateKey(c.date), currentTaxYear)
    );
    await sendISALimitNotification(calculateAllowanceUsed(updatedYear, isaSettings), ISA_ANNUAL_ALLOWANCE);
  };

  const handleUpdateContribution = async (updated: ISAContribution) => {
    if (isGuest) {
      await persistGuest(contributions.map((c) => (c.id === updated.id ? updated : c)));
    } else if (await updateContributionDB(updated.id, updated as Partial<DBContribution>)) {
      await loadData();
    }
  };

  const withdraw = async (contribution: ISAContribution) => {
    if (isGuest) {
      await persistGuest(
        contributions.map((c) =>
          c.id === contribution.id ? { ...c, withdrawn: true, withdrawnDate: new Date().toISOString() } : c
        )
      );
    } else if (await updateContributionDB(contribution.id, { withdrawn: true })) {
      await loadData();
    }
  };

  const remove = async (contribution: ISAContribution) => {
    if (isGuest) {
      await persistGuest(contributions.filter((c) => c.id !== contribution.id));
    } else if (await deleteContributionDB(contribution.id)) {
      await loadData();
    }
  };

  const askWithdraw = (c: ISAContribution) => {
    const flexible = isFlexibleFromSettings(isaSettings, c.provider, c.isaType);
    setConfirmation({
      title: `Withdraw ${formatCurrency(c.amount)}?`,
      message: flexible
        ? `${c.provider} is a flexible ISA, so withdrawing frees up ${formatCurrency(c.amount)} of allowance to pay back in this tax year.`
        : `The contribution will be marked as withdrawn. Because this ISA isn't flexible, the allowance stays used for this tax year.`,
      actionLabel: 'Mark as withdrawn',
      icon: 'arrow-undo-outline',
      onConfirm: () => withdraw(c),
    });
  };

  const askDelete = (c: ISAContribution) => {
    setConfirmation({
      title: 'Delete this entry?',
      message: `This removes the ${formatCurrency(c.amount)} entry from ${c.provider} completely and restores the allowance. Only use this for entries added by mistake.`,
      actionLabel: 'Delete entry',
      icon: 'trash-outline',
      destructive: true,
      onConfirm: () => remove(c),
    });
  };

  const openAdd = () => {
    haptics.impact();
    setAddVisible(true);
  };

  // ─── Render ───
  const firstName = !isGuest && userProfile.fullName ? userProfile.fullName.trim().split(/\s+/)[0] : '';

  return (
    <Screen
      eyebrow={`${currentTaxYear.label} tax year`}
      title={firstName ? `${greeting()}, ${firstName}` : greeting()}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentStyle={styles.content}
      overlay={
        // Hidden while the empty state shows its own "Add contribution" button
        loaded && yearContributions.length === 0 ? undefined : (
        <Pressable
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel="Add contribution"
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Ionicons name="add" size={28} color={Colors.onAccent} />
        </Pressable>
        )
      }
    >
      {/* ─── Allowance hero ─── */}
      <Card>
        <Text style={styles.overline}>{exceededBy > 0 ? 'Over allowance by' : 'Allowance remaining'}</Text>
        <Text
          style={[styles.heroValue, exceededBy > 0 && { color: Colors.negative }]}
          accessibilityLabel={`${formatCurrency(exceededBy > 0 ? exceededBy : remaining)} ${exceededBy > 0 ? 'over' : 'remaining'}`}
        >
          {formatCurrency(exceededBy > 0 ? exceededBy : remaining)}
        </Text>
        <Text style={styles.heroCaption}>of your {formatCurrency(ISA_ANNUAL_ALLOWANCE)} allowance</Text>

        <ProgressBar
          height={10}
          style={styles.heroBar}
          segments={ISA_TYPE_ORDER.map((t) => ({
            value: byType[t].used / ISA_ANNUAL_ALLOWANCE,
            color: isaColor(t),
          }))}
        />

        <View style={styles.heroFooter}>
          <Text style={styles.heroMeta}>
            <Text style={styles.heroMetaStrong}>{formatCurrency(allowanceUsed)}</Text> used ·{' '}
            {Math.min(100, Math.round(usedFraction * 100))}%
          </Text>
          <View style={styles.daysPill}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.daysText}>{daysLeft} days left</Text>
          </View>
        </View>
      </Card>

      {/* ─── Single contextual insight ─── */}
      {insight && (
        <View style={[styles.insight, { borderColor: insight.tone + '55', backgroundColor: insight.tone + '14' }]}>
          <Ionicons name={insight.icon} size={20} color={insight.tone} />
          <Text style={styles.insightText}>{insight.text}</Text>
        </View>
      )}

      {loaded && yearContributions.length === 0 ? (
        /* ─── First-run / empty year ─── */
        <Card style={styles.emptyCard}>
          <EmptyState
            icon="sparkles-outline"
            title={hasOlderContributions ? 'Nothing logged this tax year' : 'Start tracking your ISAs'}
            message={
              hasOlderContributions
                ? `Your ${currentTaxYear.label} allowance is untouched. Log a contribution when you pay into an ISA.`
                : 'Log a contribution whenever you pay into an ISA and we\'ll keep your allowance up to date.'
            }
            actionLabel="Add contribution"
            onAction={openAdd}
          />
        </Card>
      ) : (
        <>
          {/* ─── Breakdown by ISA type ─── */}
          <SectionHeader title="This tax year" />
          <ListGroup>
            {typesInUse.map((t) => {
              const providers = byType[t].providers.size;
              const parts = [`${providers} provider${providers === 1 ? '' : 's'}`];
              if (t === 'lifetime' && lisaBonus > 0) parts.push(`+${formatCurrency(lisaBonus)} bonus`);
              return (
                <ListItem
                  key={t}
                  icon={ISA_ICONS[t]}
                  iconColor={isaColor(t)}
                  title={ISA_LABELS[t]}
                  subtitle={parts.join(' · ')}
                  value={formatCurrency(byType[t].active)}
                />
              );
            })}
          </ListGroup>

          {/* ─── Activity ─── */}
          <SectionHeader title="Activity" />
          {typesInUse.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={styles.chipsScroll}
            >
              <Chip label="All" selected={!typeFilter} onPress={() => setTypeFilter(null)} />
              {typesInUse.map((t) => (
                <Chip
                  key={t}
                  label={ISA_LABELS[t].replace(' ISA', '')}
                  dotColor={isaColor(t)}
                  selected={typeFilter === t}
                  onPress={() => setTypeFilter(typeFilter === t ? null : t)}
                />
              ))}
            </ScrollView>
          )}

          <ListGroup>
            {visibleActivity.map((c) => (
              <ListItem
                key={c.id}
                leading={<IconTile name={ISA_ICONS[c.isaType] ?? 'wallet-outline'} color={isaColor(c.isaType)} size={36} />}
                title={c.provider}
                subtitle={`${formatShortDate(c.date)} · ${
                  c.withdrawn ? 'Withdrawn' : (ISA_LABELS[c.isaType] ?? 'ISA').replace(' ISA', '')
                }`}
                value={formatCurrency(c.amount)}
                muted={c.withdrawn}
                onPress={() => setMenuFor(c)}
              />
            ))}
          </ListGroup>

          {filteredActivity.length > ACTIVITY_PREVIEW_COUNT && (
            <Button
              title={showAllActivity ? 'Show less' : `Show all ${filteredActivity.length}`}
              variant="ghost"
              size="md"
              onPress={() => setShowAllActivity(!showAllActivity)}
              style={styles.showAll}
            />
          )}

          {hasOlderContributions && (
            <Pressable
              onPress={() => router.push('/(tabs)/analytics')}
              style={({ pressed }) => [styles.historyLink, pressed && { opacity: 0.6 }]}
              accessibilityRole="link"
            >
              <Text style={styles.historyText}>See previous tax years in Insights</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.accent} />
            </Pressable>
          )}
        </>
      )}

      {/* ─── Sheets & modals ─── */}
      <ActionSheet
        visible={!!menuFor}
        onClose={() => setMenuFor(null)}
        title={menuFor ? `${formatCurrency(menuFor.amount)} · ${menuFor.provider}` : undefined}
        message={menuFor ? `${ISA_LABELS[menuFor.isaType] ?? 'ISA'} · ${formatShortDate(menuFor.date)}` : undefined}
        actions={
          menuFor
            ? [
                ...(!menuFor.withdrawn
                  ? [
                      {
                        label: 'Edit contribution',
                        icon: 'create-outline' as const,
                        onPress: () => {
                          setSelected(menuFor);
                          setEditVisible(true);
                        },
                      },
                      {
                        label: 'Mark as withdrawn',
                        icon: 'arrow-undo-outline' as const,
                        description: 'You took this money out of the ISA',
                        onPress: () => askWithdraw(menuFor),
                      },
                    ]
                  : []),
                {
                  label: 'Delete entry',
                  icon: 'trash-outline' as const,
                  destructive: true,
                  description: 'Added by mistake',
                  onPress: () => askDelete(menuFor),
                },
              ]
            : []
        }
      />

      <ActionSheet
        visible={!!confirmation}
        onClose={() => setConfirmation(null)}
        title={confirmation?.title}
        message={confirmation?.message}
        actions={
          confirmation
            ? [
                {
                  label: confirmation.actionLabel,
                  icon: confirmation.icon,
                  destructive: confirmation.destructive,
                  onPress: confirmation.onConfirm,
                },
              ]
            : []
        }
      />

      <ActionSheet
        visible={!!notice}
        onClose={() => setNotice(null)}
        title={notice?.title}
        message={notice?.message}
        actions={[]}
        cancelLabel="OK"
      />

      <AddISAContributionModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onAdd={handleAddContribution}
        currentISAs={Object.fromEntries(
          ISA_TYPE_ORDER.map((t) => [
            t,
            {
              contributed: byType[t].used,
              balance: byType[t].active,
              provider: [...byType[t].providers][0] || 'None',
            },
          ])
        )}
      />

      <EditISAContributionModal
        visible={editVisible}
        onClose={() => {
          setEditVisible(false);
          setSelected(null);
        }}
        onUpdate={handleUpdateContribution}
        contribution={selected}
      />
    </Screen>
  );
}

export default withErrorBoundary(HomeScreen);

const styles = StyleSheet.create({
  content: {
    // Clear the floating add button so the last row stays tappable
    paddingBottom: 104,
  },
  overline: {
    ...Type.overline,
  },
  heroValue: {
    ...Type.display,
    ...Type.number,
    marginTop: 8,
  },
  heroCaption: {
    ...Type.callout,
    marginTop: 2,
  },
  heroBar: {
    marginTop: 20,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  heroMeta: {
    ...Type.caption,
  },
  heroMetaStrong: {
    color: Colors.text,
    fontWeight: '600',
  },
  daysPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceRaised,
  },
  daysText: {
    ...Type.caption,
    fontWeight: '600',
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  insightText: {
    ...Type.callout,
    color: Colors.text,
    flex: 1,
  },
  emptyCard: {
    marginTop: Spacing.lg,
  },
  chipsScroll: {
    marginHorizontal: -20,
    marginBottom: 12,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 20,
  },
  showAll: {
    marginTop: 8,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    paddingVertical: 8,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.gold,
  },
  fabPressed: {
    backgroundColor: Colors.accentPressed,
    transform: [{ scale: 0.94 }],
  },
});
