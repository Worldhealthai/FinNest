import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.deepNavy },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="account" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="knowledge" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
