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
import { GraduationCap, Users, Clock, BookOpen, Download, FileSpreadsheet } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { TimetableEntry } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { ClassCard } from '../../components/mobile/ClassCard';
import { StatCard } from '../../components/mobile/StatCard';
import { EmptyState } from '../../components/mobile/EmptyState';

const SECTIONS = ['CS-A', 'CS-B', 'EE-A', 'BBA-A'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const AdminStudentsScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();

  const [selectedSection, setSelectedSection] = useState('CS-A');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [summary, setSummary] = useState({
    totalCourses: 0,
    totalClassesPerWeek: 0,
    totalWeeklyHours: '0.0',
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadSectionTimetable = async () => {
    try {
      const res = await api.getStudentTimetable({
        section: selectedSection,
        semester: 'Fall 2026',
      });
      if (res.success) {
        setEntries(res.entries || []);
        setSummary({
          totalCourses: res.totalCourses,
          totalClassesPerWeek: res.totalClassesPerWeek,
          totalWeeklyHours: res.totalWeeklyHours,
        });
      }
    } catch (e) {
      console.warn('Admin student section error', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSectionTimetable();
  }, [selectedSection]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSectionTimetable();
  };

  const dayEntries = entries.filter((e) => e.day === selectedDay);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Student Sections" subtitle="Academic Cohorts & Capacity" />

      {/* Section Switcher Strip */}
      <View style={[styles.sectionStrip, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroll}>
          {SECTIONS.map((sec) => {
            const active = selectedSection === sec;
            return (
              <TouchableOpacity
                key={sec}
                onPress={() => setSelectedSection(sec)}
                style={[
                  styles.sectionPill,
                  {
                    backgroundColor: active ? colors.accent : colors.surfaceSecondary,
                    borderColor: active ? colors.accent : colors.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text style={[styles.sectionPillText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                  Cohort {sec}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Day Tabs */}
      <View style={[styles.dayTabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {DAYS.map((day) => {
          const active = selectedDay === day;
          const count = entries.filter((e) => e.day === day).length;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayTabItem,
                active && { borderBottomColor: colors.accent, borderBottomWidth: 3 },
              ]}
            >
              <Text style={[styles.dayTabShort, { color: active ? colors.accent : colors.textMuted }]}>
                {day.substring(0, 3)}
              </Text>
              <Text style={[styles.dayTabCount, { color: active ? colors.text : colors.textMuted }]}>
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Cohort Stats Card */}
        <View style={styles.statsRow}>
          <StatCard
            label="Curriculum"
            value={summary.totalCourses}
            subtitle="Courses enrolled"
            icon={<BookOpen size={16} color={colors.accent} />}
          />
          <StatCard
            label="Weekly Load"
            value={`${summary.totalWeeklyHours}h`}
            subtitle={`${summary.totalClassesPerWeek} sessions / week`}
            icon={<Clock size={16} color={colors.teal} />}
            accentColor={colors.teal}
          />
        </View>

        {/* Classes Scheduled for this Day */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
            {selectedSection} • {selectedDay}'s Schedule
          </Text>
          <Text style={[styles.countBadge, { color: colors.textSecondary }]}>
            {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
          </Text>
        </View>

        {dayEntries.length === 0 ? (
          <EmptyState
            title={`No Lectures on ${selectedDay}`}
            description={`Section ${selectedSection} has open periods on ${selectedDay}. Check other days or rebalance in Smart Scheduler.`}
          />
        ) : (
          dayEntries.map((item, idx) => (
            <ClassCard
              key={item.id || idx}
              entry={item}
              showFaculty={true}
              showSection={false}
            />
          ))
        )}

        {/* Export for this Section */}
        <View style={styles.exportSection}>
          <Text style={[styles.exportTitle, { color: colors.text }]}>Section Schedule Export</Text>
          <View style={styles.exportBtnRow}>
            <TouchableOpacity
              onPress={() => Linking.openURL(api.getExportICSUrl({ section: selectedSection, semester: 'Fall 2026' }))}
              style={[styles.exportBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
            >
              <Download size={15} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Sync {selectedSection} (.ics)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL(api.getExportCSVUrl({ section: selectedSection, semester: 'Fall 2026' }))}
              style={[
                styles.exportBtnOutline,
                { borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius.md },
              ]}
            >
              <FileSpreadsheet size={15} color={colors.text} />
              <Text style={[styles.exportBtnOutlineText, { color: colors.text }]}>Download CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminStudentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionScroll: {
    gap: 8,
  },
  sectionPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  sectionPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  dayTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  dayTabShort: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayTabCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
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
