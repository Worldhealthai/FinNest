import React from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';
import Button from './ui/Button';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass';
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  disabled?: boolean;
}

/** Legacy button API, rendered with the design-system Button. */
export default function GlassButton({ title, onPress, variant = 'primary', style, disabled = false }: GlassButtonProps) {
  return (
    <Button
      title={title}
      onPress={onPress}
      variant={variant === 'primary' ? 'primary' : 'secondary'}
      style={style}
      disabled={disabled}
    />
  );
}
