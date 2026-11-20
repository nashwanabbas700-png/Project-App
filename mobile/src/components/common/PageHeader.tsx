import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  rightElement?: React.ReactNode;
  accentColor?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  rightElement,
  accentColor = COLORS.secondary,
}: PageHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: accentColor + '33' }]}>
      <View style={styles.left}>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: accentColor + '18' }]}>
            <Text style={[styles.icon, { color: accentColor }]}>{icon}</Text>
          </View>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement && <View style={styles.right}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
    paddingTop: Platform.OS === 'ios' ? 52 : SPACING.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  right: {
    marginLeft: SPACING.sm,
  },
});


