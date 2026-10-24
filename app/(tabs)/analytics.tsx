import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import Modal from '@/components/Modal';
import { ISAContribution } from '@/components/AddISAContributionModal';
import { Screen, Card, ListItem, ListGroup, ProgressBar, SectionHeader, EmptyState, Button } from '@/components/ui';
import { Colors, Type, Spacing, BorderRadius } from '@/constants/theme';
import {
  ISA_ANNUAL_ALLOWANCE,
  LIFETIME_ISA_MAX,
  LIFETIME_ISA_BONUS_RATE,
  ISA_TYPE_ORDER,
  ISA_LABELS,
  ISA_ICONS,
  isaColor,
  formatCurrency,
  formatCompactCurrency,
} from '@/constants/isaData';
import { getCurrentTaxYear, isDateInTaxYear, getTaxYearFromDate, getTaxYearBoundaries, parseDateKey } from '@/utils/taxYear';
import { loadISASettings, isFlexibleFromSettings, ISAAccountSettings } from '@/utils/isaSettings';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { loadContributions as loadContributionsDB } from '@/lib/contributions';
import { haptics } from '@/utils/haptics';
import { calculateConsistency } from '@/utils/consistency';

const CONTRIBUTIONS_STORAGE_KEY = '@finnest_contributions';
const MONTHS = ['A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F', 'M']; // tax year order, Apr → Mar
const CHART_YEARS = 5;
const CHART_HEIGHT = 140;
const BAR_LABEL_ROW = 26; // year label under each bar

