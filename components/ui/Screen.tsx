import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Type } from '@/constants/theme';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Inside the tab navigator (default true): the docked tab bar already
   *  covers the bottom safe area, so the screen doesn't pad for it. */
  withTabBar?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  overlay?: React.ReactNode;
}

/**
 * Standard page shell: flat background, safe-area aware, a consistent header,
 * and scroll content capped at a readable width on large (web) screens.
 */
export default function Screen({
  title,
  subtitle,
  eyebrow,
  right,
  children,
  refreshing,
  onRefresh,
  withTabBar = true,
  contentStyle,
  overlay,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = (withTabBar ? 0 : insets.bottom) + Spacing.xxl;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.accent}
                colors={[Colors.accent]}
                progressBackgroundColor={Colors.surface}
              />
            ) : undefined
          }
        >
          {(title || right) && (
            <View style={styles.header}>
              <View style={styles.headerText}>
                {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
                {title ? <Text style={styles.title} accessibilityRole="header">{title}</Text> : null}
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              {right ? <View style={styles.right}>{right}</View> : null}
            </View>
          )}
          {children}
        </ScrollView>
      </SafeAreaView>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.sm,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    ...Type.caption,
    marginBottom: 2,
  },
  title: {
    ...Type.title1,
  },
  subtitle: {
    ...Type.callout,
    marginTop: 4,
  },
  right: {
    marginLeft: Spacing.md,
  },
});
