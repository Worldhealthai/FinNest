import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '@/constants/theme';

interface Segment {
  value: number; // fraction of the whole bar, 0..1
  color: string;
}

interface ProgressBarProps {
  /** Fraction 0..1 (clamped). Ignored when `segments` is given. */
  value?: number;
  segments?: Segment[];
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

const clamp = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

/** Animated progress track; pass `segments` for a stacked breakdown bar. */
export default function ProgressBar({ value = 0, segments, color = Colors.accent, height = 8, style }: ProgressBarProps) {
  const parts = segments ?? [{ value, color }];
  const total = clamp(parts.reduce((s, p) => s + clamp(p.value), 0));
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: total,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [total]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <Animated.View style={[styles.fill, { width, borderRadius: height / 2 }]}>
        {parts.map((p, i) => {
          const share = total > 0 ? clamp(p.value) / total : 0;
          if (share <= 0) return null;
          return (
            <View
              key={i}
              style={{
                flex: share,
                backgroundColor: p.color,
                marginLeft: i > 0 ? 2 : 0,
              }}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.surfaceRaised,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
  },
});
