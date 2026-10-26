import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Type, BorderRadius } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: string;
  showCloseButton?: boolean;
  /** 'full' (default) is a tall sheet; 'auto' sizes to its content. */
  size?: 'full' | 'auto';
  /** Pinned below the scroll area — use for the sheet's primary action. */
  footer?: React.ReactNode;
}

/** Bottom sheet used by every app modal. */
export default function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  size = 'full',
  footer,
}: ModalProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxHeight = height * 0.9;

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* KeyboardAvoidingView lifts the sheet above the iOS keyboard so inputs
          near the bottom stay visible while typing */}
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />

        <View style={[styles.sheet, size === 'full' ? { height: maxHeight } : { maxHeight }]}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {showCloseButton && (
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>

          <ScrollView
            style={size === 'full' ? styles.scrollFull : undefined}
            contentContainerStyle={[styles.scrollContent, !footer && { paddingBottom: insets.bottom + Spacing.xl }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {children}
          </ScrollView>

          {footer ? (
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>{footer}</View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Type.title2,
  },
  subtitle: {
    ...Type.callout,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  scrollFull: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderStrong,
    backgroundColor: Colors.background,
  },
});
