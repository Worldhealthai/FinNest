import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Type, Spacing } from '@/constants/theme';
import IconTile from './IconTile';
import Button from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <IconTile name={icon} size={56} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} size="md" fullWidth={false} icon="add" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  title: {
    ...Type.headline,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  message: {
    ...Type.callout,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
  },
  action: {
    marginTop: Spacing.md,
  },
});
