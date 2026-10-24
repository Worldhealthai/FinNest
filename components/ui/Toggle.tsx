import React from 'react';
import { Switch, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/**
 * Brand-coloured switch. react-native-web ignores `thumbColor` and needs
 * `activeThumbColor`, otherwise the knob renders Material teal on web.
 */
export default function Toggle({ value, onValueChange, disabled, accessibilityLabel }: ToggleProps) {
  const webProps = Platform.OS === 'web' ? ({ activeThumbColor: Colors.white, activeTrackColor: Colors.accent } as object) : {};
  return (
    <Switch
      value={value}
      onValueChange={(v) => {
        haptics.tap();
        onValueChange(v);
      }}
      disabled={disabled}
      trackColor={{ false: Colors.surfacePressed, true: Colors.accent }}
      thumbColor={Colors.white}
      ios_backgroundColor={Colors.surfacePressed}
      accessibilityLabel={accessibilityLabel}
      {...webProps}
    />
  );
}
