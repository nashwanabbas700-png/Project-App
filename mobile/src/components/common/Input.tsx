import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme'

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={COLORS.textMuted}
          style={[styles.input, leftIcon ? { paddingLeft: 0 } : {}, style]}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 46,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
});

