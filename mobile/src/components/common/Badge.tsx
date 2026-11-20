import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme'

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: COLORS.primary, text: COLORS.textOnDark };
      case 'secondary':
        return { bg: COLORS.secondarySubtle, text: COLORS.secondary };
      case 'success':
        return { bg: COLORS.successLight, text: COLORS.success };
      case 'warning':
        return { bg: COLORS.warningSubtle, text: COLORS.warning };
      case 'danger':
        return { bg: COLORS.dangerSubtle, text: COLORS.danger };
      case 'info':
        return { bg: COLORS.infoSubtle, text: COLORS.info };
      default:
        return { bg: COLORS.surfaceBlue, text: COLORS.textSecondary };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        size === 'sm' && styles.badgeSm,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text },
          size === 'sm' && styles.textSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 10,
    fontWeight: '600',
  },
});