function InsightsScreen() {
  const { isGuest } = useOnboarding();
  const [contributions, setContributions] = useState<ISAContribution[]>([]);
  const [isaSettings, setIsaSettings] = useState<ISAAccountSettings>({});
  const [loaded, setLoaded] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsaSettings(await loadISASettings());
      if (isGuest) {
        const saved = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
        setContributions(saved ? JSON.parse(saved) : []);
      } else {
        setContributions(await loadContributionsDB());
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

  // Contributions can change on other tabs; refresh whenever this tab is shown
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const currentTaxYear = getCurrentTaxYear();
  const activeYear = selectedYear ?? currentTaxYear.startYear;

  const yearContributions = useMemo(
    () => contributions.filter((c) => isDateInTaxYear(parseDateKey(c.date), currentTaxYear)),
    [contributions, currentTaxYear.startYear]
  );

  // ─── This year ───
  const savedThisYear = yearContributions.filter((c) => !c.withdrawn).reduce((s, c) => s + c.amount, 0);
  const allowanceUsed = yearContributions.reduce(
    (s, c) => (c.withdrawn && isFlexibleFromSettings(isaSettings, c.provider, c.isaType) ? s : s + c.amount),
    0
  );
  const allowanceLeft = Math.max(0, ISA_ANNUAL_ALLOWANCE - allowanceUsed);
  const lisaPaidIn = Math.min(
    yearContributions.filter((c) => c.isaType === 'lifetime' && !c.withdrawn).reduce((s, c) => s + c.amount, 0),
    LIFETIME_ISA_MAX
  );
  const lisaBonus = lisaPaidIn * LIFETIME_ISA_BONUS_RATE;
  const consistency = calculateConsistency(yearContributions, currentTaxYear.startDate);
  const monthIndexNow = (new Date().getMonth() - currentTaxYear.startDate.getMonth() + 12) % 12;

  // ─── Year by year ───
  const totalsByYear = useMemo(() => {
    const totals: Record<number, { total: number; byType: Record<string, number> }> = {};
    contributions.forEach((c) => {
      if (c.withdrawn) return;
      const year = getTaxYearFromDate(parseDateKey(c.date)).startYear;
      totals[year] ??= { total: 0, byType: {} };
      totals[year].total += c.amount;
      totals[year].byType[c.isaType] = (totals[year].byType[c.isaType] ?? 0) + c.amount;
    });
    return totals;
  }, [contributions]);

  const chartYears = Array.from({ length: CHART_YEARS }, (_, i) => currentTaxYear.startYear - (CHART_YEARS - 1 - i));
  const chartMax = Math.max(ISA_ANNUAL_ALLOWANCE, ...chartYears.map((y) => totalsByYear[y]?.total ?? 0));
  const selectedTotals = totalsByYear[activeYear] ?? { total: 0, byType: {} };

  // ─── All time ───
  const allTimeByType = ISA_TYPE_ORDER.map((t) => ({
    type: t,
    amount: contributions.filter((c) => c.isaType === t && !c.withdrawn).reduce((s, c) => s + c.amount, 0),
  }));
  const allTimeTotal = allTimeByType.reduce((s, x) => s + x.amount, 0);

  if (loaded && contributions.length === 0) {
    return (
      <Screen title="Insights" subtitle="How your saving is going">
        <Card>
          <EmptyState
            icon="pie-chart-outline"
            title="Insights appear as you save"
            message="Once you log contributions on the Home tab, you'll see your yearly totals, saving rhythm and LISA bonus here."
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Insights" subtitle={`${currentTaxYear.label} tax year`}>
      {/* ─── Key figures ─── */}
      <View style={styles.grid}>
        <Stat label="Saved this year" value={formatCurrency(savedThisYear)} />
        <Stat label="Allowance left" value={formatCurrency(allowanceLeft)} />
        <Stat
          label="LISA bonus"
          value={formatCurrency(lisaBonus)}
          valueColor={lisaBonus > 0 ? Colors.positive : undefined}
        />
        <Stat
          label="Consistency"
          value={`${consistency.score}%`}
          detail={consistency.rating}
          onPress={() => setShowScoreInfo(true)}
        />
      </View>

      {/* ─── Saving rhythm ─── */}
      <SectionHeader title="Saving rhythm" actionLabel="How it works" onAction={() => setShowScoreInfo(true)} />
      <Card>
        <View style={styles.heatmap}>
          {consistency.heatmap.map((hit, i) => {
            const isFuture = i > monthIndexNow;
            return (
              <View key={i} style={styles.monthCol}>
                <View
                  style={[
                    styles.monthCell,
                    hit && styles.monthHit,
                    isFuture && !hit && styles.monthFuture,
                    i === monthIndexNow && styles.monthNow,
                  ]}
                />
                <Text style={[styles.monthLabel, i === monthIndexNow && { color: Colors.text }]}>{MONTHS[i]}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.rhythmCaption}>
          You've paid in during <Text style={styles.strong}>{consistency.monthsCovered} of 12 months</Text> this tax
          year.
        </Text>
        {consistency.bonuses.length > 0 && (
          <View style={styles.bonusRow}>
            {consistency.bonuses.map((b) => (
              <View key={b.name} style={[styles.bonus, b.earned && styles.bonusEarned]}>
                <Ionicons
                  name={b.earned ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={b.earned ? Colors.positive : Colors.textTertiary}
                />
                <Text style={[styles.bonusText, b.earned && { color: Colors.text }]}>{b.name}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* ─── Year by year ─── */}
      <SectionHeader title="Year by year" />
      <Card>
        <View style={styles.chart}>
          <View style={[styles.limitLine, { bottom: (ISA_ANNUAL_ALLOWANCE / chartMax) * CHART_HEIGHT + BAR_LABEL_ROW }]}>
            <Text style={styles.limitLabel}>£20k limit</Text>
          </View>
          {chartYears.map((year) => {
            const total = totalsByYear[year]?.total ?? 0;
            const selected = year === activeYear;
            const isCurrent = year === currentTaxYear.startYear;
            return (
              <Pressable
                key={year}
                style={styles.barCol}
                onPress={() => {
                  haptics.tap();
                  setSelectedYear(year);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${getTaxYearBoundaries(year).label}: ${formatCurrency(total)}`}
                accessibilityState={{ selected }}
              >
                <View style={styles.barTrack}>
                  <Text style={[styles.barValue, selected && { color: Colors.text }]}>
                    {total > 0 ? formatCompactCurrency(total) : ''}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(total > 0 ? 6 : 2, (total / chartMax) * CHART_HEIGHT),
                        backgroundColor: selected ? Colors.accent : isCurrent ? '#2E4A72' : Colors.surfacePressed,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, selected && styles.barLabelSelected]}>
                  {getTaxYearBoundaries(year).label.slice(2)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.yearDetail}>
          <View style={styles.yearDetailHeader}>
            <Text style={styles.yearDetailTitle}>{getTaxYearBoundaries(activeYear).label}</Text>
            <Text style={styles.yearDetailTotal}>{formatCurrency(selectedTotals.total)}</Text>
          </View>
          {selectedTotals.total > 0 ? (
            ISA_TYPE_ORDER.filter((t) => selectedTotals.byType[t]).map((t) => (
              <View key={t} style={styles.yearDetailRow}>
                <View style={[styles.dot, { backgroundColor: isaColor(t) }]} />
                <Text style={styles.yearDetailLabel}>{ISA_LABELS[t]}</Text>
                <Text style={styles.yearDetailValue}>{formatCurrency(selectedTotals.byType[t])}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.yearDetailEmpty}>No contributions logged for this tax year.</Text>
          )}
        </View>
      </Card>

      {/* ─── All time ─── */}
      <SectionHeader title="All time" />
      <Card style={styles.allTimeCard}>
        <Text style={Type.overline}>Total saved</Text>
        <Text style={styles.allTimeValue}>{formatCurrency(allTimeTotal)}</Text>
        <ProgressBar
          height={8}
          style={{ marginTop: 14 }}
          segments={allTimeByType.map((x) => ({
            value: allTimeTotal > 0 ? x.amount / allTimeTotal : 0,
            color: isaColor(x.type),
          }))}
        />
      </Card>
      <ListGroup style={{ marginTop: 12 }}>
        {allTimeByType
          .filter((x) => x.amount > 0)
          .map((x) => (
            <ListItem
              key={x.type}
              icon={ISA_ICONS[x.type]}
              iconColor={isaColor(x.type)}
              title={ISA_LABELS[x.type]}
              subtitle={`${Math.round((x.amount / allTimeTotal) * 100)}% of your savings`}
              value={formatCurrency(x.amount)}
            />
          ))}
      </ListGroup>

      {/* ─── Score explanation ─── */}
      <Modal
        visible={showScoreInfo}
        onClose={() => setShowScoreInfo(false)}
        title="Consistency score"
        size="auto"
        footer={<Button title="Got it" onPress={() => setShowScoreInfo(false)} />}
      >
        <Text style={styles.infoText}>
          Paying in regularly is one of the best savings habits. Your score is the share of the tax year's 12 months
          in which you contributed — several payments in one month still count once.
        </Text>
        <View style={styles.infoList}>
          {[
            ['calendar-outline', 'Each month with a contribution adds about 8%'],
            ['flash-outline', 'Early start: +10% for contributing by June'],
            ['trending-up-outline', '3-month streak: +10% for three months in a row'],
            ['repeat-outline', 'Regular saver: +5% once you reach six months'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.infoRow}>
              <Ionicons name={icon as any} size={18} color={Colors.accent} />
              <Text style={styles.infoRowText}>{text}</Text>
            </View>
          ))}
        </View>
      </Modal>
    </Screen>
  );
}

function Stat({
  label,
  value,
  detail,
  valueColor,
  onPress,
}: {
  label: string;
  value: string;
  detail?: string;
  valueColor?: string;
  onPress?: () => void;
}) {
  return (
    <Card style={styles.stat} onPress={onPress} accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        {onPress ? <Ionicons name="information-circle-outline" size={16} color={Colors.textTertiary} /> : null}
      </View>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {detail ? <Text style={styles.statDetail}>{detail}</Text> : null}
    </Card>
  );
}

export default withErrorBoundary(InsightsScreen);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: 16,
    minHeight: 104,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    ...Type.caption,
  },
  statValue: {
    ...Type.title2,
    ...Type.number,
    marginTop: 8,
  },
  statDetail: {
    ...Type.caption,
    color: Colors.accent,
    marginTop: 2,
  },
  heatmap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthCol: {
    alignItems: 'center',
    flex: 1,
  },
  monthCell: {
    width: '78%',
    aspectRatio: 1,
    maxWidth: 30,
    borderRadius: 7,
    backgroundColor: Colors.surfaceRaised,
  },
  monthHit: {
    backgroundColor: Colors.accent,
  },
  monthFuture: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthNow: {
    borderWidth: 2,
    borderColor: Colors.text,
  },
  monthLabel: {
    ...Type.caption,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  rhythmCaption: {
    ...Type.callout,
    marginTop: 16,
  },
  strong: {
    color: Colors.text,
    fontWeight: '600',
  },
  bonusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  bonus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bonusEarned: {
    borderColor: 'rgba(52, 211, 153, 0.35)',
    backgroundColor: Colors.positiveMuted,
  },
  bonusText: {
    ...Type.caption,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + BAR_LABEL_ROW + 20,
  },
  limitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
  },
  limitLabel: {
    ...Type.caption,
    fontSize: 10,
    color: Colors.textTertiary,
    position: 'absolute',
    right: 0,
    top: -15,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    ...Type.caption,
    ...Type.number,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginBottom: 6,
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 28,
    borderRadius: 6,
  },
  barLabel: {
    ...Type.caption,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textTertiary,
    height: BAR_LABEL_ROW,
    paddingTop: 10,
  },
  barLabelSelected: {
    color: Colors.text,
    fontWeight: '600',
  },
  yearDetail: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderStrong,
  },
  yearDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  yearDetailTitle: {
    ...Type.bodyStrong,
  },
  yearDetailTotal: {
    ...Type.bodyStrong,
    ...Type.number,
  },
  yearDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  yearDetailLabel: {
    ...Type.callout,
    flex: 1,
  },
  yearDetailValue: {
    ...Type.callout,
    ...Type.number,
    color: Colors.text,
  },
  yearDetailEmpty: {
    ...Type.caption,
    color: Colors.textTertiary,
  },
  allTimeCard: {
    padding: 20,
  },
  allTimeValue: {
    ...Type.title1,
    ...Type.number,
    marginTop: 6,
  },
  infoText: {
    ...Type.body,
    color: Colors.textSecondary,
  },
  infoList: {
    marginTop: Spacing.md,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoRowText: {
    ...Type.body,
    flex: 1,
  },
});
