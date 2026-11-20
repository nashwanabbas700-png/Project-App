import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Users,
  Search,
  Sparkles,
  CheckCircle,
  Clock,
  Mail,
  ChevronRight,
  Check,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Faculty } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { EmptyState } from '../../components/mobile/EmptyState';

export const AdminFacultyScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [facRes, leaveRes] = await Promise.all([
        api.getFacultyList(),
        api.getLeaveRequests(),
      ]);

      if (facRes.success && facRes.faculty) {
        setFacultyList(facRes.faculty);
      }
      if (leaveRes.success && leaveRes.leaves) {
        setLeaveRequests(leaveRes.leaves);
      }
    } catch (e) {
      console.warn('Faculty data fetch error', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleApproveLeave = async (leave: any) => {
    try {
      const res = await api.updateLeaveRequest(leave.id, {
        status: 'APPROVED',
        approvedSubstitute: leave.recommendedSubstitute,
      });

      if (res.success) {
        Alert.alert(
          'Leave Approved',
          `Substitute ${leave.recommendedSubstitute?.name || 'Assigned'} confirmed for ${leave.date}.`
        );
        loadData();
      }
    } catch (e: any) {
      Alert.alert('Approval Error', e.message);
    }
  };

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase())
  );

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Faculty Directory" subtitle="Staff Workload & Substitutes" />

      <ScrollView
        contentContainerStyle={styles.scrollList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending Leave Approvals Banner */}
        {pendingLeaves.length > 0 && (
          <View style={styles.leavesSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Leave Requests</Text>
              <View style={[styles.pendingPill, { backgroundColor: colors.warningBg }]}>
                <Text style={[styles.pendingPillText, { color: colors.warning }]}>
                  {pendingLeaves.length} Action Needed
                </Text>
              </View>
            </View>

            {pendingLeaves.map((leave) => (
              <View
                key={leave.id}
                style={[
                  styles.leaveCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                  shadow.sm,
                ]}
              >
                <View style={styles.leaveTopRow}>
                  <View>
                    <Text style={[styles.leaveFacultyName, { color: colors.text }]}>{leave.facultyName}</Text>
                    <Text style={[styles.leaveDetails, { color: colors.textSecondary }]}>
                      {leave.date} ({leave.day}) • {leave.department}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.leaveReason, { color: colors.text }]}>
                  Reason: <Text style={{ fontWeight: '400', color: colors.textSecondary }}>{leave.reason}</Text>
                </Text>

                {leave.recommendedSubstitute && (
                  <View style={[styles.aiSubstituteBox, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm }]}>
                    <View style={styles.aiHeader}>
                      <Sparkles size={13} color={colors.accent} />
                      <Text style={[styles.aiHeading, { color: colors.accent }]}>AI Recommended Substitute:</Text>
                    </View>
                    <Text style={[styles.subName, { color: colors.text }]}>{leave.recommendedSubstitute.name}</Text>
                    <Text style={[styles.subReason, { color: colors.textMuted }]}>{leave.recommendedSubstitute.reason}</Text>
                  </View>
                )}

                <View style={styles.leaveActionsRow}>
                  <TouchableOpacity
                    onPress={() => handleApproveLeave(leave)}
                    style={[styles.approveBtn, { backgroundColor: colors.success, borderRadius: radius.sm }]}
                  >
                    <Check size={14} color="#FFFFFF" />
                    <Text style={styles.approveBtnText}>Approve & Assign Substitute</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

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
            placeholder="Search professor name or department..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Faculty List Header */}
        <View style={styles.facultyHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            Teaching Faculty ({filteredFaculty.length})
          </Text>
        </View>

        {filteredFaculty.map((fac) => {
          const hours = fac.currentWeeklyHours || 12;
          const maxH = fac.maxWeeklyHours || 16;
          const pct = Math.min(100, Math.round((hours / maxH) * 100));

          return (
            <View
              key={fac.facultyId}
              style={[
                styles.facultyCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
                shadow.sm,
              ]}
            >
              <View style={styles.facultyCardTop}>
                <View style={[styles.avatarWrap, { backgroundColor: colors.accent }]}>
                  <Text style={styles.avatarLetter}>
                    {fac.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </Text>
                </View>

                <View style={styles.facInfoWrap}>
                  <Text style={[styles.facName, { color: colors.text }]}>{fac.name}</Text>
                  <Text style={[styles.facDept, { color: colors.textSecondary }]}>
                    {fac.department} • {fac.designation}
                  </Text>
                </View>

                <View style={[styles.loadPill, { backgroundColor: colors.successBg }]}>
                  <Text style={[styles.loadPillText, { color: colors.success }]}>BALANCED</Text>
                </View>
              </View>

              {/* Workload Progress Bar */}
              <View style={styles.workloadBarWrap}>
                <View style={styles.workloadBarTop}>
                  <Text style={[styles.workloadLabel, { color: colors.textSecondary }]}>Weekly Contact</Text>
                  <Text style={[styles.workloadRatio, { color: colors.text }]}>
                    {hours}.0 / {maxH}.0 hrs ({pct}%)
                  </Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: colors.surfaceSecondary }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.accent }]} />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default AdminFacultyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  leavesSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  pendingPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pendingPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  leaveCard: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  leaveTopRow: {
    marginBottom: 6,
  },
  leaveFacultyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  leaveDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  leaveReason: {
    fontSize: 12,
    marginBottom: 8,
  },
  aiSubstituteBox: {
    padding: 10,
    marginBottom: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  aiHeading: {
    fontSize: 11,
    fontWeight: '700',
  },
  subName: {
    fontSize: 12,
    fontWeight: '700',
  },
  subReason: {
    fontSize: 10,
    marginTop: 1,
  },
  leaveActionsRow: {
    flexDirection: 'row',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  facultyHeaderRow: {
    marginBottom: 10,
  },
  facultyCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  facultyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  facInfoWrap: {
    flex: 1,
  },
  facName: {
    fontSize: 14,
    fontWeight: '700',
  },
  facDept: {
    fontSize: 11,
    marginTop: 2,
  },
  loadPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  loadPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  workloadBarWrap: {
    gap: 6,
  },
  workloadBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workloadLabel: {
    fontSize: 11,
  },
  workloadRatio: {
    fontSize: 11,
    fontWeight: '600',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
