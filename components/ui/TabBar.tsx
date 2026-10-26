import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, TAB_BAR_HEIGHT } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

/**
 * Docked bottom tab bar. Items are plain Pressables (never anchors), so on web
 * a tab press can't trigger the browser's own link navigation and reload the
 * whole app — the bug the old custom tabBarButton had.
 */
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = typeof options.title === 'string' ? options.title : route.name;
          const color = focused ? Colors.accent : Colors.textTertiary;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              haptics.tap();
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              style={styles.item}
            >
              {({ pressed }) => (
                <>
                  <View style={[styles.indicator, focused && styles.indicatorActive, pressed && styles.indicatorPressed]}>
                    {options.tabBarIcon?.({ focused, color, size: 22 })}
                  </View>
                  <Text style={[styles.label, { color }, focused && styles.labelActive]} numberOfLines={1}>
                    {label}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderStrong,
  },
  inner: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorActive: {
    backgroundColor: Colors.accentMuted,
  },
  indicatorPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
  labelActive: {
    fontWeight: '600',
  },
});
