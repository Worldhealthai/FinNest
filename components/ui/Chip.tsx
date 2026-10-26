import React from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
}

/** Selectable pill used for filters and single/multi-select options. */
export default function Chip({ label, selected = false, onPress, dotColor, style }: ChipProps) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.idle,
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <Text style={[styles.label, { color: selected ? Colors.accent : Colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  idle: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  selected: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accentBorder,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
