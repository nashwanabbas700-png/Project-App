import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { BookOpen, Users, Clock, MapPin, Layers, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Course, TimetableEntry } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { EmptyState } from '../../components/mobile/EmptyState';

export const FacultyClassesScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const facultyId = user?.facultyId || 'CS-FAC-01';

  const loadClassesData = async () => {
    try {
      const [coursesRes, scheduleRes] = await Promise.all([
        api.getCourses({ department: user?.department || 'Computer Science' }),
        api.getFacultyPersonalTimetable(facultyId),
      ]);

      if (coursesRes.success) {
        // Filter courses where assignedFacultyId matches or that appear in schedule
        const assignedCodes = new Set(scheduleRes.entries?.map((e) => e.courseCode) || []);
        const myCourses = (coursesRes.courses || []).filter(
          (c) => c.assignedFacultyId === facultyId || assignedCodes.has(c.code)
        );
        setCourses(myCourses);
      }
      if (scheduleRes.success) {
        setScheduleEntries(scheduleRes.entries || []);
      }
    } catch (e) {
      console.warn('Failed to load faculty classes', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClassesData();
  }, [facultyId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadClassesData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Assigned Courses" subtitle={`${courses.length} courses • Fall 2026`} />

      <ScrollView
        contentContainerStyle={styles.scrollList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        showsVerticalScrollIndicator={false}
      >
        {courses.length === 0 ? (
          <EmptyState
            title="No Assigned Courses"
            description="You do not have any assigned courses in the current curriculum database."
          />
        ) : (
          courses.map((course) => {
            const courseSessions = scheduleEntries.filter((e) => e.courseCode === course.code);
            const sections = Array.from(new Set(courseSessions.map((e) => e.section)));

            return (
              <View
                key={course.code}
                style={[
                  styles.courseCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                  shadow.sm,
                ]}
              >
                <View style={styles.courseHeader}>
                  <View style={[styles.codeBadge, { backgroundColor: `${colors.accent}14` }]}>
                    <Text style={[styles.codeText, { color: colors.accent }]}>{course.code}</Text>
                  </View>
                  <View style={[styles.creditBadge, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.creditText, { color: colors.textSecondary }]}>
                      {course.credits} Credits
                    </Text>
                  </View>
                </View>

                <Text style={[styles.courseTitle, { color: colors.text }]}>{course.name}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Layers size={13} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {course.requiredRoomType || 'Lecture Room'}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={13} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {course.weeklySessions || 2} sessions/wk ({course.durationMinutes || 90}m)
                    </Text>
                  </View>
                </View>

                {/* Scheduled Timeslots */}
                <View style={[styles.sessionsBox, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm }]}>
                  <Text style={[styles.sessionsHeading, { color: colors.text }]}>Scheduled Weekly Slots:</Text>
                  {courseSessions.length === 0 ? (
                    <Text style={[styles.noSessionText, { color: colors.textMuted }]}>
                      Pending scheduling generation.
                    </Text>
                  ) : (
                    courseSessions.map((s, idx) => (
                      <View key={idx} style={styles.sessionLine}>
                        <CheckCircle size={12} color={colors.success} />
                        <Text style={[styles.sessionText, { color: colors.textSecondary }]}>
                          <Text style={{ fontWeight: '700', color: colors.text }}>{s.day}</Text> {s.startTime}–{s.endTime} (Sec {s.section}, Room {s.roomNumber})
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default FacultyClassesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  courseCard: {
    padding: 16,
    borderWidth: 1,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  creditBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  creditText: {
    fontSize: 11,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
  },
  sessionsBox: {
    padding: 10,
    gap: 6,
  },
  sessionsHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  noSessionText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  sessionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionText: {
    fontSize: 12,
  },
});
