import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import { Calendar, Grid, Clock, Sparkles, Download } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme'
import { useTimetable } from '../../context/TimetableContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DailyTimetable } from '../../components/timetable/DailyTimetable';
import { WeeklyTimetable } from '../../components/timetable/WeeklyTimetable';
import { Badge } from '../../components/common/Badge';

export const FacultyTimetableScreen: React.FC = () => {
  const { facultyEntries, activeTimetable, selectedSemester } = useTimetable();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const handleExportICS = () => {
    const url = api.getExportICSUrl({
      facultyId: user?.facultyId,
      semester: selectedSemester,
    });
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const handleExportCSV = () => {
    const url = api.getExportCSVUrl({
      facultyId: user?.facultyId,
      semester: selectedSemester,
    });
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* View Switcher Bar */}
      <View style={styles.controlBar}>
        <View style={styles.semesterBadge}>
          <Calendar size={14} color={COLORS.primary} />
          <Text style={styles.semesterText}>{selectedSemester}</Text>
        </View>

        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'daily' && styles.toggleBtnActive]}
            onPress={() => setViewMode('daily')}
            activeOpacity={0.8}
          >
            <Clock size={14} color={viewMode === 'daily' ? COLORS.textOnDark : COLORS.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'daily' && styles.toggleTextActive]}>
              Daily View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'weekly' && styles.toggleBtnActive]}
            onPress={() => setViewMode('weekly')}
            activeOpacity={0.8}
          >
            <Grid size={14} color={viewMode === 'weekly' ? COLORS.textOnDark : COLORS.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>
              Weekly View
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overview Status Strip */}
      <View style={styles.statusStrip}>
        <View style={styles.statusLeft}>
          <Text style={styles.classesCountNumber}>{facultyEntries.length}</Text>
          <Text style={styles.classesCountLabel}>Allocated Sessions</Text>
        </View>
        <Badge
          label="Auto-Synchronized"
          variant="success"
          size="sm"
        />
      </View>

      {/* Calendar Sync & Export Strip */}
      <View style={styles.exportBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.exportTitle}>Export Personal Timetable</Text>
          <Text style={styles.exportSub}>Sync to Google Calendar / Outlook or export offline CSV</Text>
        </View>
        <View style={styles.exportBtns}>
          <TouchableOpacity style={styles.exportPill} onPress={handleExportICS} activeOpacity={0.8}>
            <Calendar size={13} color={COLORS.secondary} />
            <Text style={styles.exportPillText}>Sync (.ics)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportPill} onPress={handleExportCSV} activeOpacity={0.8}>
            <Download size={13} color={COLORS.secondary} />
            <Text style={styles.exportPillText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main View Renderer */}
      {viewMode === 'daily' ? (
        <DailyTimetable entries={facultyEntries} />
      ) : (
        <WeeklyTimetable entries={facultyEntries} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  semesterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  semesterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    ...SHADOW.subtle,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.textOnDark,
  },
  statusStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  classesCountNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  classesCountLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  exportBar: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  exportTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  exportSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  exportBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  exportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  exportPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});



export default FacultyTimetableScreen;

