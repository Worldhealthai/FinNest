import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground() {
  // Orb 1 animations
  const rotate1 = useSharedValue(0);
  const translateX1 = useSharedValue(0);
  const translateY1 = useSharedValue(0);
  const scale1 = useSharedValue(1);

  // Orb 2 animations
  const rotate2 = useSharedValue(0);
  const translateX2 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const scale2 = useSharedValue(1);

  // Orb 3 animations (new orb)
  const rotate3 = useSharedValue(0);
  const translateX3 = useSharedValue(0);
  const translateY3 = useSharedValue(0);
  const scale3 = useSharedValue(1);

  useEffect(() => {
    // Orb 1: Rotate + Float horizontally + Pulse
    rotate1.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    translateX1.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    translateY1.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-40, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    scale1.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Orb 2: Rotate + Float vertically + Pulse (different timing)
    rotate2.value = withRepeat(
      withTiming(-360, {
        duration: 25000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    translateX2.value = withRepeat(
      withSequence(
        withTiming(-40, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
        withTiming(60, { duration: 10000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    translateY2.value = withRepeat(
      withSequence(
        withTiming(-50, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
        withTiming(40, { duration: 7000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    scale2.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.05, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Orb 3: Rotate + Circular movement + Pulse
    rotate3.value = withRepeat(
      withTiming(360, {
        duration: 30000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    translateX3.value = withRepeat(
      withSequence(
        withTiming(70, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-50, { duration: 12000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    translateY3.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
        withTiming(50, { duration: 9000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    scale3.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const orb1AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX1.value },
        { translateY: translateY1.value },
        { rotate: `${rotate1.value}deg` },
        { scale: scale1.value },
      ],
    };
  });

  const orb2AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX2.value },
        { translateY: translateY2.value },
        { rotate: `${rotate2.value}deg` },
        { scale: scale2.value },
      ],
    };
  });

  const orb3AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX3.value },
        { translateY: translateY3.value },
        { rotate: `${rotate3.value}deg` },
        { scale: scale3.value },
      ],
    };
  });

  return (
    <>
      <LinearGradient
        colors={[Colors.darkNavy, Colors.deepNavy, Colors.mediumNavy]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[styles.orb1, orb1AnimatedStyle]}>
        <LinearGradient
          colors={['#1E3A5F40', '#4A90E220']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.orb2, orb2AnimatedStyle]}>
        <LinearGradient
          colors={['#2B4F7E30', '#1E3A5F00']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.orb3, orb3AnimatedStyle]}>
        <LinearGradient
          colors={['#FFD70015', '#4A90E215']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  orb1: {
    position: 'absolute',
    top: -height * 0.3,
    right: -width * 0.3,
    width: width * 1.2,
    height: width * 1.2,
  },
  orb2: {
    position: 'absolute',
    bottom: -height * 0.2,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
  },
  orb3: {
    position: 'absolute',
    top: height * 0.4,
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
  },
  orbGradient: {
    flex: 1,
    borderRadius: 9999,
  },
});
