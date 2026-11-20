import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme'
import { FacultyWorkloadSummary } from '../../types';
import { Badge } from '../common/Badge';

interface WorkloadCardProps {
  summary: FacultyWorkloadSummary;
}

export const WorkloadCard: React.FC<WorkloadCardProps> = ({ summary }) => {
  const progressRatio = Math.min(1, summary.totalWeeklyHours / (summary.maxWeeklyHours || 16));

  const getStatusVariant = () => {
    switch (summary.status) {
      case 'OVERLOADED':
        return 'danger';
      case 'UNDERUTILIZED':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{summary.name}</Text>
          <Text style={styles.dept}>
            {summary.department} • {summary.designation}
          </Text>
        </View>
        <Badge label={summary.status} variant={getStatusVariant()} size="sm" />
      </View>

      {/* Progress Bar */}
      <View style={styles.barWrap}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, summary.utilizationRate)}%`,
                backgroundColor: summary.statusColor,
              },
            ]}
          />
        </View>
        <View style={styles.barLabels}>
          <Text style={styles.hoursText}>
            <Text style={{ fontWeight: '800', color: COLORS.text }}>
              {summary.totalWeeklyHours} hrs
            </Text>{' '}
            / {summary.maxWeeklyHours} max
          </Text>
          <Text style={[styles.pctText, { color: summary.statusColor }]}>
            {summary.utilizationRate}%
          </Text>
        </View>
      </View>

      {/* Course Chips */}
      {summary.assignedCourseCodes && summary.assignedCourseCodes.length > 0 && (
        <View style={styles.coursesRow}>
          <Text style={styles.coursesLabel}>Assigned:</Text>
          {summary.assignedCourseCodes.map((code) => (
            <View key={code} style={styles.courseChip}>
              <Text style={styles.courseChipText}>{code}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Optimization Notes */}
      {summary.optimizationNotes && summary.optimizationNotes.length > 0 && (
        <View style={styles.notesWrap}>
          <Text style={styles.noteText}>{summary.optimizationNotes[0]}</Text>
        </View>
      )}
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
    marginBottom: SPACING.md,
    ...SHADOW.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  dept: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  barWrap: {
    marginBottom: SPACING.sm,
  },
  barBackground: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceBlue,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  hoursText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pctText: {
    fontSize: 12,
    fontWeight: '700',
  },
  coursesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
  },
  coursesLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  courseChip: {
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  courseChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  notesWrap: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  noteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});


