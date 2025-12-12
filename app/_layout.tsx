import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import SplashScreenComponent from '@/components/SplashScreen';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { Colors } from '@/constants/theme';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isOnboardingCompleted } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait a bit for the onboarding context to load
    const timeout = setTimeout(() => {
      const inOnboarding = segments[0] === '(onboarding)';

      if (!isOnboardingCompleted && !inOnboarding) {
        // User hasn't completed onboarding, redirect to onboarding
        router.replace('/(onboarding)/welcome');
      } else if (isOnboardingCompleted && inOnboarding) {
        // User completed onboarding but is in onboarding flow, redirect to tabs
        router.replace('/(tabs)');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isOnboardingCompleted, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.deepNavy },
      }}
    >
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading resources
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && splashFinished) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, splashFinished]);

  if (!appIsReady || !splashFinished) {
    return <SplashScreenComponent onFinish={() => setSplashFinished(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingProvider>
        <StatusBar style="light" backgroundColor={Colors.deepNavy} />
        <RootLayoutNav />
      </OnboardingProvider>
    </GestureHandlerRootView>
  );
}
