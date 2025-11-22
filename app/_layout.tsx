import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import SplashScreenComponent from '@/components/SplashScreen';
import { Colors } from '@/constants/theme';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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
      <StatusBar style="light" backgroundColor={Colors.deepNavy} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.deepNavy },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
