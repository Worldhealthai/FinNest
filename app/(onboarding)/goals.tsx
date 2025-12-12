import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type GoalType = 'first_home' | 'retirement' | 'emergency' | 'education' | 'general' | 'other';

const GOAL_OPTIONS = [
  {
    value: 'first_home' as GoalType,
    icon: 'home',
    title: 'First Home',
    description: 'Saving for my first property purchase',
    color: Colors.success,
  },
  {
    value: 'retirement' as GoalType,
    icon: 'sunny',
    title: 'Retirement',
    description: 'Building a nest egg for the future',
    color: Colors.gold,
  },
  {
    value: 'emergency' as GoalType,
    icon: 'shield-checkmark',
    title: 'Emergency Fund',
    description: 'Creating a financial safety net',
    color: Colors.info,
  },
  {
    value: 'education' as GoalType,
    icon: 'school',
    title: 'Education',
    description: 'Funding education expenses',
    color: '#9B59B6',
  },
  {
    value: 'general' as GoalType,
    icon: 'trending-up',
    title: 'General Savings',
    description: 'Growing my wealth over time',
    color: '#3498DB',
  },
  {
    value: 'other' as GoalType,
    icon: 'ellipsis-horizontal',
    title: 'Other',
    description: 'Custom savings goal',
    color: Colors.mediumGray,
  },
];

export default function GoalsScreen() {
  const { userProfile, updateProfile } = useOnboarding();
  const [savingsGoal, setSavingsGoal] = useState<GoalType | null>(
    userProfile.savingsGoal || null
  );
  const [targetAmount, setTargetAmount] = useState(
    userProfile.targetAmount?.toString() || ''
  );
  const [targetDate, setTargetDate] = useState(userProfile.targetDate || '');

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentY.value = withSpring(0, { damping: 12 });
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const formatCurrency = (text: string) => {
    const numbers = text.replace(/[^0-9]/g, '');
    if (!numbers) return '';

    const number = parseInt(numbers);
    return number.toLocaleString('en-GB');
  };

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += cleaned[i];
    }
    return formatted;
  };

  const handleContinue = () => {
    if (savingsGoal) {
      updateProfile({
        savingsGoal,
        targetAmount: parseInt(targetAmount.replace(/,/g, '')) || 0,
        targetDate: targetDate || '',
      });
      router.push('/(onboarding)/notifications');
    }
  };

  const handleSkip = () => {
    router.push('/(onboarding)/notifications');
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0A1929', Colors.deepNavy, Colors.mediumNavy]}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={contentAnimatedStyle}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={Colors.goldGradient}
                    style={[styles.progress, { width: '66%' }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressText}>Step 4 of 6</Text>
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.05)']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="flag" size={32} color={Colors.gold} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Set Your Goal</Text>
              <Text style={styles.subtitle}>
                Define your savings objectives to personalize your experience
              </Text>
            </View>

            {/* Goals Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What are you saving for?</Text>

              <View style={styles.goalsGrid}>
                {GOAL_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.goalCard,
                      savingsGoal === option.value && styles.goalCardSelected,
                    ]}
                    onPress={() => setSavingsGoal(option.value)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        savingsGoal === option.value
                          ? ['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']
                          : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                      }
                      style={styles.goalGradient}
                    >
                      <View
                        style={[
                          styles.goalIcon,
                          {
                            backgroundColor:
                              savingsGoal === option.value
                                ? option.color + '30'
                                : 'rgba(255, 255, 255, 0.1)',
                          },
                        ]}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={24}
                          color={savingsGoal === option.value ? option.color : Colors.lightGray}
                        />
                      </View>
                      <Text
                        style={[
                          styles.goalTitle,
                          savingsGoal === option.value && { color: Colors.gold },
                        ]}
                      >
                        {option.title}
                      </Text>
                      {savingsGoal === option.value && (
                        <View style={styles.selectedBadge}>
                          <Ionicons name="checkmark" size={16} color={Colors.deepNavy} />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Optional Details */}
            {savingsGoal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Target Details <Text style={styles.optional}>(Optional)</Text>
                </Text>

                {/* Target Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Target Amount (£)</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="cash-outline" size={20} color={Colors.gold} />
                    <Text style={styles.currencySymbol}>£</Text>
                    <TextInput
                      style={styles.input}
                      value={targetAmount}
                      onChangeText={(text) => setTargetAmount(formatCurrency(text))}
                      placeholder="0"
                      placeholderTextColor={Colors.mediumGray}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Target Date */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Target Date</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.gold} />
                    <TextInput
                      style={styles.input}
                      value={targetDate}
                      onChangeText={(text) => setTargetDate(formatDate(text))}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={Colors.mediumGray}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                  <Text style={styles.infoText}>
                    Setting targets helps you stay motivated and track progress toward your
                    goals.
                  </Text>
                </View>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, !savingsGoal && styles.buttonDisabled]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={!savingsGoal}
              >
                <LinearGradient
                  colors={savingsGoal ? Colors.goldGradient : ['#666', '#555']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.deepNavy} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip for Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: Spacing.md,
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold + '40',
  },
  title: {
    fontSize: Typography.sizes.xxl + 4,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textShadowColor: Colors.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  optional: {
    fontSize: Typography.sizes.sm,
    color: Colors.mediumGray,
    fontWeight: Typography.weights.medium,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  goalCard: {
    width: '48%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  goalCardSelected: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  goalGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 120,
    justifyContent: 'center',
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  goalTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  currencySymbol: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.deepNavy,
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gold,
    fontWeight: Typography.weights.semibold,
  },
});
