import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { BookOpen, Search, Clock, Award, Laptop, Users, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Course } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { EmptyState } from '../../components/mobile/EmptyState';

export const StudentCoursesScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = async () => {
    try {
      const res = await api.getCourses({
        department: user?.department || 'Computer Science',
      });
      if (res.success) {
        setCourses(res.courses || []);
      }
    } catch (e) {
      console.warn('Failed to load student courses', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = filteredCourses.reduce((sum, c) => sum + (c.credits || 3), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Enrolled Curriculum" subtitle={`${user?.department || 'Computer Science'} • Fall 2026`} />

      <View style={styles.contentWrap}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
            },
          ]}
        >
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search enrolled course or code..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Credit Summary Strip */}
        <View
          style={[
            styles.summaryPill,
            { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm },
          ]}
        >
          <Award size={14} color={colors.accent} />
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Enrolled in <Text style={{ color: colors.accent, fontWeight: '700' }}>{courses.length} courses</Text> (
            {totalCredits} total credit hours)
          </Text>
        </View>

        {/* Course Cards List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          contentContainerStyle={styles.listContainer}
        >
          {filteredCourses.length === 0 ? (
            <EmptyState
              title="No Courses Found"
              description="No registered courses matching your search query in the departmental database."
            />
          ) : (
            filteredCourses.map((c) => (
              <View
                key={c.code}
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
                  <View style={[styles.codeBadge, { backgroundColor: `${colors.accent}16` }]}>
                    <Text style={[styles.codeText, { color: colors.accent }]}>{c.code}</Text>
                  </View>
                  <View style={[styles.creditBadge, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.creditText, { color: colors.textSecondary }]}>{c.credits} Credits</Text>
                  </View>
                </View>

                <Text style={[styles.courseTitle, { color: colors.text }]}>{c.name}</Text>

                <View style={styles.specsRow}>
                  <View style={styles.specItem}>
                    <Laptop size={13} color={colors.textSecondary} />
                    <Text style={[styles.specText, { color: colors.textSecondary }]}>
                      {c.requiredRoomType || 'Lecture Hall'}
                    </Text>
                  </View>
                  <View style={styles.specItem}>
                    <Clock size={13} color={colors.textSecondary} />
                    <Text style={[styles.specText, { color: colors.textSecondary }]}>
                      {c.weeklySessions || 2} sessions / wk ({c.durationMinutes || 90}m)
                    </Text>
                  </View>
                </View>

                {c.assignedFacultyName && (
                  <View style={[styles.instructorRow, { borderTopColor: colors.border }]}>
                    <Users size={13} color={colors.textMuted} />
                    <Text style={[styles.instructorText, { color: colors.textSecondary }]} numberOfLines={1}>
                      Instructor: <Text style={{ fontWeight: '600', color: colors.text }}>{c.assignedFacultyName}</Text>
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default StudentCoursesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 30,
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
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 10,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontSize: 11,
    fontWeight: '500',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  instructorText: {
    fontSize: 12,
  },
});
