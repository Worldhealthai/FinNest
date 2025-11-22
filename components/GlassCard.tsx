import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'heavy' | 'dark';
  blur?: number;
}

export default function GlassCard({
  children,
  style,
  intensity = 'medium',
  blur = 20
}: GlassCardProps) {
  const intensityStyles = {
    light: styles.glassLight,
    medium: styles.glassMedium,
    heavy: styles.glassHeavy,
    dark: styles.glassDark,
  };

  return (
    <View style={[styles.container, intensityStyles[intensity], style]}>
      <BlurView intensity={blur} style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  blur: {
    padding: Spacing.md,
  },
  glassLight: {
    backgroundColor: Colors.glassLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassMedium: {
    backgroundColor: Colors.glassMedium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassHeavy: {
    backgroundColor: Colors.glassHeavy,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassDark: {
    backgroundColor: Colors.glassDark,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
});
