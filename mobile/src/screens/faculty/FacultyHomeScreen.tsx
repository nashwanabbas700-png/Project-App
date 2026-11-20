import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Clock, Calendar, BookOpen, User, Bell, ChevronRight, AlertCircle, FileText, Download } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TimetableEntry } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { ClassCard } from '../../components/mobile/ClassCard';
import { StatCard } from '../../components/mobile/StatCard';
import { EmptyState } from '../../components/mobile/EmptyState';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const FacultyHomeScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayIndex = new Date().getDay();
  const currentDay = todayIndex >= 1 && todayIndex <= 5 ? DAYS[todayIndex] : 'Monday';

  const loadSchedule = async () => {
    try {
      const res = await api.getFacultyPersonalTimetable(user?.facultyId || 'CS-FAC-01');
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
    loadSchedule();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedule();
  };

  const todayClasses = entries.filter((e) => e.day === currentDay);
  const nextClass = todayClasses[0] || entries[0];
  const uniqueCourses = Array.from(new Set(entries.map((e) => e.courseCode)));

  let totalMinutes = 0;
  entries.forEach((e) => {
    const [sh, sm] = e.startTime.split(':').map(Number);
    const [eh, em] = e.endTime.split(':').map(Number);
    totalMinutes += eh * 60 + em - (sh * 60 + sm);
  });
  const weeklyHours = (totalMinutes / 60).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader
        title="Faculty Workspace"
        subtitle={`${user?.department || 'Computer Science'} • ${user?.name || 'Dr. Jenkins'}`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
      >
        {/* Welcome Banner */}
        <View style={[styles.heroBanner, { backgroundColor: colors.primary, borderRadius: radius.lg }, shadow.md]}>
          <Text style={styles.heroPre}>Institutional Faculty Portal</Text>
          <Text style={styles.heroTitle}>{user?.name || 'Dr. Sarah Jenkins'}</Text>
          <Text style={styles.heroDept}>
            {user?.department || 'Computer Science'} • Associate Professor
          </Text>

          <View style={styles.heroFooter}>
            <View style={styles.heroFooterBadge}>
              <Text style={styles.heroFooterText}>
                {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} today ({currentDay})
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Today's Load"
            value={todayClasses.length}
            subtitle={`Classes for ${currentDay}`}
            icon={<Clock size={16} color={colors.accent} />}
          />
          <StatCard
            label="Weekly Hours"
            value={`${weeklyHours}h`}
            subtitle="Contract max: 16h"
            icon={<Calendar size={16} color={colors.teal} />}
            accentColor={colors.teal}
          />
          <StatCard
            label="Courses"
            value={uniqueCourses.length}
            subtitle="Active sections"
            icon={<BookOpen size={16} color={colors.purple} />}
            accentColor={colors.purple}
          />
        </View>

        {/* Next Teaching Slot Card */}
        {nextClass && (
          <View
            style={[
              styles.nextSlotCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.accent,
                borderRadius: radius.md,
              },
              shadow.sm,
            ]}
          >
            <View style={styles.nextSlotTop}>
              <View style={[styles.nextSlotBadge, { backgroundColor: `${colors.accent}14` }]}>
                <Clock size={12} color={colors.accent} />
                <Text style={[styles.nextSlotBadgeText, { color: colors.accent }]}>
                  {todayClasses.length > 0 ? "TODAY'S NEXT LECTURE" : "UPCOMING SESSION"}
                </Text>
              </View>
              <Text style={[styles.slotDayTime, { color: colors.textSecondary }]}>
                {nextClass.day} • {nextClass.startTime} - {nextClass.endTime}
              </Text>
            </View>

            <Text style={[styles.slotCourseTitle, { color: colors.text }]}>{nextClass.courseName}</Text>

            <View style={styles.slotFooter}>
              <Text style={[styles.slotSection, { color: colors.textSecondary }]}>
                Section: <Text style={{ color: colors.text, fontWeight: '700' }}>{nextClass.section}</Text>
              </Text>
              <View style={[styles.slotRoomPill, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.slotRoomText, { color: colors.accent }]}>Room {nextClass.roomNumber}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Today's Schedule List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule ({currentDay})</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Schedule')}>
            <Text style={[styles.viewAllText, { color: colors.accent }]}>View All →</Text>
          </TouchableOpacity>
        </View>

        {todayClasses.length === 0 ? (
          <EmptyState
            title="No Lectures Today"
            description="You have no scheduled teaching slots for today. Use this time for office hours, research, or grading."
          />
        ) : (
          todayClasses.map((item, idx) => (
            <ClassCard
              key={item.id || idx}
              entry={item}
              showFaculty={false}
              showSection={true}
              isActiveNow={idx === 0}
            />
          ))
        )}

        {/* Quick Actions Row */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Faculty Shortcuts</Text>
        </View>

        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}
            onPress={() => navigation?.navigate('Leave')}
          >
            <View style={[styles.shortcutIconWrap, { backgroundColor: colors.warningBg }]}>
              <FileText size={18} color={colors.warning} />
            </View>
            <Text style={[styles.shortcutTitle, { color: colors.text }]}>Request Leave</Text>
            <Text style={[styles.shortcutDesc, { color: colors.textMuted }]}>AI substitute finder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}
            onPress={() => navigation?.navigate('Classes')}
          >
            <View style={[styles.shortcutIconWrap, { backgroundColor: colors.infoBg }]}>
              <BookOpen size={18} color={colors.accent} />
            </View>
            <Text style={[styles.shortcutTitle, { color: colors.text }]}>My Courses</Text>
            <Text style={[styles.shortcutDesc, { color: colors.textMuted }]}>Syllabus & sections</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default FacultyHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    padding: 20,
    marginBottom: 16,
  },
  heroPre: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  heroDept: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 4,
  },
  heroFooter: {
    marginTop: 14,
    flexDirection: 'row',
  },
  heroFooterBadge: {
    backgroundColor: 'rgba(46, 124, 246, 0.4)',
    borderWidth: 1,
    borderColor: '#2E7CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroFooterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  nextSlotCard: {
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 18,
  },
  nextSlotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextSlotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nextSlotBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  slotDayTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  slotCourseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  slotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    paddingTop: 8,
  },
  slotSection: {
    fontSize: 12,
  },
  slotRoomPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotRoomText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  shortcutCard: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
  },
  shortcutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  shortcutDesc: {
    fontSize: 11,
  },
});
