import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors, Type } from '@/constants/theme';

interface SplashScreenProps {
  onFinish?: () => void;
}

// Total time on screen before handing over to the app
const SPLASH_DURATION = 1800;
const EASE_OUT = Easing.out(Easing.cubic);

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.92);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(6);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500, easing: EASE_OUT });
    logoScale.value = withTiming(1, { duration: 600, easing: EASE_OUT });
    wordmarkOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: EASE_OUT }));
    wordmarkY.value = withDelay(200, withTiming(0, { duration: 500, easing: EASE_OUT }));

    const timer = setTimeout(() => onFinish?.(), SPLASH_DURATION);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));

  return (
    <View style={styles.container} accessibilityLabel="FinNest">
      <Animated.View style={logoStyle}>
        <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Animated.Text style={[styles.wordmark, wordmarkStyle]}>FinNest</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  logo: {
    width: 88,
    height: 88,
    tintColor: Colors.accent,
  },
  wordmark: {
    ...Type.title1,
    marginTop: 20,
    letterSpacing: 0.4,
  },
});
