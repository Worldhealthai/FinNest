import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Type } from '@/constants/theme';
import { haptics } from '@/utils/haptics';
import IconTile from './IconTile';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  leading?: React.ReactNode;
  value?: string;
  valueColor?: string;
  valueSubtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  muted?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** One row: leading icon, title/subtitle, and an optional value or chevron. */
export default function ListItem({
  title,
  subtitle,
  icon,
  iconColor,
  leading,
  value,
  valueColor,
  valueSubtitle,
  right,
  onPress,
  chevron,
  destructive,
  muted,
  style,
}: ListItemProps) {
  const titleColor = destructive ? Colors.negative : Colors.text;
  const showChevron = chevron ?? (!!onPress && !value && !right);

  const content = (
    <>
      {leading ?? (icon ? <IconTile name={icon} color={destructive ? Colors.negative : iconColor} size={36} /> : null)}
      <View style={[styles.body, !!(leading || icon) && styles.bodyIndented]}>
        <Text style={[styles.title, { color: titleColor }, muted && styles.muted]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <View style={styles.valueWrap}>
          <Text style={[styles.value, valueColor ? { color: valueColor } : null, muted && styles.muted]} numberOfLines={1}>
            {value}
          </Text>
          {valueSubtitle ? <Text style={styles.valueSubtitle}>{valueSubtitle}</Text> : null}
        </View>
      ) : null}
      {right}
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} style={styles.chevron} /> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, style]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
    >
      {content}
    </Pressable>
  );
}

/** Groups rows into a single card with hairline dividers between them. */
export function ListGroup({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, style]}>
      {items.map((child, i) => (
        <View key={i}>
          {i > 0 && <View style={styles.divider} />}
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  body: {
    flex: 1,
  },
  bodyIndented: {
    marginLeft: 14,
  },
  title: {
    ...Type.bodyStrong,
  },
  subtitle: {
    ...Type.caption,
    marginTop: 2,
  },
  muted: {
    color: Colors.textTertiary,
  },
  valueWrap: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  value: {
    ...Type.bodyStrong,
    ...Type.number,
  },
  valueSubtitle: {
    ...Type.caption,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
  group: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderStrong,
    marginLeft: 16,
  },
});
