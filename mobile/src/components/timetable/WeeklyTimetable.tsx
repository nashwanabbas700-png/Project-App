import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme'
import { TimetableEntry, DayOfWeek } from '../../types';
import { ModalWrapper } from '../common/ModalWrapper';
import { ClassCard } from './ClassCard';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIME_SLOTS = [
  { start: '08:30', end: '10:00', label: '08:30' },
  { start: '10:15', end: '11:45', label: '10:15' },
  { start: '12:00', end: '13:30', label: '12:00' },
  { start: '13:45', end: '15:15', label: '13:45' },
  { start: '15:30', end: '17:00', label: '15:30' },
];

interface WeeklyTimetableProps {
  entries: TimetableEntry[];
  showFaculty?: boolean;
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  entries,
  showFaculty = false,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  const getEntryAt = (day: DayOfWeek, startTime: string) => {
    return entries.find((e) => e.day === day && e.startTime === startTime);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.matrixContainer}>
        <View>
          {/* Header row with Days */}
          <View style={styles.headerRow}>
            <View style={[styles.cell, styles.timeColumnHeader]}>
              <Text style={styles.timeHeaderLabel}>Time</Text>
            </View>
            {DAYS.map((day) => (
              <View key={day} style={[styles.cell, styles.dayColumnHeader]}>
                <Text style={styles.dayHeaderLabel}>{day.substring(0, 3)}</Text>
              </View>
            ))}
          </View>

          {/* Time Slot Rows */}
          {TIME_SLOTS.map((slot) => (
            <View key={slot.start} style={styles.row}>
              {/* Time Column */}
              <View style={[styles.cell, styles.timeCell]}>
                <Text style={styles.timeText}>{slot.start}</Text>
                <Text style={styles.timeSubText}>{slot.end}</Text>
              </View>

              {/* Day Cells */}
              {DAYS.map((day) => {
                const entry = getEntryAt(day, slot.start);
                return (
                  <View key={`${day}-${slot.start}`} style={[styles.cell, styles.contentCell]}>
                    {entry ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setSelectedEntry(entry)}
                        style={[
                          styles.slotBlock,
                          {
                            backgroundColor: `${entry.color || COLORS.secondary}20`,
                            borderColor: entry.color || COLORS.secondary,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.slotCourseCode, { color: entry.color || COLORS.secondary }]}
                          numberOfLines={1}
                        >
                          {entry.courseCode}
                        </Text>
                        <Text style={styles.slotRoom} numberOfLines={1}>
                          {entry.roomNumber}
                        </Text>
                        <Text style={styles.slotSec} numberOfLines={1}>
                          Sec {entry.section}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptySlot} />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Class Detail Modal */}
      {selectedEntry && (
        <ModalWrapper
          visible={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          title="Class Session Details"
          subtitle={`${selectedEntry.day} • ${selectedEntry.startTime} - ${selectedEntry.endTime}`}
        >
          <ClassCard entry={selectedEntry} showFaculty={showFaculty} />
        </ModalWrapper>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  matrixContainer: {
    padding: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cell: {
    width: 84,
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  timeColumnHeader: {
    width: 58,
    alignItems: 'center',
  },
  dayColumnHeader: {
    alignItems: 'center',
  },
  timeHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  dayHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  timeCell: {
    width: 58,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timeSubText: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  contentCell: {
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  slotBlock: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    padding: 4,
    justifyContent: 'space-between',
  },
  slotCourseCode: {
    fontSize: 10,
    fontWeight: '800',
  },
  slotRoom: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  slotSec: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  emptySlot: {
    width: '100%',
    height: '100%',
  },
});

