import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { Colors, Type, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/contexts/OnboardingContext';

const POINTS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'pie-chart-outline', text: 'See exactly how much of your £20,000 allowance is left' },
  { icon: 'layers-outline', text: 'Cash, Stocks & Shares, Lifetime and IF ISAs in one place' },
  { icon: 'notifications-outline', text: 'Reminders before the 5 April deadline' },
];

export default function WelcomeScreen() {
  const { continueAsGuest } = useOnboarding();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }).start();
  }, []);

  // On web the marketing landing page (rendered by the login route) is the front door
  if (Platform.OS === 'web') {
    return <Redirect href="/(onboarding)/login" />;
  }

  const goToAuth = (mode: 'signup' | 'login') => router.push({ pathname: '/(onboarding)/login', params: { mode } });

  const exploreAsGuest = async () => {
    await continueAsGuest();
    router.replace('/(tabs)');
  };

  const translateY = fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Animated.View style={[styles.hero, { opacity: fade, transform: [{ translateY }] }]}>
        <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.wordmark}>FinNest</Text>
        <Text style={styles.headline}>Every ISA.{'\n'}One nest.</Text>
        <Text style={styles.subhead}>The simple way to track your tax-free allowance across every ISA you hold.</Text>

        <View style={styles.points}>
          {POINTS.map((p) => (
            <View key={p.text} style={styles.point}>
              <View style={styles.pointIcon}>
                <Ionicons name={p.icon} size={18} color={Colors.accent} />
              </View>
              <Text style={styles.pointText}>{p.text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.actions}>
        <Button title="Create free account" onPress={() => goToAuth('signup')} />
        <Button title="I already have an account" variant="secondary" onPress={() => goToAuth('login')} />
        <Pressable onPress={exploreAsGuest} hitSlop={8} accessibilityRole="button" style={styles.guest}>
          {({ pressed }) => (
            <Text style={[styles.guestText, pressed && { opacity: 0.6 }]}>Explore without an account</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    tintColor: Colors.accent,
  },
  wordmark: {
    ...Type.overline,
    color: Colors.accent,
    marginTop: 12,
  },
  headline: {
    ...Type.display,
    fontSize: 44,
    lineHeight: 50,
    marginTop: Spacing.lg,
  },
  subhead: {
    ...Type.body,
    fontSize: 17,
    lineHeight: 25,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  points: {
    marginTop: Spacing.xl,
    gap: 16,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: {
    ...Type.body,
    flex: 1,
  },
  actions: {
    gap: 12,
    paddingBottom: Spacing.md,
  },
  guest: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
