import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Calendar, Clock, Download, FileSpreadsheet, MapPin } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TimetableEntry } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { ClassCard } from '../../components/mobile/ClassCard';
import { EmptyState } from '../../components/mobile/EmptyState';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const FacultyScheduleScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const facultyId = user?.facultyId || 'CS-FAC-01';

  const loadFacultySchedule = async () => {
    try {
      const res = await api.getFacultyPersonalTimetable(facultyId);
      if (res.success && res.entries) {
        setEntries(res.entries);
      }
    } catch (e) {
      console.warn('Failed to load faculty schedule', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFacultySchedule();
  }, [facultyId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFacultySchedule();
  };

  const dayEntries = entries.filter((e) => e.day === selectedDay);

  let totalMinutes = 0;
  entries.forEach((e) => {
    const [sh, sm] = e.startTime.split(':').map(Number);
    const [eh, em] = e.endTime.split(':').map(Number);
    totalMinutes += eh * 60 + em - (sh * 60 + sm);
  });
  const totalWeeklyHours = (totalMinutes / 60).toFixed(1);

  const handleExportICS = () => {
    const url = api.getExportICSUrl({
      facultyId,
      semester: 'Fall 2026',
    });
    Linking.openURL(url);
  };

  const handleExportCSV = () => {
    const url = api.getExportCSVUrl({
      facultyId,
      semester: 'Fall 2026',
    });
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="My Teaching Schedule" subtitle={`Fall 2026 • ${user?.name || 'Faculty'}`} />

      {/* Day Tabs */}
      <View style={[styles.dayTabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {DAYS.map((day) => {
          const active = selectedDay === day;
          const dayCount = entries.filter((e) => e.day === day).length;
          return (
            <TouchableOpacity
              key={day}
              activeOpacity={0.7}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayTabItem,
                active && { borderBottomColor: colors.accent, borderBottomWidth: 3 },
              ]}
            >
              <Text style={[styles.dayTabShort, { color: active ? colors.accent : colors.textMuted }]}>
                {day.substring(0, 3)}
              </Text>
              <View style={[styles.dotBadge, { backgroundColor: dayCount > 0 ? (active ? colors.accent : colors.textMuted) : 'transparent' }]}>
                <Text style={styles.dotCount}>{dayCount > 0 ? dayCount : ''}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Workload Indicator Card */}
        <View style={[styles.workloadCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }, shadow.sm]}>
          <View style={styles.workloadLeft}>
            <Text style={[styles.workloadTitle, { color: colors.text }]}>Contract Teaching Hours</Text>
            <Text style={[styles.workloadSub, { color: colors.textSecondary }]}>
              {totalWeeklyHours} / 16.0 hrs weekly load
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.successBg }]}>
            <Text style={[styles.statusBadgeText, { color: colors.success }]}>BALANCED</Text>
          </View>
        </View>

        {/* Classes List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
            {selectedDay}'s Classes
          </Text>
          <Text style={[styles.listCountBadge, { color: colors.textSecondary }]}>
            {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
          </Text>
        </View>

        {dayEntries.length === 0 ? (
          <EmptyState
            title={`No Teaching on ${selectedDay}`}
            description={`You have no scheduled courses on ${selectedDay}. Check other days or update your availability preferences in Profile.`}
          />
        ) : (
          dayEntries.map((item, idx) => (
            <ClassCard
              key={item.id || idx}
              entry={item}
              showFaculty={false}
              showSection={true}
            />
          ))
        )}

        {/* Calendar Sync & Export Tools */}
        <View style={styles.exportSection}>
          <Text style={[styles.exportTitle, { color: colors.text }]}>Calendar Sync & Download</Text>
          <View style={styles.exportBtnRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleExportICS}
              style={[styles.exportBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
            >
              <Download size={15} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Sync to Calendar (.ics)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleExportCSV}
              style={[
                styles.exportBtnOutline,
                { borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius.md },
              ]}
            >
              <FileSpreadsheet size={15} color={colors.text} />
              <Text style={[styles.exportBtnOutlineText, { color: colors.text }]}>Export CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FacultyScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  dayTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  dayTabShort: {
    fontSize: 13,
    fontWeight: '700',
  },
  dotBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dotCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  workloadCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  workloadLeft: {},
  workloadTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  workloadSub: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listCountBadge: {
    fontSize: 12,
  },
  exportSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.25)',
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  exportBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  exportBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 6,
  },
  exportBtnOutlineText: {
    fontWeight: '700',
    fontSize: 12,
  },
});
