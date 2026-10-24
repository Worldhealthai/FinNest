import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'raised' | 'accent' | 'outline';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const VARIANTS: Record<NonNullable<CardProps['variant']>, ViewStyle> = {
  default: { backgroundColor: Colors.surface, borderColor: Colors.border },
  raised: { backgroundColor: Colors.surfaceRaised, borderColor: Colors.borderStrong },
  accent: { backgroundColor: Colors.accentMuted, borderColor: Colors.accentBorder },
  outline: { backgroundColor: 'transparent', borderColor: Colors.borderStrong },
};

export default function Card({
  children,
  onPress,
  variant = 'default',
  padded = true,
  style,
  accessibilityLabel,
}: CardProps) {
  const base = [styles.card, VARIANTS[variant], padded && styles.padded];

  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        base,
        pressed && { backgroundColor: Colors.surfacePressed, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: 20,
  },
});
