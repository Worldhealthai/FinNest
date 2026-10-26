import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Screen backdrop. Previously three continuously animating gradient orbs (12
 * infinite animations per mounted screen); now a flat background, which keeps
 * the interface calm and saves battery. Kept as a component so older screens
 * that render it keep working.
 */
export default function AnimatedBackground() {
  return <View pointerEvents="none" style={styles.background} />;
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
  },
});
