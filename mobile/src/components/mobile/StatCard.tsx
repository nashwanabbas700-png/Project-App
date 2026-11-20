import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  accentColor,
}) => {
  const { colors, radius, shadow } = useTheme();
  const themeAccent = accentColor || colors.accent;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
        shadow.sm,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: `${themeAccent}14`, borderRadius: radius.sm }]}>
            {icon}
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
});
