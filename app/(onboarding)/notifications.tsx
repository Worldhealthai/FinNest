import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import OnboardingStep from '@/components/OnboardingStep';
import { Button, ListGroup, ListItem, Toggle } from '@/components/ui';
import { Colors, Type } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { haptics } from '@/utils/haptics';
import {
  requestNotificationPermissions,
  saveNotificationSettings,
  sendTestNotification,
} from '@/utils/notificationService';

type Key = 'taxYearReminders' | 'contributionStreaks' | 'educationalTips';

const OPTIONS: { key: Key; icon: keyof typeof Ionicons.glyphMap; title: string; description: string }[] = [
  {
    key: 'taxYearReminders',
    icon: 'calendar-outline',
    title: 'Tax year reminders',
    description: 'A nudge before 5 April so no allowance goes to waste',
  },
  {
    key: 'contributionStreaks',
    icon: 'repeat-outline',
    title: 'Saving rhythm',
    description: 'A monthly check-in to keep your contributions regular',
  },
  {
    key: 'educationalTips',
    icon: 'bulb-outline',
    title: 'Tips & guides',
    description: 'Occasional short ISA tips — no spam',
  },
];

export default function NotificationsScreen() {
  const { userProfile, updateProfile, completeOnboarding } = useOnboarding();
  const [prefs, setPrefs] = useState<Record<Key, boolean>>({
    taxYearReminders: userProfile.notifications?.taxYearReminders ?? true,
    contributionStreaks: userProfile.notifications?.contributionStreaks ?? true,
    educationalTips: userProfile.notifications?.educationalTips ?? true,
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const finish = async (enabled: Record<Key, boolean>, askPermission: boolean) => {
    setIsCompleting(true);
    try {
      const hasPermission = askPermission ? await requestNotificationPermissions() : false;

      await saveNotificationSettings({
        pushNotifications: hasPermission,
        taxYearReminders: enabled.taxYearReminders,
        contributionStreaks: enabled.contributionStreaks,
        educationalTips: enabled.educationalTips,
        isaReminders: enabled.taxYearReminders,
        contributionAlerts: enabled.contributionStreaks,
        monthlySummaries: askPermission,
        emailNotifications: askPermission,
        marketingEmails: false,
      });

      updateProfile({ notifications: enabled });

      if (hasPermission) {
        await sendTestNotification();
      }

      haptics.success();
      await completeOnboarding();
      router.replace('/(tabs)');
    } finally {
      setIsCompleting(false);
    }
  };

  const anyEnabled = Object.values(prefs).some(Boolean);

  return (
    <OnboardingStep
      step={3}
      totalSteps={3}
      title="Stay on track"
      subtitle="Choose the reminders you'd like. You can change these any time in Profile."
      onBack={() => router.back()}
      footer={
        <>
          <Button
            title="Finish setup"
            onPress={() => finish(prefs, anyEnabled)}
            loading={isCompleting}
          />
          <Button
            title="Not now"
            variant="ghost"
            disabled={isCompleting}
            onPress={() =>
              finish({ taxYearReminders: false, contributionStreaks: false, educationalTips: false }, false)
            }
            style={styles.skip}
          />
        </>
      }
    >
      <ListGroup>
        {OPTIONS.map((o) => (
          <ListItem
            key={o.key}
            icon={o.icon}
            title={o.title}
            subtitle={o.description}
            right={
              <Toggle
                value={prefs[o.key]}
                onValueChange={(v) => setPrefs({ ...prefs, [o.key]: v })}
                accessibilityLabel={o.title}
              />
            }
          />
        ))}
      </ListGroup>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textTertiary} />
        <Text style={styles.noteText}>
          We'll ask your phone for permission to send notifications. Nothing is ever shared.
        </Text>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  noteText: {
    ...Type.caption,
    color: Colors.textTertiary,
    flex: 1,
  },
  skip: {
    marginTop: 4,
  },
});
