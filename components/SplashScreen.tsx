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
  withDelay,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

// Financial particle positions
const PARTICLES = [
  { x: '20%', y: '15%', icon: 'trending-up', delay: 0 },
  { x: '80%', y: '20%', icon: 'stats-chart', delay: 200 },
  { x: '15%', y: '80%', icon: 'pie-chart', delay: 400 },
  { x: '85%', y: '75%', icon: 'bar-chart', delay: 600 },
  { x: '50%', y: '10%', icon: 'cash', delay: 300 },
  { x: '10%', y: '50%', icon: 'wallet', delay: 500 },
  { x: '90%', y: '50%', icon: 'card', delay: 100 },
  { x: '50%', y: '90%', icon: 'shield-checkmark', delay: 700 },
];

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const ringRotate = useSharedValue(0);
  const particlesOpacity = useSharedValue(0);
  const scanLineY = useSharedValue(-height);
  const loadingProgress = useSharedValue(0);

  useEffect(() => {
    // Particles fade in
    particlesOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));

    // Animated loading bar - moves from 0% to 100%
    loadingProgress.value = withTiming(100, {
      duration: 3000,
      easing: Easing.inOut(Easing.ease)
    });

    // Scan line animation
    scanLineY.value = withDelay(
      300,
      withRepeat(
        withTiming(height * 2, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      )
    );

    // Logo animation with more dramatic effect
    logoScale.value = withDelay(
      400,
      withSpring(1, {
        damping: 8,
        stiffness: 80,
      })
    );
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 1000 }));

    // Title animation
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 600 });
      titleY.value = withSpring(0, { damping: 12 });
    }, 800);

    // Tagline animation
    setTimeout(() => {
      taglineOpacity.value = withTiming(1, { duration: 600 });
    }, 1200);

    // Glow pulse - more subtle and faster
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Ring rotation - slower for more elegance
    ringRotate.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Finish splash after delay
    const timer = setTimeout(() => {
      if (onFinish) {
        runOnJS(onFinish)();
      }
    }, 3500);

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

  const particlesAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
  }));

  const scanLineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const loadingProgressStyle = useAnimatedStyle(() => ({
    width: `${loadingProgress.value}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Dynamic gradient background */}
      <LinearGradient
        colors={['#0A1929', Colors.deepNavy, '#1A2F4A', Colors.mediumNavy]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Futuristic scan line */}
      <Animated.View style={[styles.scanLine, scanLineAnimatedStyle]} />

      {/* Animated rings - enhanced */}
      <Animated.View style={[styles.ring, styles.ring1, ringAnimatedStyle]} />
      <Animated.View style={[styles.ring, styles.ring2, ringAnimatedStyle]} />
      <Animated.View style={[styles.ring, styles.ring3, ringAnimatedStyle]} />

      {/* Financial particles */}
      <Animated.View style={[StyleSheet.absoluteFill, particlesAnimatedStyle]}>
        {PARTICLES.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
              },
            ]}
          >
            <Ionicons name={particle.icon as any} size={20} color={Colors.gold} />
          </Animated.View>
        ))}
      </Animated.View>

      {/* Glow effect - enhanced */}
      <Animated.View style={[styles.glow, glowAnimatedStyle]} />
      <Animated.View style={[styles.glow2, glowAnimatedStyle]} />

      {/* Logo with hexagon frame */}
      <View style={styles.logoFrame}>
        <View style={styles.hexagon1} />
        <View style={styles.hexagon2} />
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image source={require('@/assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>
      </View>

      {/* Title */}
      <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
        <Text style={styles.title}>FinNest</Text>
        <LinearGradient
          colors={Colors.goldGradient}
          style={styles.underline}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      {/* Tagline - enhanced */}
      <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
        <View style={styles.taglineRow}>
          <View style={styles.taglineDot} />
          <Text style={styles.tagline}>Smart ISA Management</Text>
          <View style={styles.taglineDot} />
        </View>
        <Text style={styles.taglineSecondary}>Your Financial Future, Secured</Text>
      </Animated.View>

      {/* Loading indicator - animated progress bar */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <Animated.View style={[styles.loadingProgressWrapper, loadingProgressStyle]}>
            <LinearGradient
              colors={[Colors.gold, '#FFD700', Colors.gold]}
              style={styles.loadingProgress}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
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
  // Scan line
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: Colors.gold,
    opacity: 0.3,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  // Rings
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 9999,
    opacity: 0.15,
  },
  ring1: {
    width: width * 0.9,
    height: width * 0.9,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
  },
  ring2: {
    width: width * 0.7,
    height: width * 0.7,
    borderColor: Colors.info,
  },
  ring3: {
    width: width * 0.5,
    height: width * 0.5,
    borderColor: Colors.success,
    borderStyle: 'dashed',
  },
  // Particles
  particle: {
    position: 'absolute',
    opacity: 0.4,
  },
  // Glow effects
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.gold,
    opacity: 0.15,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  glow2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.info,
    opacity: 0.1,
    shadowColor: Colors.info,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  // Logo with frame
  logoFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  hexagon1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: Colors.gold + '60',
    borderRadius: 25,
    transform: [{ rotate: '45deg' }],
  },
  hexagon2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: Colors.info + '40',
    borderRadius: 22,
    transform: [{ rotate: '45deg' }],
  },
  logoContainer: {
    zIndex: 10,
  },
  logoImage: {
    width: 140,
    height: 140,
    opacity: 1,
    tintColor: Colors.gold,
  },
  // Title
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: -60,
  },
  title: {
    fontSize: Typography.sizes.xxxl + 4,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    letterSpacing: 3,
    textShadowColor: Colors.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  underline: {
    width: 100,
    height: 4,
    marginTop: Spacing.sm,
    borderRadius: 2,
  },
  // Tagline
  taglineContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  tagline: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
    letterSpacing: 1,
  },
  taglineSecondary: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.lightGray,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  // Loading
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    width: width * 0.7,
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgressWrapper: {
    height: '100%',
  },
  loadingProgress: {
    height: '100%',
    width: '100%',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.3,
  },
});
