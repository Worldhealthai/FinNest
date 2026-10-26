import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, BorderRadius, Type, Spacing } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

export interface SheetAction {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  description?: string;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: SheetAction[];
  cancelLabel?: string;
}

/**
 * Cross-platform action sheet / confirmation. Replaces Alert.alert button
 * prompts, which are a silent no-op on web.
 */
export default function ActionSheet({
  visible,
  onClose,
  title,
  message,
  actions,
  cancelLabel = 'Cancel',
}: ActionSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <View style={styles.grabber} />
          {title || message ? (
            <View style={styles.header}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}
            </View>
          ) : null}
          <View style={[styles.group, actions.length === 0 && { display: 'none' }]}>
            {actions.map((action, i) => (
              <Pressable
                key={action.label}
                onPress={() => {
                  if (action.destructive) haptics.warning();
                  else haptics.tap();
                  onClose();
                  action.onPress();
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.action, i > 0 && styles.actionDivider, pressed && styles.pressed]}
              >
                {action.icon ? (
                  <Ionicons
                    name={action.icon}
                    size={20}
                    color={action.destructive ? Colors.negative : Colors.text}
                    style={styles.actionIcon}
                  />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionLabel, action.destructive && { color: Colors.negative }]}>
                    {action.label}
                  </Text>
                  {action.description ? <Text style={styles.actionDescription}>{action.description}</Text> : null}
                </View>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cancel, actions.length === 0 && { marginTop: 0 }, pressed && styles.pressed]}
          >
            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    marginBottom: Spacing.md,
  },
  header: {
    paddingHorizontal: 4,
    marginBottom: Spacing.md,
  },
  title: {
    ...Type.headline,
  },
  message: {
    ...Type.callout,
    marginTop: 6,
  },
  group: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderStrong,
  },
  actionIcon: {
    marginRight: 14,
  },
  actionLabel: {
    ...Type.bodyStrong,
  },
  actionDescription: {
    ...Type.caption,
    marginTop: 2,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancel: {
    marginTop: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelLabel: {
    ...Type.bodyStrong,
    color: Colors.textSecondary,
  },
});
