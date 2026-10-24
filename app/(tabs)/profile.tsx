import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import Modal from '@/components/Modal';
import PersonalInfoModal from '@/components/PersonalInfoModal';
import TermsModal from '@/components/TermsModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import ContactSupportModal from '@/components/ContactSupportModal';
import TargetGoalModal from '@/components/TargetGoalModal';
import NotificationsModal from '@/components/NotificationsModal';
import FlexibleCalculatorModal from '@/components/FlexibleCalculatorModal';
import { ISAContribution } from '@/components/AddISAContributionModal';
import { Screen, Card, Button, ListItem, ListGroup, ProgressBar, SectionHeader, Input, IconTile } from '@/components/ui';
import { Colors, Type, Spacing } from '@/constants/theme';
import { formatCurrency } from '@/constants/isaData';
import { getCurrentTaxYear, isDateInTaxYear, parseDateKey } from '@/utils/taxYear';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { loadContributions as loadContributionsDB } from '@/lib/contributions';

const CONTRIBUTIONS_STORAGE_KEY = '@finnest_contributions';
const APP_VERSION = '1.0.0';

type Sheet = 'personal' | 'notifications' | 'goal' | 'calculator' | 'support' | 'terms' | 'privacy' | 'delete' | null;

// Goal dates come from two places: onboarding stores DD/MM/YYYY, the goal
// sheet stores ISO. new Date('25/12/2027') is invalid, so parse both.
function parseGoalDate(value?: string): Date | null {
  if (!value) return null;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  const date = dmy ? new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const initials = (name?: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

function ProfileScreen() {
  const { userProfile, updateProfile, logout, isGuest, deleteAccount } = useOnboarding();
  const [contributions, setContributions] = useState<ISAContribution[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      if (isGuest) {
        const saved = await AsyncStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
        setContributions(saved ? JSON.parse(saved) : []);
      } else {
        setContributions(await loadContributionsDB());
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  }, [isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const active = contributions.filter((c) => !c.withdrawn);
  const accountCount = new Set(active.map((c) => `${c.provider}-${c.isaType}`)).size;
  const savedAllTime = active.reduce((s, c) => s + c.amount, 0);
  // Everything paid in this tax year (withdrawals included — they were still
  // contributions), which is what the flexible ISA calculator works from
  const currentTaxYear = getCurrentTaxYear();
  const contributedThisYear = contributions
    .filter((c) => isDateInTaxYear(parseDateKey(c.date), currentTaxYear))
    .reduce((s, c) => s + c.amount, 0);

  const goalAmount = userProfile.targetAmount && userProfile.targetAmount > 0 ? userProfile.targetAmount : null;
  const goalDate = parseGoalDate(userProfile.targetDate);

  const handlePickImage = async () => {
    if (Platform.OS === 'web') return;
    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo access to choose a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        await updateProfile({ profilePhoto: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/(onboarding)/login');
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    // Removes the auth user and all data server-side (delete-account Edge
    // Function), signs out and clears local caches.
    const success = await deleteAccount();
    setDeleting(false);
    if (success) {
      setSheet(null);
      setDeleteText('');
      router.replace('/(onboarding)/login');
    } else {
      setDeleteError("We couldn't delete your account. Check your connection and try again, or contact support.");
    }
  };

  const closeDelete = () => {
    setSheet(null);
    setDeleteText('');
    setDeleteError(null);
  };

  return (
    <Screen title="Profile">
      {/* ─── Identity ─── */}
      <Card onPress={isGuest ? undefined : () => setSheet('personal')} accessibilityLabel="Edit personal information">
        <View style={styles.identity}>
          <Pressable onPress={handlePickImage} disabled={Platform.OS === 'web' || isGuest} accessibilityLabel="Change photo">
            {userProfile.profilePhoto ? (
              <Image source={{ uri: userProfile.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                {isGuest ? (
                  <Ionicons name="person-outline" size={24} color={Colors.accent} />
                ) : (
                  <Text style={styles.avatarText}>{initials(userProfile.fullName)}</Text>
                )}
              </View>
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {isGuest ? 'Guest' : userProfile.fullName || 'Your profile'}
            </Text>
            <Text style={Type.caption} numberOfLines={1}>
              {isGuest ? 'Using FinNest without an account' : userProfile.email}
            </Text>
          </View>
          {!isGuest && <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />}
        </View>
      </Card>

      {/* ─── Guest prompt ─── */}
      {isGuest && (
        <Card style={styles.guestCard}>
          <View style={styles.guestHeader}>
            <IconTile name="shield-checkmark-outline" size={36} />
            <Text style={styles.guestTitle}>Keep your records safe</Text>
          </View>
          <Text style={styles.guestText}>
            As a guest, your data stays on this device and is cleared when you leave the app. Create a free account to
            save your contributions securely.
          </Text>
          <Button title="Create free account" onPress={handleSignOut} style={{ marginTop: 16 }} />
        </Card>
      )}

      {/* ─── At a glance ─── */}
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{accountCount}</Text>
          <Text style={Type.caption}>{accountCount === 1 ? 'ISA account' : 'ISA accounts'}</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(savedAllTime)}
          </Text>
          <Text style={Type.caption}>Saved all time</Text>
        </Card>
      </View>

      {/* ─── Savings goal ─── */}
      <SectionHeader title="Savings goal" actionLabel={goalAmount ? 'Edit' : undefined} onAction={() => setSheet('goal')} />
      {goalAmount ? (
        <Card onPress={() => setSheet('goal')} accessibilityLabel="Edit savings goal">
          <View style={styles.goalRow}>
            <Text style={styles.goalValue}>{formatCurrency(goalAmount)}</Text>
            {goalDate && (
              <Text style={Type.caption}>
                by {goalDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </Text>
            )}
          </View>
          <ProgressBar value={savedAllTime / goalAmount} style={{ marginTop: 14 }} color={Colors.positive} />
          <Text style={styles.goalCaption}>
            {savedAllTime >= goalAmount
              ? 'Goal reached — time to set a new one?'
              : `${formatCurrency(savedAllTime)} saved · ${Math.round((savedAllTime / goalAmount) * 100)}% of the way there`}
          </Text>
        </Card>
      ) : (
        <ListGroup>
          <ListItem
            icon="flag-outline"
            title="Set a savings goal"
            subtitle="Track progress towards a target amount"
            onPress={() => setSheet('goal')}
          />
        </ListGroup>
      )}

      {/* ─── Settings ─── */}
      <SectionHeader title="Settings" />
      <ListGroup>
        {!isGuest && (
          <ListItem icon="person-outline" iconColor={Colors.info} title="Personal information" onPress={() => setSheet('personal')} />
        )}
        <ListItem icon="notifications-outline" iconColor={Colors.info} title="Notifications" onPress={() => setSheet('notifications')} />
        <ListItem
          icon="calculator-outline"
          iconColor={Colors.info}
          title="Flexible ISA calculator"
          subtitle="See how withdrawals affect your allowance"
          onPress={() => setSheet('calculator')}
        />
      </ListGroup>

      <SectionHeader title="Help & legal" />
      <ListGroup>
        <ListItem icon="chatbubble-ellipses-outline" iconColor={Colors.textSecondary} title="Contact support" onPress={() => setSheet('support')} />
        <ListItem icon="document-text-outline" iconColor={Colors.textSecondary} title="Terms & conditions" onPress={() => setSheet('terms')} />
        <ListItem icon="shield-checkmark-outline" iconColor={Colors.textSecondary} title="Privacy policy" onPress={() => setSheet('privacy')} />
      </ListGroup>

      {/* ─── Account actions ─── */}
      <View style={styles.actions}>
        <Button
          title={isGuest ? 'Exit guest mode' : 'Sign out'}
          variant="secondary"
          icon="log-out-outline"
          onPress={handleSignOut}
        />
        {!isGuest && (
          <Button title="Delete account" variant="danger" icon="trash-outline" onPress={() => setSheet('delete')} />
        )}
      </View>
      <Text style={styles.version}>FinNest {APP_VERSION}</Text>

      {/* ─── Sheets ─── */}
      <PersonalInfoModal visible={sheet === 'personal'} onClose={() => setSheet(null)} />
      <NotificationsModal visible={sheet === 'notifications'} onClose={() => setSheet(null)} />
      <TargetGoalModal visible={sheet === 'goal'} onClose={() => setSheet(null)} />
      <FlexibleCalculatorModal
        visible={sheet === 'calculator'}
        onClose={() => setSheet(null)}
        currentContributions={contributedThisYear}
      />
      <ContactSupportModal visible={sheet === 'support'} onClose={() => setSheet(null)} />
      <TermsModal visible={sheet === 'terms'} onClose={() => setSheet(null)} />
      <PrivacyPolicyModal visible={sheet === 'privacy'} onClose={() => setSheet(null)} />

      <Modal
        visible={sheet === 'delete'}
        onClose={closeDelete}
        title="Delete account"
        size="auto"
        footer={
          <Button
            title="Delete forever"
            variant="danger"
            onPress={handleDelete}
            loading={deleting}
            disabled={deleteText.trim().toUpperCase() !== 'DELETE'}
          />
        }
      >
        <Text style={styles.deleteText}>
          This permanently deletes your account and every contribution you've logged. It can't be undone.
        </Text>
        <Input
          label="Type DELETE to confirm"
          value={deleteText}
          onChangeText={setDeleteText}
          placeholder="DELETE"
          autoCapitalize="characters"
          autoCorrect={false}
          error={deleteError}
          containerStyle={{ marginTop: Spacing.lg }}
        />
      </Modal>
    </Screen>
  );
}

export default withErrorBoundary(ProfileScreen);

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Type.headline,
    color: Colors.accent,
  },
  name: {
    ...Type.headline,
    marginBottom: 2,
  },
  guestCard: {
    marginTop: 12,
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestTitle: {
    ...Type.headline,
  },
  guestText: {
    ...Type.callout,
    marginTop: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    padding: 16,
  },
  statValue: {
    ...Type.title2,
    ...Type.number,
    marginBottom: 2,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  goalValue: {
    ...Type.title2,
    ...Type.number,
  },
  goalCaption: {
    ...Type.caption,
    marginTop: 10,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: 12,
  },
  version: {
    ...Type.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  deleteText: {
    ...Type.body,
    color: Colors.textSecondary,
  },
});
