import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface IconTileProps {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Rounded square with a tinted background — the standard leading icon. */
export default function IconTile({ name, color = Colors.accent, size = 40, style }: IconTileProps) {
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: color === Colors.accent ? Colors.accentMuted : tint(color),
        },
        style,
      ]}
    >
      <Ionicons name={name} size={Math.round(size * 0.5)} color={color} />
    </View>
  );
}

// ~14% alpha of a #RRGGBB colour; falls back to a neutral tint otherwise
export function tint(color: string, alphaHex = '24') {
  return /^#[0-9a-f]{6}$/i.test(color) ? color + alphaHex : 'rgba(255, 255, 255, 0.08)';
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
