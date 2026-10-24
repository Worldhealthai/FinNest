import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '@/constants/theme';

type Tone = 'neutral' | 'accent' | 'positive' | 'caution' | 'negative';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: 'rgba(255, 255, 255, 0.08)', fg: Colors.textSecondary },
  accent: { bg: Colors.accentMuted, fg: Colors.accent },
  positive: { bg: Colors.positiveMuted, fg: Colors.positive },
  caution: { bg: Colors.cautionMuted, fg: Colors.caution },
  negative: { bg: Colors.negativeMuted, fg: Colors.negative },
};

export default function Badge({ label, tone = 'neutral', style }: { label: string; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      <Text style={[styles.text, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
