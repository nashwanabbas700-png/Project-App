import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Users, Plus, Search, Edit2, Trash2, Clock, MapPin, Mail, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme'
import { DEPARTMENT_OPTIONS } from '../../constants/config';
import { api } from '../../services/api';
import { Faculty } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ModalWrapper } from '../../components/common/ModalWrapper';

export const FacultyManagementScreen: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Faculty>>({
    facultyId: '',
    name: '',
    email: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    maxWeeklyHours: 16,
    preferredTimes: ['Morning'],
    unavailableDays: [],
    phone: '',
    office: '',
  });

  const [leaves, setLeaves] = useState<any[]>([]);

  const fetchLeaves = async () => {
    try {
      const res = await api.getLeaveRequests();
      if (res.success) setLeaves(res.leaves);
    } catch (e) {
      // silent
    }
  };

  const handleApproveSubstitute = async (leaveId: string, subName: string) => {
    try {
      await api.updateLeaveRequest(leaveId, { status: 'APPROVED' });
      Alert.alert('Substitute Approved & Assigned!', `${subName} has been assigned to cover the session. Notification sent.`);
      fetchLeaves();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const fetchFaculty = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFacultyList({
        department: selectedDept !== 'All' ? selectedDept : undefined,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setFaculty(res.faculty);
      }
    } catch (e) {
      console.warn('Failed to load faculty list', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
    fetchLeaves();
  }, [selectedDept, search]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      facultyId: `FAC-${1000 + faculty.length + 1}`,
      name: '',
      email: '',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      maxWeeklyHours: 16,
      preferredTimes: ['Morning'],
      unavailableDays: [],
      phone: '',
      office: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setIsEditing(true);
    setFormData({ ...fac });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.facultyId) {
      Alert.alert('Required Fields', 'Please fill in Name, Faculty ID, and Email.');
      return;
    }

    try {
      if (isEditing) {
        await api.updateFaculty(formData.facultyId!, formData);
        Alert.alert('Success', 'Faculty profile updated.');
      } else {
        await api.createFaculty(formData);
        Alert.alert('Success', 'Faculty member created successfully.');
      }
      setShowModal(false);
      fetchFaculty();
    } catch (e: any) {
      Alert.alert('Action Failed', e.message);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Faculty', `Are you sure you want to remove ${name} from the directory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteFaculty(id);
            fetchFaculty();
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
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchFaculty} />}
    >
      {/* SaaS Page Header */}
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Faculty Registry</Text>
          <Text style={styles.pageSubtitle}>Faculty roster, workload caps, availability & departmental assignments</Text>
        </View>
        <Button
          title="Add Faculty"
          onPress={handleOpenAdd}
          icon={<Plus size={16} color={COLORS.textOnDark} />}
          size="md"
        />
      </View>

      {/* ── AI Substitute Recommendation & Leave Manager ── */}
      {leaves.length > 0 && (
        <View style={styles.leaveManagerCard}>
          <View style={styles.leaveHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.leaveTitle}>Faculty Absence & AI Substitute Finder</Text>
              <Text style={styles.leaveSub}>Automated substitute matching for scheduled classes</Text>
            </View>
            <Badge label={`${leaves.length} Request`} variant="warning" size="sm" />
          </View>

          {leaves.map((lv) => (
            <View key={lv.id} style={styles.leaveItem}>
              <View style={styles.leaveTopRow}>
                <Text style={styles.leaveFacName}>{lv.facultyName} ({lv.department})</Text>
                <Badge
                  label={lv.status === 'APPROVED' ? '✓ Reassigned' : 'Pending Cover'}
                  variant={lv.status === 'APPROVED' ? 'success' : 'danger'}
                  size="sm"
                />
              </View>
              <Text style={styles.leaveReasonText}>
                Date: {lv.day}, {lv.date} • Reason: {lv.reason}
              </Text>

              {lv.recommendedSubstitute && (
                <View style={styles.subRecBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <Sparkles size={12} color={COLORS.secondary} />
                    <Text style={styles.subRecTitle}>Recommended Substitute: {lv.recommendedSubstitute.name}</Text>
                  </View>
                  <Text style={styles.subRecReason}>{lv.recommendedSubstitute.reason}</Text>

                  {lv.status !== 'APPROVED' && (
                    <TouchableOpacity
                      style={styles.assignSubBtn}
                      onPress={() => handleApproveSubstitute(lv.id, lv.recommendedSubstitute.name)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.assignSubBtnText}>Approve & Assign Substitute</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.topActions}>
        <Input
          placeholder="Search by faculty name, ID, or email..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={16} color={COLORS.textMuted} />}
          containerStyle={{ flex: 1, marginBottom: 0 }}
        />
      </View>

      {/* Department Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.deptFilterRow}
      >
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

      {/* Faculty List */}
      <View style={styles.list}>
        {faculty.map((fac) => {
          const currentHours = fac.currentWeeklyHours || 0;
          const maxHours = fac.maxWeeklyHours || 16;
          const pct = Math.round((currentHours / maxHours) * 100);

          return (
            <View key={fac.facultyId} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.facName}>{fac.name}</Text>
                    <View style={styles.idChip}>
                      <Text style={styles.idChipText}>{fac.facultyId}</Text>
                    </View>
                  </View>
                  <Text style={styles.designationText}>
                    {fac.designation} • {fac.department}
                  </Text>
                  <Text style={styles.emailText}>{fac.email}</Text>
                </View>

                <View style={styles.actionBtns}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleOpenEdit(fac)}
                  >
                    <Edit2 size={16} color={COLORS.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleDelete(fac.facultyId, fac.name)}
                  >
                    <Trash2 size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Workload Progress Bar */}
              <View style={styles.workloadWrap}>
                <View style={styles.workloadLabels}>
                  <Text style={styles.workloadLabelText}>Weekly Allocation</Text>
                  <Text style={styles.workloadValText}>
                    {currentHours} / {maxHours} hrs ({pct}%)
                  </Text>
                </View>
                <View style={styles.workloadTrack}>
                  <View
                    style={[
                      styles.workloadFill,
                      {
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: pct > 100 ? COLORS.danger : COLORS.success,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Preferences & Restrictions Row */}
              <View style={styles.metaRow}>
                {fac.preferredTimes && fac.preferredTimes.length > 0 && (
                  <View style={styles.metaBadge}>
                    <Clock size={12} color={COLORS.secondary} />
                    <Text style={styles.metaText}>Prefers {fac.preferredTimes.join(', ')}</Text>
                  </View>
                )}

                {fac.unavailableDays && fac.unavailableDays.length > 0 && (
                  <View style={[styles.metaBadge, { backgroundColor: '#FEF3C7' }]}>
                    <ShieldAlert size={12} color="#D97706" />
                    <Text style={[styles.metaText, { color: '#B45309' }]}>
                      Unavailable {fac.unavailableDays.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Add / Edit Faculty Modal */}
      <ModalWrapper
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Faculty Record' : 'Add New Faculty Member'}
        subtitle="Manage academic workload ceiling and schedule constraints"
      >
        <Input
          label="Faculty Full Name"
          value={formData.name}
          onChangeText={(t) => setFormData({ ...formData, name: t })}
          placeholder="e.g. Dr. Sarah Jenkins"
        />

        <Input
          label="Faculty Institutional ID"
          value={formData.facultyId}
          onChangeText={(t) => setFormData({ ...formData, facultyId: t })}
          placeholder="e.g. CS-FAC-01"
          editable={!isEditing}
        />

        <Input
          label="University Email"
          value={formData.email}
          onChangeText={(t) => setFormData({ ...formData, email: t })}
          placeholder="faculty@EduNova.edu"
          keyboardType="email-address"
        />

        <Input
          label="Department"
          value={formData.department}
          onChangeText={(t) => setFormData({ ...formData, department: t })}
          placeholder="Computer Science"
        />

        <Input
          label="Designation / Academic Rank"
          value={formData.designation}
          onChangeText={(t) => setFormData({ ...formData, designation: t })}
          placeholder="Associate Professor"
        />

        <Input
          label="Max Weekly Teaching Hours Ceiling"
          value={String(formData.maxWeeklyHours || 16)}
          onChangeText={(t) => setFormData({ ...formData, maxWeeklyHours: Number(t) || 16 })}
          placeholder="16"
          keyboardType="numeric"
        />

        <Input
          label="Campus Office"
          value={formData.office}
          onChangeText={(t) => setFormData({ ...formData, office: t })}
          placeholder="Turing Hall, Room 304"
        />

        <Input
          label="Phone Extension"
          value={formData.phone}
          onChangeText={(t) => setFormData({ ...formData, phone: t })}
          placeholder="+1 (555) 234-8901"
        />

        <Button
          title={isEditing ? 'Save Changes' : 'Create Faculty Member'}
          onPress={handleSave}
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
  leaveManagerCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBEB',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  leaveTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  leaveSub: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 1,
  },
  leaveItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  leaveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leaveFacName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  leaveReasonText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  subRecBox: {
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 4,
  },
  subRecTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  subRecReason: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  assignSubBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  assignSubBtnText: {
    color: COLORS.textOnDark,
    fontSize: 11,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  deptFilterRow: {
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
    gap: SPACING.sm,
  },
  facName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  idChip: {
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  idChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  designationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emailText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
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
  workloadWrap: {
    marginVertical: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  workloadLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  workloadLabelText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  workloadValText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  workloadTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  workloadFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.xs,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.secondary,
  },
});






export default FacultyManagementScreen;

