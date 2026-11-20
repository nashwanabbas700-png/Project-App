import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme'

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return { bg: COLORS.secondary, text: COLORS.textOnDark, border: 'transparent' };
      case 'outline':
        return { bg: 'transparent', text: COLORS.primary, border: COLORS.border };
      case 'danger':
        return { bg: COLORS.danger, text: COLORS.textOnDark, border: 'transparent' };
      case 'ghost':
        return { bg: 'transparent', text: COLORS.secondary, border: 'transparent' };
      default:
        return { bg: COLORS.primary, text: COLORS.textOnDark, border: 'transparent' };
    }
  };

  const current = getButtonStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: current.bg, borderColor: current.border },
        size === 'sm' && styles.buttonSm,
        size === 'lg' && styles.buttonLg,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={current.text} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              { color: current.text, marginLeft: icon ? SPACING.sm : 0 },
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  buttonSm: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  buttonLg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.lg,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 12,
  },
  textLg: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

