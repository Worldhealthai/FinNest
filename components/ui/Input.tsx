import React, { useState, forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Type } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  hint?: string;
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, icon, error, hint, right, containerStyle, onFocus, onBlur, editable = true, ...props },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.errored,
          !editable && styles.disabled,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? Colors.accent : Colors.textTertiary}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={Colors.textTertiary}
          selectionColor={Colors.accent}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {right}
      </View>
      {error ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle" size={14} color={Colors.negative} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  label: {
    ...Type.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  focused: {
    borderColor: Colors.accentBorder,
  },
  errored: {
    borderColor: Colors.negative,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
    // Remove the browser focus ring on web; the border shows focus instead
    outlineStyle: 'none',
  } as any,
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  error: {
    ...Type.caption,
    color: Colors.negative,
    flex: 1,
  },
  hint: {
    ...Type.caption,
    color: Colors.textTertiary,
    marginTop: 6,
  },
});
