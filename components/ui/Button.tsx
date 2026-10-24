import React from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const BG: Record<Variant, string> = {
  primary: Colors.accent,
  secondary: Colors.surfaceRaised,
  ghost: 'transparent',
  danger: Colors.negativeMuted,
};

const BG_PRESSED: Record<Variant, string> = {
  primary: Colors.accentPressed,
  secondary: Colors.surfacePressed,
  ghost: 'rgba(255, 255, 255, 0.04)',
  danger: 'rgba(248, 113, 113, 0.2)',
};

const FG: Record<Variant, string> = {
  primary: Colors.onAccent,
  secondary: Colors.text,
  ghost: Colors.accent,
  danger: Colors.negative,
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const inactive = disabled || loading;
  // A disabled primary turns neutral — translucent gold over navy reads olive
  const mutedPrimary = disabled && variant === 'primary';
  const fg = mutedPrimary ? Colors.textTertiary : FG[variant];

  return (
    <Pressable
      onPress={() => {
        haptics.impact();
        onPress();
      }}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: mutedPrimary ? Colors.surfaceRaised : pressed && !inactive ? BG_PRESSED[variant] : BG[variant] },
        variant === 'secondary' && styles.secondaryBorder,
        fullWidth && styles.fullWidth,
        inactive && !mutedPrimary && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={18} color={fg} style={styles.iconLeft} /> : null}
          <Text style={[styles.label, size === 'md' && styles.labelMd, { color: fg }]} numberOfLines={1}>
            {title}
          </Text>
          {iconRight ? <Ionicons name={iconRight} size={18} color={fg} style={styles.iconRight} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  lg: {
    height: 52,
  },
  md: {
    height: 42,
    paddingHorizontal: 16,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  inactive: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  labelMd: {
    fontSize: 15,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
