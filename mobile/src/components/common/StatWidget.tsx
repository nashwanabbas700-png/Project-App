import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme'

interface StatWidgetProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  style?: ViewStyle;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  label,
  value,
  subtitle,
  icon,
  accentColor = COLORS.primary,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon && <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}15` }]}>{icon}</View>}
      </View>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    marginVertical: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});




