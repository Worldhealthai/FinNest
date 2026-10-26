import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import { ListGroup, ListItem, SectionHeader, Button, Toggle } from '@/components/ui';
import { Colors, Spacing, Type } from '@/constants/theme';
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

type Row = {
  key: keyof NotificationSettings;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Only meaningful while push notifications are on */
  needsPush?: boolean;
};

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'General',
    rows: [
      { key: 'pushNotifications', title: 'Push notifications', subtitle: 'Receive notifications on your device', icon: 'notifications-outline' },
      { key: 'emailNotifications', title: 'Email notifications', subtitle: 'Receive updates via email', icon: 'mail-outline' },
    ],
  },
  {
    title: 'ISA alerts',
    rows: [
      { key: 'isaReminders', title: 'ISA year reminders', subtitle: 'Reminders about ISA tax year deadlines', icon: 'calendar-outline', needsPush: true },
      { key: 'contributionAlerts', title: 'Contribution alerts', subtitle: "Notify when you're close to your allowance", icon: 'trending-up-outline', needsPush: true },
    ],
  },
  {
    title: 'Reports',
    rows: [
      { key: 'monthlySummaries', title: 'Monthly summaries', subtitle: 'Monthly overview of your ISA progress', icon: 'stats-chart-outline', needsPush: true },
    ],
  },
  {
    title: 'Marketing',
    rows: [
      { key: 'marketingEmails', title: 'Marketing emails', subtitle: 'Tips, features, and product updates', icon: 'megaphone-outline' },
    ],
  },
];

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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (visible) {
      setPermissionDenied(false);
      setTestSent(false);
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
        setPermissionDenied(true);
        return;
      }
      setHasPermission(true);
    }
    setPermissionDenied(false);

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

  const handleTest = async () => {
    await sendTestNotification();
    setTestSent(true);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Notifications" size="auto">
      {SECTIONS.map((section, i) => (
        <View key={section.title}>
          <SectionHeader title={section.title} style={i === 0 ? styles.firstHeader : undefined} />
          <ListGroup>
            {section.rows.map((row) => {
              const disabled = loading || (row.needsPush && !settings.pushNotifications);
              return (
                <ListItem
                  key={row.key}
                  icon={row.icon}
                  iconColor={Colors.textSecondary}
                  title={row.title}
                  subtitle={row.subtitle}
                  muted={!!row.needsPush && !settings.pushNotifications}
                  right={
                    <View style={styles.switch}>
                      <Toggle
                        value={settings[row.key]}
                        onValueChange={() => handleToggle(row.key)}
                        disabled={!!disabled}
                        accessibilityLabel={row.title}
                      />
                    </View>
                  }
                />
              );
            })}
          </ListGroup>
          {row0IsPush(section) && permissionDenied ? (
            <View style={styles.inlineMessage} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={14} color={Colors.caution} />
              <Text style={styles.inlineMessageText}>
                {Platform.OS === 'web'
                  ? "Push notifications aren't available in the web app."
                  : 'Please enable notifications in your device settings to receive alerts.'}
              </Text>
            </View>
          ) : null}
        </View>
      ))}

      <Text style={styles.footnote}>
        You can customize your notification preferences at any time. Important security alerts will always be sent
        regardless of these settings.
      </Text>

      {/* Test Notification Button */}
      {settings.pushNotifications && hasPermission && (
        <View style={styles.test}>
          <Button
            title={testSent ? 'Test notification sent' : 'Send test notification'}
            variant="secondary"
            size="md"
            icon={testSent ? 'checkmark' : 'paper-plane-outline'}
            onPress={handleTest}
          />
          {testSent ? <Text style={styles.testHint}>You should receive a notification in a few seconds.</Text> : null}
        </View>
      )}
    </Modal>
  );
}

const row0IsPush = (section: { rows: Row[] }) => section.rows[0]?.key === 'pushNotifications';

const styles = StyleSheet.create({
  firstHeader: {
    marginTop: Spacing.sm,
  },
  switch: {
    marginLeft: 12,
  },
  inlineMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  inlineMessageText: {
    ...Type.caption,
    flex: 1,
  },
  footnote: {
    ...Type.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
  },
  test: {
    marginTop: Spacing.lg,
  },
  testHint: {
    ...Type.caption,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
