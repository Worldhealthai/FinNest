import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground() {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotate.value}deg` }],
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
      <Animated.View style={[styles.orb1, animatedStyle]}>
        <LinearGradient
          colors={[Colors.gold + '40', Colors.gold + '00']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.orb2, animatedStyle]}>
        <LinearGradient
          colors={[Colors.info + '30', Colors.info + '00']}
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
  orbGradient: {
    flex: 1,
    borderRadius: 9999,
  },
});
