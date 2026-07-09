import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography } from '@/constants/theme';
import { useRef } from 'react';

// NOTE: `href` must NOT be spread onto the Pressable. On web, React Navigation
// passes href so tabs are links, and react-native-web renders any element with
// an href as a real <a> anchor. The default tab button calls preventDefault()
// to stop the browser's own link navigation; a raw Pressable doesn't — so every
// tab press triggered a full document load, rebooting the whole app (splash
// screen, lost state). Stripping href keeps navigation client-side only.
function TabBarButton({ href, onPress, ...props }: any) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePress = (e: any) => {
    // Belt-and-braces: block any default browser behavior before navigating
    e?.preventDefault?.();
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress?.(e);
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[{
        transform: [{ scale: scaleValue }],
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }]}>
        {props.children}
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.mediumGray,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 70,
          // On web, cap the floating pill's width and center it — stretching
          // edge-to-edge on desktop spreads the four tabs too far apart.
          ...Platform.select({
            web: {
              left: 0,
              right: 0,
              width: '100%',
              maxWidth: 560,
              marginHorizontal: 'auto',
              paddingHorizontal: 8,
            },
            default: {
              left: 20,
              right: 20,
            },
          }),
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: Colors.glassDark,
              borderRadius: 24,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255, 215, 0, 0.2)',
            }}
          />
        ),
        // Keep icon + label vertically centered as a tight column inside the
        // 70px pill — the previous stacked margins pushed labels to the edge.
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xs,
          fontWeight: Typography.weights.semibold,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      />
    </Tabs>
  );
}
