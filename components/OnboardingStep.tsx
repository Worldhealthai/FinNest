import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Type, Spacing } from '@/constants/theme';

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Pinned under the content — the step's primary (and optional skip) action. */
  footer: React.ReactNode;
  children: React.ReactNode;
}

/** Shared frame for the post-signup setup steps. */
export default function OnboardingStep({
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
  footer,
  children,
}: OnboardingStepProps) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.text} />
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          <View style={styles.progress} accessibilityLabel={`Step ${step} of ${totalSteps}`}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <View key={i} style={[styles.segment, i < step && styles.segmentDone]} />
            ))}
          </View>
          <Text style={styles.stepText}>
            {step}/{totalSteps}
          </Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.body}>{children}</View>
        </ScrollView>

        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Spacing.sm,
    height: 52,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 8,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceRaised,
  },
  segmentDone: {
    backgroundColor: Colors.accent,
  },
  stepText: {
    ...Type.caption,
    ...Type.number,
    width: 40,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: {
    ...Type.title1,
  },
  subtitle: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  body: {
    marginTop: Spacing.xl,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Spacing.md,
    gap: 4,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
});
