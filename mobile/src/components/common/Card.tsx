import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme'

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'subtle';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = SPACING.lg,
}) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'subtle' && styles.subtle,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  elevated: {
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subtle: {
    backgroundColor: COLORS.surfaceBlue,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});




