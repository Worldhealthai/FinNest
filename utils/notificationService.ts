import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
const NOTIFICATION_SETTINGS_KEY = '@finnest_notification_settings';
const PERMISSION_REQUESTED_KEY = '@finnest_notification_permission_requested';

// Notification settings interface
export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  isaReminders: boolean;
  contributionAlerts: boolean;
  monthlySummaries: boolean;
  marketingEmails: boolean;
  taxYearReminders: boolean;
  contributionStreaks: boolean;
  educationalTips: boolean;
}

// Default settings
export const defaultSettings: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  isaReminders: true,
  contributionAlerts: true,
  monthlySummaries: true,
  marketingEmails: false,
  taxYearReminders: true,
  contributionStreaks: true,
  educationalTips: true,
};

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only ask if permissions have not already been determined
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Mark that we've requested permission
    await AsyncStorage.setItem(PERMISSION_REQUESTED_KEY, 'true');

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Check if notification permissions have been requested before
 */
export async function hasRequestedPermissions(): Promise<boolean> {
  try {
    const requested = await AsyncStorage.getItem(PERMISSION_REQUESTED_KEY);
    return requested === 'true';
  } catch (error) {
    console.error('Error checking permission request status:', error);
    return false;
  }
}

/**
 * Get current notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settingsJson) {
      return { ...defaultSettings, ...JSON.parse(settingsJson) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return defaultSettings;
  }
}

/**
 * Save notification settings
 */
export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  try {
    const currentSettings = await getNotificationSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));

    // Re-schedule notifications based on new settings
    await scheduleNotifications(newSettings);
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Schedule all notifications based on settings
 */
export async function scheduleNotifications(settings: NotificationSettings): Promise<void> {
  try {
    // Cancel all existing notifications first
    await cancelAllNotifications();

    // Only schedule if push notifications are enabled
    if (!settings.pushNotifications) {
      return;
    }

    // Schedule ISA Tax Year Reminder (April 5th)
    if (settings.isaReminders && settings.taxYearReminders) {
      await scheduleISATaxYearReminder();
    }

    // Schedule monthly summaries
    if (settings.monthlySummaries) {
      await scheduleMonthlySummary();
    }

    // Schedule contribution alerts (check weekly)
    if (settings.contributionAlerts) {
      await scheduleContributionAlerts();
    }

    // Schedule educational tips (bi-weekly)
    if (settings.educationalTips) {
      await scheduleEducationalTips();
    }

    // Schedule contribution streak reminders (weekly)
    if (settings.contributionStreaks) {
      await scheduleContributionStreakReminder();
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
}

/**
 * Schedule ISA Tax Year Reminder for April 5th
 */
async function scheduleISATaxYearReminder(): Promise<void> {
  const now = new Date();
  const currentYear = now.getFullYear();

  // ISA tax year ends on April 5th
  let taxYearEnd = new Date(currentYear, 3, 5, 9, 0, 0); // April 5th at 9am

  // If we've already passed April 5th this year, schedule for next year
  if (now > taxYearEnd) {
    taxYearEnd = new Date(currentYear + 1, 3, 5, 9, 0, 0);
  }

  // Schedule reminder 2 weeks before tax year end
  const twoWeeksBefore = new Date(taxYearEnd);
  twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);

  if (twoWeeksBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🗓️ ISA Tax Year Ending Soon!',
        body: 'You have 2 weeks left to maximize your £20,000 ISA allowance for this tax year.',
        data: { type: 'tax_year_reminder' },
      },
      trigger: {
        date: twoWeeksBefore,
      },
    });
  }

  // Schedule reminder 1 week before tax year end
  const oneWeekBefore = new Date(taxYearEnd);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

  if (oneWeekBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ ISA Tax Year Ends in 1 Week!',
        body: 'Don\'t miss out! Use your remaining ISA allowance before April 5th.',
        data: { type: 'tax_year_reminder' },
      },
      trigger: {
        date: oneWeekBefore,
      },
    });
  }

  // Schedule reminder 1 day before tax year end
  const oneDayBefore = new Date(taxYearEnd);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);

  if (oneDayBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Last Chance for ISA Contributions!',
        body: 'Tomorrow is the last day to use your ISA allowance. Have you maxed out?',
        data: { type: 'tax_year_reminder' },
      },
      trigger: {
        date: oneDayBefore,
      },
    });
  }
}

/**
 * Schedule monthly summary notification
 */
async function scheduleMonthlySummary(): Promise<void> {
  // Schedule for the 1st of next month at 10am
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 10, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Your Monthly ISA Summary',
      body: 'Check out your ISA progress and see how much you\'ve saved this month!',
      data: { type: 'monthly_summary' },
    },
    trigger: {
      date: nextMonth,
      repeats: true,
    },
  });
}

/**
 * Schedule contribution alerts
 */
async function scheduleContributionAlerts(): Promise<void> {
  // Schedule a weekly check-in every Monday at 9am
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 Weekly Contribution Check-In',
      body: 'How are your ISA contributions going this week?',
      data: { type: 'contribution_alert' },
    },
    trigger: {
      weekday: 2, // Monday (1 = Sunday, 2 = Monday, etc.)
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

/**
 * Schedule educational tips
 */
async function scheduleEducationalTips(): Promise<void> {
  const tips = [
    'Did you know? You can hold multiple ISAs, but can only pay into one of each type per tax year.',
    'Pro tip: Stocks & Shares ISAs can offer higher returns than Cash ISAs, but come with more risk.',
    'Remember: ISA allowances reset every April 6th. Use it or lose it!',
    'Smart move: Consider spreading your ISA allowance across the tax year for better market timing.',
    'ISA fact: All gains and interest in an ISA are completely tax-free!',
  ];

  // Schedule bi-weekly tips (every other Thursday at 2pm)
  let scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + 7); // Start in a week

  for (let i = 0; i < tips.length; i++) {
    const tipDate = new Date(scheduleDate);
    tipDate.setDate(tipDate.getDate() + (i * 14)); // Every 2 weeks

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💡 ISA Tip of the Week',
        body: tips[i],
        data: { type: 'educational_tip', index: i },
      },
      trigger: {
        date: tipDate,
      },
    });
  }
}

/**
 * Schedule contribution streak reminder
 */
async function scheduleContributionStreakReminder(): Promise<void> {
  // Remind users about their streak every Saturday at 11am
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Keep Your Savings Streak Alive!',
      body: 'You\'re doing great! Keep up your contribution momentum.',
      data: { type: 'contribution_streak' },
    },
    trigger: {
      weekday: 7, // Saturday
      hour: 11,
      minute: 0,
      repeats: true,
    },
  });
}

/**
 * Send a test notification immediately
 */
export async function sendTestNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Notifications Enabled!',
        body: 'You\'ll receive helpful reminders about your ISA contributions and tax year deadlines.',
        data: { type: 'test' },
      },
      trigger: {
        seconds: 2,
      },
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}
