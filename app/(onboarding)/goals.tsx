import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import OnboardingStep from '@/components/OnboardingStep';
import { Button, Input } from '@/components/ui';
import { Colors, Type, BorderRadius } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { haptics } from '@/utils/haptics';

type GoalType = 'first_home' | 'retirement' | 'emergency' | 'education' | 'general' | 'other';

const GOAL_OPTIONS: { value: GoalType; icon: keyof typeof Ionicons.glyphMap; title: string }[] = [
  { value: 'first_home', icon: 'home-outline', title: 'First home' },
  { value: 'retirement', icon: 'sunny-outline', title: 'Retirement' },
  { value: 'emergency', icon: 'shield-checkmark-outline', title: 'Emergency fund' },
  { value: 'education', icon: 'school-outline', title: 'Education' },
  { value: 'general', icon: 'trending-up-outline', title: 'Growing wealth' },
  { value: 'other', icon: 'ellipsis-horizontal', title: 'Something else' },
];

const formatAmount = (text: string) => {
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10).toLocaleString('en-GB') : '';
};

// Stored as YYYY-MM-DD (same as the savings-goal sheet); the field shows DD/MM/YYYY
const toDateKey = (dmy: string) => {
  const [d, m, y] = dmy.split('/');
  return dmy.length === 10 ? `${y}-${m}-${d}` : '';
};

const fromDateKey = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

const formatDate = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
};

export default function GoalsScreen() {
  const { userProfile, updateProfile } = useOnboarding();
  const [goals, setGoals] = useState<GoalType[]>((userProfile.savingsGoals as GoalType[]) || []);
  const [targetAmount, setTargetAmount] = useState(
    userProfile.targetAmount ? userProfile.targetAmount.toLocaleString('en-GB') : ''
  );
  const [targetDate, setTargetDate] = useState(fromDateKey(userProfile.targetDate || ''));
  const [dateError, setDateError] = useState<string | null>(null);

  const toggle = (goal: GoalType) => {
    haptics.tap();
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const handleContinue = () => {
    if (targetDate && targetDate.length !== 10) {
      setDateError('Please enter the date as DD/MM/YYYY, or leave it blank.');
      return;
    }
    updateProfile({
      savingsGoals: goals,
      targetAmount: parseInt(targetAmount.replace(/,/g, ''), 10) || 0,
      targetDate: toDateKey(targetDate),
    });
    router.push('/(onboarding)/notifications');
  };

  return (
    <OnboardingStep
      step={2}
      totalSteps={3}
      title="What are you saving for?"
      subtitle="Pick as many as you like. It helps us tailor tips — you can change this later."
      onBack={() => router.back()}
      footer={
        <>
          <Button title="Continue" onPress={handleContinue} disabled={goals.length === 0} />
          <Button
            title="Skip for now"
            variant="ghost"
            onPress={() => router.push('/(onboarding)/notifications')}
            style={styles.skip}
          />
        </>
      }
    >
      <View style={styles.grid}>
        {GOAL_OPTIONS.map((option) => {
          const selected = goals.includes(option.value);
          return (
            <Pressable
              key={option.value}
              onPress={() => toggle(option.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.title}
              style={({ pressed }) => [styles.tile, selected && styles.tileSelected, pressed && styles.tilePressed]}
            >
              <Ionicons name={option.icon} size={22} color={selected ? Colors.accent : Colors.textSecondary} />
              <Text style={[styles.tileText, selected && { color: Colors.text }]}>{option.title}</Text>
              {selected && (
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={12} color={Colors.onAccent} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Set a target (optional)</Text>
      <View style={styles.targetRow}>
        <Input
          label="Amount"
          icon="flag-outline"
          value={targetAmount ? `£${targetAmount}` : ''}
          onChangeText={(t) => setTargetAmount(formatAmount(t))}
          placeholder="£25,000"
          keyboardType="number-pad"
          containerStyle={styles.targetField}
        />
        <Input
          label="By"
          value={targetDate}
          onChangeText={(t) => {
            setTargetDate(formatDate(t));
            setDateError(null);
          }}
          placeholder="DD/MM/YYYY"
          keyboardType="number-pad"
          maxLength={10}
          containerStyle={styles.targetField}
        />
      </View>
      {dateError && <Text style={styles.error}>{dateError}</Text>}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 92,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'space-between',
  },
  tileSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  tilePressed: {
    transform: [{ scale: 0.98 }],
  },
  tileText: {
    ...Type.bodyStrong,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  check: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    ...Type.overline,
    marginTop: 32,
    marginBottom: 12,
  },
  targetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  targetField: {
    flex: 1,
  },
  error: {
    ...Type.caption,
    color: Colors.negative,
    marginTop: 8,
  },
  skip: {
    marginTop: 4,
  },
});
