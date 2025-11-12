import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const ringRotate = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    logoScale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Title animation
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 600 });
      titleY.value = withSpring(0, { damping: 12 });
    }, 400);

    // Tagline animation
    setTimeout(() => {
      taglineOpacity.value = withTiming(1, { duration: 600 });
    }, 800);

    // Glow pulse
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Ring rotation
    ringRotate.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Finish splash after delay
    const timer = setTimeout(() => {
      if (onFinish) {
        runOnJS(onFinish)();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkNavy, Colors.deepNavy, Colors.mediumNavy]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated rings */}
      <Animated.View style={[styles.ring, styles.ring1, ringAnimatedStyle]} />
      <Animated.View style={[styles.ring, styles.ring2, ringAnimatedStyle]} />

      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowAnimatedStyle]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoCircle}>
          <Image source={require('@/assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
        <Text style={styles.title}>FinNest</Text>
        <View style={styles.underline} />
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
        <Text style={styles.tagline}>Smart Wealth Management</Text>
        <Text style={styles.taglineSecondary}>Your Financial Future, Secured</Text>
      </Animated.View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <LinearGradient
            colors={Colors.goldGradient}
            style={styles.loadingProgress}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 9999,
    opacity: 0.2,
  },
  ring1: {
    width: width * 0.8,
    height: width * 0.8,
    borderColor: Colors.gold,
  },
  ring2: {
    width: width * 0.6,
    height: width * 0.6,
    borderColor: Colors.info,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.gold,
    opacity: 0.2,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logoImage: {
    width: 120,
    height: 120,
    opacity: 0.9,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    letterSpacing: 2,
  },
  underline: {
    width: 80,
    height: 4,
    backgroundColor: Colors.gold,
    marginTop: Spacing.sm,
    borderRadius: 2,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  tagline: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  taglineSecondary: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.lightGray,
    opacity: 0.8,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.6,
  },
  loadingBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '70%',
    borderRadius: 2,
  },
});
