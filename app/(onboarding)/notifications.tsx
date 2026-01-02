import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  requestNotificationPermissions,
  saveNotificationSettings,
  sendTestNotification,
} from '@/utils/notificationService';

const NOTIFICATION_OPTIONS = [
  {
    key: 'taxYearReminders' as const,
    icon: 'calendar',
    title: 'Tax Year Reminders',
    description: 'Get notified before the tax year ends to maximise your ISA allowance',
    color: Colors.gold,
  },
  {
    key: 'contributionStreaks' as const,
    icon: 'flame',
    title: 'Contribution Streaks',
    description: 'Track your savings momentum and celebrate milestones',
    color: '#FF6B6B',
  },
  {
    key: 'educationalTips' as const,
    icon: 'bulb',
    title: 'Educational Tips',
    description: 'Learn ISA strategies and financial planning advice',
    color: Colors.info,
  },
];

export default function NotificationsScreen() {
  const { userProfile, updateProfile, completeOnboarding } = useOnboarding();
  const [notifications, setNotifications] = useState({
    taxYearReminders: userProfile.notifications?.taxYearReminders ?? true,
    contributionStreaks: userProfile.notifications?.contributionStreaks ?? true,
    educationalTips: userProfile.notifications?.educationalTips ?? true,
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);
  const celebrationScale = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentY.value = withSpring(0, { damping: 12 });
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationScale.value,
  }));

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    // Show celebration animation
    celebrationScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );

    // Request notification permissions
    const hasPermission = await requestNotificationPermissions();

    if (!hasPermission) {
      Alert.alert(
        'Notification Permission',
        'Notifications are disabled. You can enable them later in Settings to get ISA reminders.',
        [{ text: 'OK' }]
      );
    }

    // Save notification settings
    await saveNotificationSettings({
      pushNotifications: hasPermission,
      taxYearReminders: notifications.taxYearReminders,
      contributionStreaks: notifications.contributionStreaks,
      educationalTips: notifications.educationalTips,
      isaReminders: notifications.taxYearReminders,
      contributionAlerts: notifications.contributionStreaks,
      monthlySummaries: true,
      emailNotifications: true,
      marketingEmails: false,
    });

    // Update profile with notifications
    updateProfile({ notifications });

    // Send test notification if permission granted
    if (hasPermission) {
      await sendTestNotification();
    }

    // Wait a bit for animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Complete onboarding
    await completeOnboarding();

    // Navigate to main app
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    // Save all notifications as disabled
    await saveNotificationSettings({
      pushNotifications: false,
      taxYearReminders: false,
      contributionStreaks: false,
      educationalTips: false,
      isaReminders: false,
      contributionAlerts: false,
      monthlySummaries: false,
      emailNotifications: false,
      marketingEmails: false,
    });

    // Set all notifications to false
    updateProfile({
      notifications: {
        taxYearReminders: false,
        contributionStreaks: false,
        educationalTips: false,
      },
    });

    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0A1929', Colors.deepNavy, Colors.mediumNavy]}
        style={styles.gradient}
      />

      {/* Celebration Confetti Effect */}
      <Animated.View style={[styles.celebration, celebrationAnimatedStyle]}>
        <Ionicons name="sparkles" size={100} color={Colors.gold} />
      </Animated.View>

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
                    style={[styles.progress, { width: '80%' }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressText}>Step 4 of 5</Text>
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.05)']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="notifications" size={32} color={Colors.gold} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Stay Informed</Text>
              <Text style={styles.subtitle}>
                Choose which notifications help you reach your financial goals
              </Text>
            </View>

            {/* Notification Options */}
            <View style={styles.section}>
              {NOTIFICATION_OPTIONS.map((option) => (
                <View key={option.key} style={styles.notificationCard}>
                  <LinearGradient
                    colors={
                      notifications[option.key]
                        ? ['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']
                        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                    }
                    style={styles.notificationGradient}
                  >
                    <View
                      style={[
                        styles.notificationIcon,
                        {
                          backgroundColor: notifications[option.key]
                            ? option.color + '30'
                            : 'rgba(255, 255, 255, 0.1)',
                        },
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={notifications[option.key] ? option.color : Colors.lightGray}
                      />
                    </View>

                    <View style={styles.notificationContent}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          notifications[option.key] && { color: Colors.gold },
                        ]}
                      >
                        {option.title}
                      </Text>
                      <Text style={styles.notificationDescription}>
                        {option.description}
                      </Text>
                    </View>

                    <Switch
                      value={notifications[option.key]}
                      onValueChange={() => toggleNotification(option.key)}
                      trackColor={{
                        false: Colors.mediumGray,
                        true: Colors.gold,
                      }}
                      thumbColor={Colors.white}
                      ios_backgroundColor={Colors.mediumGray}
                    />
                  </LinearGradient>
                </View>
              ))}
            </View>

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
              <Text style={styles.privacyText}>
                You can change these preferences anytime in Settings. We respect your
                privacy and never send spam.
              </Text>
            </View>

            {/* Completion Message */}
            <View style={styles.completionBox}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']}
                style={styles.completionGradient}
              >
                <Ionicons name="checkmark-circle" size={40} color={Colors.gold} />
                <Text style={styles.completionTitle}>Almost There!</Text>
                <Text style={styles.completionText}>
                  You're all set to start managing your ISAs with FinNest
                </Text>
              </LinearGradient>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleComplete}
                activeOpacity={0.8}
                disabled={isCompleting}
              >
                <LinearGradient
                  colors={Colors.goldGradient}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isCompleting ? (
                    <>
                      <Text style={styles.buttonText}>Setting Up...</Text>
                      <Ionicons name="hourglass" size={20} color={Colors.deepNavy} />
                    </>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Complete Setup</Text>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.deepNavy} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSkip}
                style={styles.skipButton}
                disabled={isCompleting}
              >
                <Text style={styles.skipText}>Skip Notifications</Text>
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
  celebration: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
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
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  notificationCard: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  notificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  notificationTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    lineHeight: 16,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(91, 155, 213, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  privacyText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  completionBox: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  completionGradient: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.gold + '40',
  },
  completionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.gold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  completionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 20,
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
