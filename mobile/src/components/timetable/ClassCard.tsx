import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, Users, BookOpen } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme'
import { TimetableEntry } from '../../types';
import { Badge } from '../common/Badge';

interface ClassCardProps {
  entry: TimetableEntry;
  onPress?: () => void;
  isUpcoming?: boolean;
  showFaculty?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  entry,
  onPress,
  isUpcoming = false,
  showFaculty = false,
}) => {
  const accentColor = entry.color || COLORS.secondary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        isUpcoming && styles.upcomingBorder,
        { borderLeftColor: accentColor },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.courseHeader}>
          <Text style={styles.courseCode}>{entry.courseCode}</Text>
          <View style={[styles.sectionChip, { backgroundColor: `${accentColor}15` }]}>
            <Text style={[styles.sectionText, { color: accentColor }]}>Sec {entry.section}</Text>
          </View>
          {isUpcoming && <Badge label="Next Class" variant="success" size="sm" />}
        </View>

        <Badge
          label={entry.roomType}
          variant={entry.roomType === 'Computer Lab' ? 'info' : 'neutral'}
          size="sm"
        />
      </View>

      <Text style={styles.courseName} numberOfLines={2}>
        {entry.courseName}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Clock size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>
            {entry.startTime} – {entry.endTime}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <MapPin size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>Room {entry.roomNumber}</Text>
        </View>

        {showFaculty && entry.facultyName && (
          <View style={styles.metaItem}>
            <Users size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {entry.facultyName}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
    marginBottom: SPACING.md,
    ...SHADOW.subtle,
  },
  upcomingBorder: {
    borderColor: COLORS.secondary,
    backgroundColor: '#F0F7FF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  sectionChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  sectionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  courseName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});


