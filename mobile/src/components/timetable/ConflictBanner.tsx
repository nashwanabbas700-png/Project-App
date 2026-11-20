import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme'
import { DetectedConflict } from '../../types';

interface ConflictBannerProps {
  conflicts: DetectedConflict[];
  onPressViewAll?: () => void;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({
  conflicts,
  onPressViewAll,
}) => {
  const critical = conflicts.filter((c) => c.severity === 'CRITICAL');
  const warnings = conflicts.filter((c) => c.severity === 'WARNING');

  if (conflicts.length === 0) {
    return (
      <View style={[styles.container, styles.clean]}>
        <CheckCircle2 size={18} color={COLORS.success} />
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: COLORS.success }]}>Timetable Conflict-Free</Text>
          <Text style={styles.subtitle}>All hard constraints and room allocations fully validated.</Text>
        </View>
      </View>
    );
  }

  const isCritical = critical.length > 0;
  const accentColor = isCritical ? COLORS.danger : COLORS.warning;
  const bgColor = isCritical ? COLORS.dangerSubtle : COLORS.warningSubtle;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPressViewAll}
      style={[styles.container, { backgroundColor: bgColor, borderColor: accentColor }]}
    >
      {isCritical ? (
        <AlertCircle size={20} color={COLORS.danger} />
      ) : (
        <AlertTriangle size={20} color={COLORS.warning} />
      )}

      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: accentColor }]}>
          {isCritical
            ? `${critical.length} Critical Scheduling ${critical.length === 1 ? 'Conflict' : 'Conflicts'}`
            : `${warnings.length} Workload ${warnings.length === 1 ? 'Warning' : 'Warnings'}`}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {conflicts[0]?.description || 'Click to review conflict breakdown and suggested corrections.'}
        </Text>
      </View>

      {onPressViewAll && (
        <View style={[styles.actionBtn, { borderColor: accentColor }]}>
          <Text style={[styles.actionText, { color: accentColor }]}>Fix</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  clean: {
    backgroundColor: COLORS.successLight,
    borderColor: '#BBF7D0',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

