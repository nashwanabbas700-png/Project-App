import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, User, BookOpen, Layers } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { TimetableEntry } from '../../types';

interface ClassCardProps {
  entry: TimetableEntry;
  onPress?: () => void;
  showFaculty?: boolean;
  showSection?: boolean;
  isActiveNow?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  entry,
  onPress,
  showFaculty = true,
  showSection = true,
  isActiveNow = false,
}) => {
  const { colors, radius, shadow, isDark } = useTheme();

  const accentColor = entry.color || colors.accent;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isActiveNow ? colors.accent : colors.border,
          borderWidth: isActiveNow ? 1.5 : 1,
          borderRadius: radius.md,
        },
        shadow.sm,
      ]}
    >
      {/* Accent Indicator Bar on Left */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.contentWrap}>
        {/* Top Header: Course Code, Room, and Active Tag */}
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <View style={[styles.codeBadge, { backgroundColor: `${accentColor}18` }]}>
              <Text style={[styles.codeText, { color: accentColor }]}>
                {entry.courseCode}
              </Text>
            </View>

            {showSection && entry.section && (
              <View style={[styles.sectionBadge, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                  Sec {entry.section}
                </Text>
              </View>
            )}

            {isActiveNow && (
              <View style={[styles.nowBadge, { backgroundColor: colors.successBg }]}>
                <View style={[styles.nowDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.nowText, { color: colors.success }]}>Active Now</Text>
              </View>
            )}
          </View>

          {/* Time Badge */}
          <View style={[styles.timeBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {entry.startTime} - {entry.endTime}
            </Text>
          </View>
        </View>

        {/* Course Name */}
        <Text
          style={[styles.courseName, { color: colors.text }]}
          numberOfLines={2}
        >
          {entry.courseName}
        </Text>

        {/* Bottom Details Row */}
        <View style={styles.detailsRow}>
          {/* Faculty / Instructor */}
          {showFaculty && entry.facultyName && (
            <View style={styles.detailItem}>
              <User size={13} color={colors.textMuted} />
              <Text
                style={[styles.detailText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {entry.facultyName}
              </Text>
            </View>
          )}

          {/* Room Number */}
          <View style={styles.detailItem}>
            <MapPin size={13} color={accentColor} />
            <Text style={[styles.roomText, { color: accentColor }]} numberOfLines={1}>
              {entry.roomNumber}
            </Text>
            {entry.roomType && (
              <Text style={[styles.roomType, { color: colors.textMuted }]}>
                • {entry.roomType}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
  },
  accentBar: {
    width: 5,
    height: '100%',
  },
  contentWrap: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  nowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nowText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    paddingTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roomText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roomType: {
    fontSize: 11,
    fontWeight: '400',
  },
});
