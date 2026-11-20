import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { BookOpen, Plus, Search, Edit2, Trash2, Award, Users, Layers } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme'
import { DEPARTMENT_OPTIONS } from '../../constants/config';
import { api } from '../../services/api';
import { Course, RoomType } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ModalWrapper } from '../../components/common/ModalWrapper';

const ROOM_TYPES: RoomType[] = ['Lecture Room', 'Computer Lab', 'Science Lab', 'Seminar Hall'];

export const CourseManagementScreen: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Course>>({
    code: '',
    name: '',
    department: 'Computer Science',
    semester: 'Fall 2026',
    credits: 3,
    weeklySessions: 2,
    durationMinutes: 90,
    requiredRoomType: 'Lecture Room',
    isLab: false,
    assignedFacultyName: '',
    sections: ['CS-A'],
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCourses({
        department: selectedDept !== 'All' ? selectedDept : undefined,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (e) {
      console.warn('Could not load course catalog', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedDept, search]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      code: '',
      name: '',
      department: selectedDept !== 'All' ? selectedDept : 'Computer Science',
      semester: 'Fall 2026',
      credits: 3,
      weeklySessions: 2,
      durationMinutes: 90,
      requiredRoomType: 'Lecture Room',
      isLab: false,
      sections: ['A'],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setIsEditing(true);
    setFormData({ ...course });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.department) {
      Alert.alert('Required Fields', 'Course Code, Name, and Department are required.');
      return;
    }

    try {
      if (isEditing) {
        await api.updateCourse(formData.code!, formData);
        Alert.alert('Success', 'Course updated successfully.');
      } else {
        await api.createCourse(formData);
        Alert.alert('Success', 'Course created successfully.');
      }
      setShowModal(false);
      fetchCourses();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message);
    }
  };

  const handleDelete = (code: string, name: string) => {
    Alert.alert('Delete Course', `Are you sure you want to delete ${code} (${name})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteCourse(code);
            fetchCourses();
          } catch (e: any) {
            Alert.alert('Delete Failed', e.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchCourses} />}
    >
      {/* SaaS Page Header */}
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Course Catalog</Text>
          <Text style={styles.pageSubtitle}>Curriculum offerings, weekly lecture quotas & department assignments</Text>
        </View>
        <Button
          title="Add Course"
          onPress={handleOpenAdd}
          icon={<Plus size={16} color={COLORS.textOnDark} />}
          size="md"
        />
      </View>

      {/* Top Search */}
      <View style={styles.topActions}>
        <Input
          placeholder="Search by code, title, or faculty..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={16} color={COLORS.textMuted} />}
          containerStyle={{ flex: 1, marginBottom: 0 }}
        />
      </View>

      {/* Dept Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptRow}>
        {DEPARTMENT_OPTIONS.map((dept) => {
          const isSelected = selectedDept === dept;
          return (
            <TouchableOpacity
              key={dept}
              onPress={() => setSelectedDept(dept)}
              style={[styles.deptChip, isSelected && styles.deptChipSelected]}
            >
              <Text style={[styles.deptChipText, isSelected && styles.deptChipTextSelected]}>
                {dept}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Course List */}
      <View style={styles.list}>
        {courses.map((course) => (
          <View key={course.code} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.codeText}>{course.code}</Text>
                  <Badge
                    label={course.isLab ? 'Lab Component' : 'Theory'}
                    variant={course.isLab ? 'info' : 'primary'}
                    size="sm"
                  />
                  <Badge label={`${course.credits} Credits`} variant="secondary" size="sm" />
                </View>

                <Text style={styles.courseTitle}>{course.name}</Text>
                <Text style={styles.courseDept}>
                  {course.department} • {course.semester}
                </Text>
              </View>

              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleOpenEdit(course)}
                >
                  <Edit2 size={16} color={COLORS.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]}
                  onPress={() => handleDelete(course.code, course.name)}
                >
                  <Trash2 size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaBox}>
                <Users size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>
                  Sections: <Text style={{ fontWeight: '700' }}>{course.sections?.join(', ') || 'A'}</Text>
                </Text>
              </View>

              <View style={styles.metaBox}>
                <Layers size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>
                  Room Required: <Text style={{ fontWeight: '700' }}>{course.requiredRoomType}</Text>
                </Text>
              </View>

              {course.assignedFacultyName && (
                <View style={styles.metaBox}>
                  <Award size={12} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>
                    Instructor: <Text style={{ fontWeight: '700' }}>{course.assignedFacultyName}</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Add / Edit Course Modal */}
      <ModalWrapper
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Academic Course' : 'Create New Course'}
        subtitle="Specify curriculum credit units and required laboratory infrastructure"
      >
        <Input
          label="Course Code"
          value={formData.code}
          onChangeText={(t) => setFormData({ ...formData, code: t })}
          placeholder="e.g. CS-204"
          editable={!isEditing}
        />

        <Input
          label="Course Name"
          value={formData.name}
          onChangeText={(t) => setFormData({ ...formData, name: t })}
          placeholder="e.g. Data Structures & Algorithms"
        />

        <Input
          label="Department"
          value={formData.department}
          onChangeText={(t) => setFormData({ ...formData, department: t })}
          placeholder="Computer Science"
        />

        <Input
          label="Credit Units"
          value={String(formData.credits || 3)}
          onChangeText={(t) => setFormData({ ...formData, credits: Number(t) || 3 })}
          placeholder="3"
          keyboardType="numeric"
        />

        <Input
          label="Weekly Lecture/Lab Sessions Count"
          value={String(formData.weeklySessions || 2)}
          onChangeText={(t) => setFormData({ ...formData, weeklySessions: Number(t) || 2 })}
          placeholder="2"
          keyboardType="numeric"
        />

        {/* Room Type Selector */}
        <Text style={styles.modalFieldLabel}>Required Classroom Facility</Text>
        <View style={styles.roomTypePills}>
          {ROOM_TYPES.map((type) => {
            const isSelected = formData.requiredRoomType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typePill, isSelected && styles.typePillActive]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    requiredRoomType: type,
                    isLab: type.includes('Lab'),
                  })
                }
              >
                <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={isEditing ? 'Update Course' : 'Create Course'}
          onPress={handleSave}
          style={{ marginTop: SPACING.lg }}
        />
      </ModalWrapper>
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
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  deptRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  deptChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deptChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  deptChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deptChipTextSelected: {
    color: COLORS.textOnDark,
  },
  list: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  courseDept: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roomTypePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typePill: {
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typePillTextActive: {
    color: COLORS.textOnDark,
  },
});





export default CourseManagementScreen;

