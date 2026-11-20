import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, Clock, Inbox } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme'
import { TimetableEntry, DayOfWeek } from '../../types';
import { ClassCard } from './ClassCard';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface DailyTimetableProps {
  entries: TimetableEntry[];
  showFaculty?: boolean;
  onEntryPress?: (entry: TimetableEntry) => void;
}

export const DailyTimetable: React.FC<DailyTimetableProps> = ({
  entries,
  showFaculty = false,
  onEntryPress,
}) => {
  // Determine current day of week (fallback to Monday if weekend)
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const defaultDay: DayOfWeek =
    currentDayIndex >= 1 && currentDayIndex <= 5 ? (DAYS[currentDayIndex - 1] as DayOfWeek) : 'Monday';

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(defaultDay);

  // Filter entries for selected day and sort chronologically
  const dayEntries = entries
    .filter((e) => e.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <View style={styles.container}>
      {/* Day Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const classCount = entries.filter((e) => e.day === day).length;
          return (
            <TouchableOpacity
              key={day}
              activeOpacity={0.8}
              onPress={() => setSelectedDay(day)}
              style={[styles.tab, isSelected && styles.tabSelected]}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                {day.substring(0, 3)}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isSelected ? styles.countBadgeSelected : styles.countBadgeUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isSelected ? styles.countTextSelected : styles.countTextUnselected,
                  ]}
                >
                  {classCount}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Day Header */}
      <View style={styles.daySummaryRow}>
        <View style={styles.daySummaryLeft}>
          <Calendar size={16} color={COLORS.primary} />
          <Text style={styles.daySummaryText}>{selectedDay}'s Teaching Schedule</Text>
        </View>
        <Text style={styles.classCountText}>
          {dayEntries.length} {dayEntries.length === 1 ? 'Class' : 'Classes'}
        </Text>
      </View>

      {/* Entries List */}
      {dayEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Inbox size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
          <Text style={styles.emptySubtitle}>
            You have no teaching commitments on {selectedDay}. Enjoy your research or office hours!
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {dayEntries.map((entry, idx) => (
            <ClassCard
              key={entry.id || `${entry.courseCode}-${idx}`}
              entry={entry}
              isUpcoming={idx === 0 && selectedDay === defaultDay}
              showFaculty={showFaculty}
              onPress={() => onEntryPress && onEntryPress(entry)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextSelected: {
    color: COLORS.textOnDark,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    minWidth: 18,
    alignItems: 'center',
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countBadgeUnselected: {
    backgroundColor: COLORS.surfaceBlue,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  countTextSelected: {
    color: COLORS.textOnDark,
  },
  countTextUnselected: {
    color: COLORS.textMuted,
  },
  daySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  daySummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  daySummaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  classCountText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  list: {
    gap: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.xxxl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    maxWidth: 280,
    lineHeight: 18,
  },
});

