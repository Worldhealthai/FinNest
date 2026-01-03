import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, Pressable, Animated } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useRef } from 'react';

function TabBarButton(props: any) {
  const scaleValue = useRef(new Animated.Value(1)).current;

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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        props.style,
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
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
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 70,
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
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xs,
          fontWeight: Typography.weights.semibold,
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 0 : 8,
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
