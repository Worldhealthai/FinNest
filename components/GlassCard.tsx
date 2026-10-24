import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: 'light' | 'medium' | 'heavy' | 'dark';
  blur?: number;
}

/**
 * Legacy card used by older screens and modals. Renders the flat design-system
 * surface (see components/ui/Card for new code); `intensity` only picks between
 * the base and raised surface.
 */
export default function GlassCard({ children, style, intensity = 'medium' }: GlassCardProps) {
  return (
    <View style={[styles.container, intensity === 'heavy' ? styles.raised : styles.base, style]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  base: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  raised: {
    backgroundColor: Colors.surfaceRaised,
    borderColor: Colors.borderStrong,
  },
  inner: {
    padding: Spacing.md,
  },
});
