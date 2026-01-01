import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'analytics',
    title: 'Smart Tracking',
    description: 'Monitor all your ISAs in one place',
  },
  {
    icon: 'shield-checkmark',
    title: 'Secure & Tax-Free',
    description: 'Maximise your ISA allowance safely',
  },
  {
    icon: 'trending-up',
    title: 'Maximise Returns',
    description: 'Optimise your financial future',
  },
];

export default function WelcomeScreen() {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const featuresOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(30);
  const glowScale = useSharedValue(1);
  const ringRotate = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    logoScale.value = withSpring(1, { damping: 10, stiffness: 80 });
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Title animation
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 600 });
      titleY.value = withSpring(0, { damping: 12 });
    }, 400);

    // Features animation
    setTimeout(() => {
      featuresOpacity.value = withTiming(1, { duration: 600 });
    }, 800);

    // Button animation
    setTimeout(() => {
      buttonOpacity.value = withTiming(1, { duration: 600 });
      buttonY.value = withSpring(0, { damping: 12 });
    }, 1200);

    // Glow pulse
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Ring rotation
    ringRotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0A1929', Colors.deepNavy, '#1A2F4A', Colors.mediumNavy]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated rings */}
      <Animated.View style={[styles.ring, styles.ring1, ringAnimatedStyle]} />
      <Animated.View style={[styles.ring, styles.ring2, ringAnimatedStyle]} />

      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowAnimatedStyle]} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.hexagon1} />
            <View style={styles.hexagon2} />
            <Image
              source={require('@/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View style={titleAnimatedStyle}>
            <Text style={styles.title}>Welcome to FinNest</Text>
            <LinearGradient
              colors={Colors.goldGradient}
              style={styles.underline}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Text style={styles.subtitle}>One app. Every ISA. See your limits. Grow your future!</Text>
          </Animated.View>
        </View>

        {/* Features */}
        <Animated.View style={[styles.featuresContainer, featuresAnimatedStyle]}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.featureGradient}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={28} color={Colors.gold} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(onboarding)/login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.goldGradient}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={24} color={Colors.deepNavy} />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>Setup takes less than 2 minutes</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 9999,
    opacity: 0.1,
    alignSelf: 'center',
    top: height * 0.1,
  },
  ring1: {
    width: width * 1.2,
    height: width * 1.2,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
  },
  ring2: {
    width: width * 0.8,
    height: width * 0.8,
    borderColor: Colors.info,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.gold,
    opacity: 0.1,
    alignSelf: 'center',
    top: height * 0.15,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl + Spacing.md,
  },
  hexagon1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: Colors.gold + '60',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
  },
  hexagon2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderWidth: 1.5,
    borderColor: Colors.info + '40',
    borderRadius: 18,
    transform: [{ rotate: '45deg' }],
  },
  logoImage: {
    width: 100,
    height: 100,
    tintColor: Colors.gold,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: Colors.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  underline: {
    width: 80,
    height: 4,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: 2,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  featuresContainer: {
    gap: Spacing.lg,
    marginVertical: Spacing.xl,
  },
  featureCard: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  button: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.deepNavy,
    letterSpacing: 0.5,
  },
  footer: {
    fontSize: Typography.sizes.sm,
    color: Colors.lightGray,
    textAlign: 'center',
    marginTop: Spacing.md,
    opacity: 0.8,
  },
});
