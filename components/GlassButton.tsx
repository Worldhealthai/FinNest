import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false
}: GlassButtonProps) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.container, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Colors.goldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.container, styles.secondaryContainer, style]}
        activeOpacity={0.8}
      >
        <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <BlurView intensity={30} style={styles.glassContainer}>
        <Text style={[styles.glassText, textStyle]}>{title}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  gradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: Colors.deepNavy,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.lg - 2,
  },
  secondaryText: {
    color: Colors.gold,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  glassContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.glassLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },
});
