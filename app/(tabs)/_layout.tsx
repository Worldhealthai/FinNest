import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import TabBar from '@/components/ui/TabBar';

type IconName = keyof typeof Ionicons.glyphMap;

// Outline icon when idle, filled when the tab is active
const tabIcon = (active: IconName, idle: IconName) =>
  ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons name={focused ? active : idle} size={size} color={color} />
  );

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="analytics" options={{ title: 'Insights', tabBarIcon: tabIcon('pie-chart', 'pie-chart-outline') }} />
      <Tabs.Screen name="hub" options={{ title: 'Learn', tabBarIcon: tabIcon('book', 'book-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
