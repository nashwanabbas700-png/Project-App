import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { BookOpen, Award, Users, Calendar, Layers } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SHADOWS, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTimetable } from '../../context/TimetableContext';
import { api } from '../../services/api';
import { Course } from '../../types';
import { Badge } from '../../components/common/Badge';

export const FacultyCoursesScreen: React.FC = () => {
  const { user } = useAuth();
  const { facultyEntries } = useTimetable();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCourses();
      if (res.success) {
        // Filter by current faculty id or matching courses from timetable
        const assignedCodes = new Set(facultyEntries.map((e) => e.courseCode));
        const filtered = res.courses.filter(
          (c) => c.assignedFacultyId === user?.facultyId || assignedCodes.has(c.code)
        );
        setCourses(filtered);
      }
    } catch (e) {
      console.warn('Could not load courses', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user, facultyEntries]);

  // Compute total credits
  const totalCredits = courses.reduce((acc, c) => acc + (c.credits || 0), 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchCourses} />}
    >
      {/* Header Metric Strip */}
      <View style={styles.metricsStrip}>
        <View style={styles.metricItem}>
          <Text style={styles.metricVal}>{courses.length}</Text>
          <Text style={styles.metricLabel}>Assigned Courses</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: COLORS.secondary }]}>{totalCredits}</Text>
          <Text style={styles.metricLabel}>Credit Units</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: '#7C3AED' }]}>{facultyEntries.length}</Text>
          <Text style={styles.metricLabel}>Weekly Lectures</Text>
        </View>
      </View>

      {/* Course Cards List */}
      <View style={styles.list}>
        {courses.map((course) => {
          const sessionsCount = facultyEntries.filter((e) => e.courseCode === course.code).length;
          const assignedSections = course.sections && course.sections.length > 0 ? course.sections : ['CS-A'];

          return (
            <View key={course.code} style={styles.courseCard}>
              <View style={styles.cardTop}>
                <View style={styles.codeWrap}>
                  <Text style={styles.courseCode}>{course.code}</Text>
                  <Badge
                    label={course.isLab ? 'Laboratory Course' : 'Theory Lecture'}
                    variant={course.isLab ? 'info' : 'primary'}
                    size="sm"
                  />
                </View>
                <View style={styles.creditBadge}>
                  <Award size={14} color={COLORS.secondary} />
                  <Text style={styles.creditText}>{course.credits} Credits</Text>
                </View>
              </View>

              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.deptText}>
                {course.department} • {course.semester}
              </Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailBox}>
                  <Users size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailLabel}>
                    Sections: <Text style={styles.detailVal}>{assignedSections.join(', ')}</Text>
                  </Text>
                </View>

                <View style={styles.detailBox}>
                  <Calendar size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailLabel}>
                    Sessions: <Text style={styles.detailVal}>{sessionsCount || course.weeklySessions}x / week</Text>
                  </Text>
                </View>

                <View style={styles.detailBox}>
                  <Layers size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailLabel}>
                    Facility: <Text style={styles.detailVal}>{course.requiredRoomType}</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
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
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOW.subtle,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.borderLight,
  },
  list: {
    gap: SPACING.md,
  },
  courseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  courseCode: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondarySubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  creditText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  courseName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginVertical: 2,
  },
  deptText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  detailsGrid: {
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    gap: 6,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailVal: {
    fontWeight: '700',
    color: COLORS.text,
  },
});





export default FacultyCoursesScreen;

