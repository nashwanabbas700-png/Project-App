import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import {
  Calendar,
  Grid,
  Clock,
  Plus,
  Send,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Download,
  Share2,
  MapPin,
  Building2,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SHADOWS, SPACING } from '../../constants/theme';
import { DEPARTMENT_OPTIONS, SEMESTER_OPTIONS } from '../../constants/config';
import { useTimetable } from '../../context/TimetableContext';
import { api } from '../../services/api';
import { TimetableEntry, DayOfWeek } from '../../types';
import { DailyTimetable } from '../../components/timetable/DailyTimetable';
import { WeeklyTimetable } from '../../components/timetable/WeeklyTimetable';
import { ConflictBanner } from '../../components/timetable/ConflictBanner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { Badge } from '../../components/common/Badge';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const MasterTimetableScreen: React.FC = () => {
  const {
    masterEntries,
    activeTimetable,
    conflicts,
    selectedSemester,
    setSelectedSemester,
    refreshAll,
  } = useTimetable();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    courseCode: 'CS-101',
    facultyId: 'CS-FAC-01',
    roomNumber: 'LAB-CS1',
    day: 'Monday' as DayOfWeek,
    startTime: '08:30',
    endTime: '10:00',
    section: 'CS-A',
    semester: 'Fall 2026',
    reason: 'Administrative schedule modification',
  });

  // Filter master entries
  const filteredEntries = masterEntries.filter((e) => {
    if (selectedDept !== 'All' && e.department !== selectedDept) return false;
    if (selectedSection !== 'All' && e.section !== selectedSection) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      courseCode: 'CS-101',
      facultyId: 'CS-FAC-01',
      roomNumber: 'LAB-CS1',
      day: 'Monday',
      startTime: '08:30',
      endTime: '10:00',
      section: 'CS-A',
      semester: selectedSemester,
      reason: 'Administrative schedule addition',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setIsEditing(true);
    setSelectedEntryId(entry.id || '');
    setFormData({
      courseCode: entry.courseCode,
      facultyId: entry.facultyId,
      roomNumber: entry.roomNumber,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      section: entry.section,
      semester: entry.semester,
      reason: 'Room and timeslot adjustment',
    });
    setShowModal(true);
  };

  const handleSaveEntry = async () => {
    try {
      if (isEditing) {
        await api.updateTimetableEntry(selectedEntryId, formData, formData.reason);
        Alert.alert('Updated', 'Timetable entry modified. Affected faculty notified automatically.');
      } else {
        await api.addTimetableEntry(formData);
        Alert.alert('Scheduled', 'Timetable entry added successfully.');
      }
      setShowModal(false);
      refreshAll();
    } catch (e: any) {
      Alert.alert('Scheduling Error', e.message);
    }
  };

  const handleDeleteEntry = (entry: TimetableEntry) => {
    Alert.alert(
      'Cancel Session',
      `Cancel ${entry.courseCode} on ${entry.day} ${entry.startTime}?`,
      [
        { text: 'Back', style: 'cancel' },
        {
          text: 'Cancel Class',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTimetableEntry(entry.id!, 'Administrative cancellation');
              refreshAll();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const handlePublishTimetable = async () => {
    const critical = conflicts.filter((c) => c.severity === 'CRITICAL');
    if (critical.length > 0) {
      Alert.alert(
        'Cannot Publish',
        `There are ${critical.length} critical scheduling conflicts. You must resolve all conflicts before institutional publication.`
      );
      return;
    }

    setIsPublishing(true);
    try {
      const res = await api.publishTimetable(activeTimetable?.id || 'tt-fall-2026-main');
      Alert.alert(
        'Timetable Published!',
        `Official timetable is live with quality score of ${res.qualityScore}%. All ${res.affectedFacultyCount} faculty members received real-time updates.`
      );
      refreshAll();
    } catch (e: any) {
      Alert.alert('Publish Failed', e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExportICS = () => {
    const url = api.getExportICSUrl({
      semester: selectedSemester,
      department: selectedDept !== 'All' ? selectedDept : undefined,
      section: selectedSection !== 'All' ? selectedSection : undefined,
    });
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const handleExportCSV = () => {
    const url = api.getExportCSVUrl({
      semester: selectedSemester,
      department: selectedDept !== 'All' ? selectedDept : undefined,
      section: selectedSection !== 'All' ? selectedSection : undefined,
    });
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Publish & Status Header */}
      <View style={styles.topCard}>
        <View style={styles.topCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.topCardTitle}>Master Institutional Schedule</Text>
            <Text style={styles.topCardSub}>
              Quality Score: {activeTimetable?.qualityScore || 96}% • {masterEntries.length} total classes
            </Text>
          </View>
          <Badge
            label={activeTimetable?.status === 'published' ? 'Live & Published' : 'Draft Schedule'}
            variant={activeTimetable?.status === 'published' ? 'success' : 'warning'}
          />
        </View>

        <View style={styles.publishActionRow}>
          <Button
            title="Publish Timetable"
            onPress={handlePublishTimetable}
            loading={isPublishing}
            icon={<Send size={16} color={COLORS.surface} />}
            size="md"
            style={{ flex: 1 }}
          />

          <Button
            title="Add Class Entry"
            onPress={handleOpenAdd}
            variant="outline"
            icon={<Plus size={16} color={COLORS.primary} />}
            size="md"
          />
        </View>

        {/* Calendar Sync & Export Strip */}
        <View style={styles.exportActionStrip}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportICS} activeOpacity={0.8}>
            <Calendar size={13} color={COLORS.secondary} />
            <Text style={styles.exportButtonText}>Sync Calendar (.ics)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV} activeOpacity={0.8}>
            <Download size={13} color={COLORS.secondary} />
            <Text style={styles.exportButtonText}>Export Table (.csv)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conflict Detection Banner */}
      <ConflictBanner conflicts={conflicts} />

      {/* Department Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
        {DEPARTMENT_OPTIONS.map((dept) => {
          const isSelected = selectedDept === dept;
          return (
            <TouchableOpacity
              key={dept}
              onPress={() => setSelectedDept(dept)}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
            >
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                {dept}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* View Switcher: Daily vs Weekly */}
      <View style={styles.viewSwitchBar}>
        <Text style={styles.filteredCount}>
          Showing {filteredEntries.length} classes
        </Text>

        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'daily' && styles.toggleBtnActive]}
            onPress={() => setViewMode('daily')}
          >
            <Clock size={14} color={viewMode === 'daily' ? COLORS.surface : COLORS.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'daily' && styles.toggleTextActive]}>
              Daily
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'weekly' && styles.toggleBtnActive]}
            onPress={() => setViewMode('weekly')}
          >
            <Grid size={14} color={viewMode === 'weekly' ? COLORS.surface : COLORS.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>
              Weekly Matrix
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedule Display */}
      {viewMode === 'daily' ? (
        <DailyTimetable
          entries={filteredEntries}
          showFaculty={true}
          onEntryPress={(entry) => handleOpenEdit(entry)}
        />
      ) : (
        <WeeklyTimetable entries={filteredEntries} showFaculty={true} />
      )}

      {/* Add / Edit Entry Modal */}
      <ModalWrapper
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Modify Timetable Entry' : 'Add Timetable Entry'}
        subtitle="Automatic conflict detection validates room and faculty availability"
      >
        <Input
          label="Course Code"
          value={formData.courseCode}
          onChangeText={(t) => setFormData({ ...formData, courseCode: t })}
          placeholder="e.g. CS-101"
        />

        <Input
          label="Faculty ID"
          value={formData.facultyId}
          onChangeText={(t) => setFormData({ ...formData, facultyId: t })}
          placeholder="e.g. CS-FAC-01"
        />

        <Input
          label="Classroom Number"
          value={formData.roomNumber}
          onChangeText={(t) => setFormData({ ...formData, roomNumber: t })}
          placeholder="e.g. LAB-CS1"
        />

        <Input
          label="Student Section"
          value={formData.section}
          onChangeText={(t) => setFormData({ ...formData, section: t })}
          placeholder="e.g. CS-A"
        />

        <Text style={styles.fieldLabel}>Day of Week</Text>
        <View style={styles.daysRow}>
          {DAYS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayChip, formData.day === d && styles.dayChipActive]}
              onPress={() => setFormData({ ...formData, day: d })}
            >
              <Text style={[styles.dayChipText, formData.day === d && styles.dayChipTextActive]}>
                {d.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.timeRow}>
          <Input
            label="Start Time"
            value={formData.startTime}
            onChangeText={(t) => setFormData({ ...formData, startTime: t })}
            placeholder="08:30"
            containerStyle={{ flex: 1 }}
          />
          <Input
            label="End Time"
            value={formData.endTime}
            onChangeText={(t) => setFormData({ ...formData, endTime: t })}
            placeholder="10:00"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Input
          label="Reason for Modification"
          value={formData.reason}
          onChangeText={(t) => setFormData({ ...formData, reason: t })}
          placeholder="e.g. Room upgrade for CS laboratory"
        />

        <Button
          title={isEditing ? 'Update & Notify Faculty' : 'Add to Schedule'}
          onPress={handleSaveEntry}
          style={{ marginTop: SPACING.md }}
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
  topCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  topCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  topCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  topCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  publishActionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  exportActionStrip: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  exportButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  filterBar: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: COLORS.textOnDark,
  },
  viewSwitchBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  filteredCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    paddingVertical: 5,
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.md,
  },
  dayChip: {
    flex: 1,
    backgroundColor: COLORS.surfaceBlue,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  dayChipTextActive: {
    color: COLORS.textOnDark,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});





export default MasterTimetableScreen;

