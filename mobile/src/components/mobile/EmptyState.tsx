import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarX } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Classes Scheduled',
  description = 'There are no active scheduled courses for this selection.',
  icon,
}) => {
  const { colors, radius } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.surfaceSecondary, borderRadius: radius.full },
        ]}
      >
        {icon || <CalendarX size={32} color={colors.textMuted} />}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
