import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

type ISAExperience = 'new' | 'some' | 'experienced';

const EXPERIENCE_OPTIONS = [
  {
    value: 'new' as ISAExperience,
    icon: 'help-circle',
    title: 'New to ISAs',
    description: 'I want to learn about ISAs and how they work',
  },
  {
    value: 'some' as ISAExperience,
    icon: 'book',
    title: 'Some Knowledge',
    description: 'I know the basics but want to learn more',
  },
  {
    value: 'experienced' as ISAExperience,
    icon: 'school',
    title: 'Experienced',
    description: "I'm familiar with ISAs and their benefits",
  },
];

export default function KnowledgeScreen() {
  const { userProfile, updateProfile } = useOnboarding();
  const [isaExperience, setIsaExperience] = useState<ISAExperience | null>(
    userProfile.isaExperience || null
  );
  const [hasExistingISAs, setHasExistingISAs] = useState<boolean | null>(
    userProfile.hasExistingISAs ?? null
  );

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

  const handleContinue = () => {
    if (isaExperience && hasExistingISAs !== null) {
      updateProfile({ isaExperience, hasExistingISAs });
      router.push('/(onboarding)/goals');
    }
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
                    style={[styles.progress, { width: '50%' }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressText}>Step 3 of 6</Text>
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.05)']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="bulb" size={32} color={Colors.gold} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>ISA Knowledge</Text>
              <Text style={styles.subtitle}>
                Help us tailor your experience based on your familiarity with ISAs
              </Text>
            </View>

            {/* Experience Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's your ISA experience level?</Text>

              <View style={styles.optionsContainer}>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionCard,
                      isaExperience === option.value && styles.optionCardSelected,
                    ]}
                    onPress={() => setIsaExperience(option.value)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isaExperience === option.value
                          ? ['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']
                          : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                      }
                      style={styles.optionGradient}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          isaExperience === option.value && styles.optionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={28}
                          color={
                            isaExperience === option.value
                              ? Colors.gold
                              : Colors.lightGray
                          }
                        />
                      </View>
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionTitle,
                            isaExperience === option.value && styles.optionTitleSelected,
                          ]}
                        >
                          {option.title}
                        </Text>
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      </View>
                      {isaExperience === option.value && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={24} color={Colors.gold} />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Existing ISAs Question */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Do you have existing ISA accounts?</Text>

              <View style={styles.yesNoContainer}>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    hasExistingISAs === true && styles.yesNoButtonSelected,
                  ]}
                  onPress={() => setHasExistingISAs(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      hasExistingISAs === true
                        ? ['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']
                        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                    }
                    style={styles.yesNoGradient}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={32}
                      color={hasExistingISAs === true ? Colors.gold : Colors.lightGray}
                    />
                    <Text
                      style={[
                        styles.yesNoText,
                        hasExistingISAs === true && styles.yesNoTextSelected,
                      ]}
                    >
                      Yes
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    hasExistingISAs === false && styles.yesNoButtonSelected,
                  ]}
                  onPress={() => setHasExistingISAs(false)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      hasExistingISAs === false
                        ? ['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']
                        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                    }
                    style={styles.yesNoGradient}
                  >
                    <Ionicons
                      name="close-circle"
                      size={32}
                      color={hasExistingISAs === false ? Colors.gold : Colors.lightGray}
                    />
                    <Text
                      style={[
                        styles.yesNoText,
                        hasExistingISAs === false && styles.yesNoTextSelected,
                      ]}
                    >
                      No
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {hasExistingISAs === false && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                  <Text style={styles.infoText}>
                    Great! We'll help you get started with your first ISA account.
                  </Text>
                </View>
              )}

              {hasExistingISAs === true && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                  <Text style={styles.infoText}>
                    Perfect! You can track all your ISAs in one place with FinNest.
                  </Text>
                </View>
              )}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (!isaExperience || hasExistingISAs === null) && styles.buttonDisabled,
              ]}
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={!isaExperience || hasExistingISAs === null}
            >
              <LinearGradient
                colors={
                  isaExperience && hasExistingISAs !== null
                    ? Colors.goldGradient
                    : ['#666', '#555']
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.deepNavy} />
              </LinearGradient>
            </TouchableOpacity>
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
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionIconSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.gold,
  },
  optionDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  checkmark: {
    marginLeft: Spacing.sm,
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  yesNoButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  yesNoButtonSelected: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  yesNoGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: Spacing.sm,
  },
  yesNoText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  yesNoTextSelected: {
    color: Colors.gold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 18,
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
});
