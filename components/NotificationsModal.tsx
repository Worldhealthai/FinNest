import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import GlassCard from './GlassCard';
import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  sendTestNotification,
  NotificationSettings,
} from '@/utils/notificationService';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    isaReminders: true,
    contributionAlerts: true,
    monthlySummaries: true,
    marketingEmails: false,
    taxYearReminders: true,
    contributionStreaks: true,
    educationalTips: true,
  });
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await getNotificationSettings();
      setSettings(savedSettings);

      // Check if we have notification permissions
      const granted = await requestNotificationPermissions();
      setHasPermission(granted);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationSettings) => {
    // If enabling push notifications and we don't have permission, request it
    if (key === 'pushNotifications' && !settings.pushNotifications && !hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive alerts.',
          [{ text: 'OK' }]
        );
        return;
      }
      setHasPermission(true);
    }

    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(newSettings);
    await saveNotificationSettings(newSettings);

    // If enabling push notifications, send a test notification
    if (key === 'pushNotifications' && !settings.pushNotifications) {
      await sendTestNotification();
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Notification Settings"
      icon="notifications-outline"
    >
      <View style={styles.container}>
        {/* Push Notifications */}
        <Text style={styles.sectionTitle}>General Notifications</Text>
        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.gold + '30' }]}>
                <Ionicons name="notifications" size={24} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Push Notifications</Text>
                <Text style={styles.optionDesc}>
                  Receive notifications on your device
                </Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => handleToggle('pushNotifications')}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={settings.pushNotifications ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
              disabled={loading}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.info + '30' }]}>
                <Ionicons name="mail" size={24} color={Colors.info} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Email Notifications</Text>
                <Text style={styles.optionDesc}>
                  Receive updates via email
                </Text>
              </View>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => handleToggle('emailNotifications')}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={settings.emailNotifications ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
              disabled={loading}
            />
          </View>
        </GlassCard>

        {/* ISA Specific Notifications */}
        <Text style={styles.sectionTitle}>ISA Alerts</Text>
        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.success + '30' }]}>
                <Ionicons name="calendar" size={24} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>ISA Year Reminders</Text>
                <Text style={styles.optionDesc}>
                  Reminders about ISA tax year deadlines
                </Text>
              </View>
            </View>
            <Switch
              value={settings.isaReminders}
              onValueChange={() => handleToggle('isaReminders')}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={settings.isaReminders ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
              disabled={loading || !settings.pushNotifications}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.warning + '30' }]}>
                <Ionicons name="trending-up" size={24} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Contribution Alerts</Text>
                <Text style={styles.optionDesc}>
                  Notify when you're close to your allowance
                </Text>
              </View>
            </View>
            <Switch
              value={settings.contributionAlerts}
              onValueChange={() => handleToggle('contributionAlerts')}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={settings.contributionAlerts ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
              disabled={loading || !settings.pushNotifications}
            />
          </View>
        </GlassCard>

        {/* Reports */}
        <Text style={styles.sectionTitle}>Reports & Summaries</Text>
        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.info + '30' }]}>
                <Ionicons name="stats-chart" size={24} color={Colors.info} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Monthly Summaries</Text>
                <Text style={styles.optionDesc}>
                  Monthly overview of your ISA progress
                </Text>
              </View>
            </View>
            <Switch
              value={settings.monthlySummaries}
              onValueChange={() => handleToggle('monthlySummaries')}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={settings.monthlySummaries ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
              disabled={loading || !settings.pushNotifications}
            />
          </View>
        </GlassCard>

        {/* Marketing */}
        <Text style={styles.sectionTitle}>Marketing</Text>
        <GlassCard style={styles.optionCard} intensity="medium">
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.mediumGray + '30' }]}>
                <Ionicons name="megaphone-outline" size={24} color={Colors.mediumGray} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Marketing Emails</Text>
                <Text style={styles.optionDesc}>
                  Tips, features, and product updates
                </Text>
              </View>
            </View>
            <Switch
              value={settings.marketingEmails}
              onValueChange={() => handleToggle('marketingEmails')}
              trackColor={{ false: Colors.mediumGray, true: Colors.gold + '60' }}
              thumbColor={settings.marketingEmails ? Colors.gold : Colors.lightGray}
              ios_backgroundColor={Colors.mediumGray}
              disabled={loading}
            />
          </View>
        </GlassCard>

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            You can customize your notification preferences at any time. Important security alerts will always be sent regardless of these settings.
          </Text>
        </View>

        {/* Test Notification Button */}
        {settings.pushNotifications && hasPermission && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              await sendTestNotification();
              Alert.alert('Test Notification Sent', 'You should receive a notification in a few seconds!');
            }}
          >
            <Ionicons name="paper-plane" size={20} color={Colors.gold} />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '20',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.info + '40',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold + '20',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  testButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.gold,
    fontWeight: Typography.weights.semibold,
  },
});
