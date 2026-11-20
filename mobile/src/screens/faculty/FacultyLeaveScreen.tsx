import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { CalendarOff, Plus, CheckCircle2, Clock, Sparkles, User, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { EmptyState } from '../../components/mobile/EmptyState';

export const FacultyLeaveScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [leaveDate, setLeaveDate] = useState('2026-11-26');
  const [leaveDay, setLeaveDay] = useState('Thursday');
  const [leaveReason, setLeaveReason] = useState('Academic Conference Presentation');
  const [courseCode, setCourseCode] = useState('CS-101');
  const [timeSlot, setTimeSlot] = useState('08:30 - 10:00');
  const [submitting, setSubmitting] = useState(false);

  const facultyId = user?.facultyId || 'CS-FAC-01';

  const loadLeaves = async () => {
    try {
      const res = await api.getLeaveRequests();
      if (res.success && res.leaves) {
        setLeaveRequests(res.leaves);
      }
    } catch (e) {
      console.warn('Failed to fetch leave requests', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaves();
  };

  const handleSubmitLeave = async () => {
    if (!leaveReason.trim()) {
      Alert.alert('Missing Field', 'Please describe the reason for your absence.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitLeaveRequest({
        facultyId,
        facultyName: user?.name || 'Dr. Sarah Jenkins',
        department: user?.department || 'Computer Science',
        date: leaveDate,
        day: leaveDay,
        reason: leaveReason,
        affectedClasses: [
          {
            courseCode,
            courseName: 'Introduction to Programming',
            time: timeSlot,
            classroom: 'LAB-CS1',
          },
        ],
      });

      if (res.success) {
        Alert.alert(
          'Leave Recorded',
          `Leave request submitted. Intelligent engine recommended: ${res.leave?.recommendedSubstitute?.name || 'Faculty Member'}.`
        );
        setModalVisible(false);
        loadLeaves();
      }
    } catch (e: any) {
      Alert.alert('Submission Error', e.message || 'Could not record leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Leave & Substitutes" subtitle="Automated Faculty Reassignment" />

      <ScrollView
        contentContainerStyle={styles.scrollList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }, shadow.sm]}>
          <View style={[styles.infoIconWrap, { backgroundColor: colors.infoBg }]}>
            <Sparkles size={18} color={colors.accent} />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>AI Substitute Recommender</Text>
            <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
              When you submit an absence, our constraint engine automatically identifies qualified colleagues without schedule clashes.
            </Text>
          </View>
        </View>

        {/* Submit Request Trigger Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
          style={[styles.requestBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.requestBtnText}>Submit New Leave Request</Text>
        </TouchableOpacity>

        {/* Leave Requests History */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Submitted Requests History</Text>

        {leaveRequests.length === 0 ? (
          <EmptyState
            title="No Past Leave Requests"
            description="You have zero recorded leaves on file. Submit a request above if you anticipate conference or personal absence."
            icon={<CalendarOff size={32} color={colors.textMuted} />}
          />
        ) : (
          leaveRequests.map((req) => (
            <View
              key={req.id}
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
              <View style={styles.leaveCardHeader}>
                <View>
                  <Text style={[styles.leaveDate, { color: colors.text }]}>
                    {req.date} ({req.day})
                  </Text>
                  <Text style={[styles.leaveFaculty, { color: colors.textSecondary }]}>
                    {req.facultyName} • {req.department}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: req.status === 'APPROVED' ? colors.successBg : colors.warningBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: req.status === 'APPROVED' ? colors.success : colors.warning },
                    ]}
                  >
                    {req.status || 'PENDING'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
                Reason: <Text style={{ color: colors.text, fontWeight: '500' }}>{req.reason}</Text>
              </Text>

              {/* AI Recommended Substitute */}
              {req.recommendedSubstitute && (
                <View style={[styles.substituteBox, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm }]}>
                  <View style={styles.substituteHeader}>
                    <Sparkles size={14} color={colors.accent} />
                    <Text style={[styles.substituteHeading, { color: colors.accent }]}>
                      Recommended Substitute:
                    </Text>
                  </View>
                  <Text style={[styles.substituteName, { color: colors.text }]}>
                    {req.recommendedSubstitute.name}
                  </Text>
                  <Text style={[styles.substituteReason, { color: colors.textMuted }]}>
                    {req.recommendedSubstitute.reason}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal for Leave Submission */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderRadius: radius.lg }, shadow.lg]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Submit Leave & Request Substitute</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Absence Date (YYYY-MM-DD)</Text>
              <TextInput
                value={leaveDate}
                onChangeText={setLeaveDate}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Day of Week</Text>
              <TextInput
                value={leaveDay}
                onChangeText={setLeaveDay}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Affected Class Code</Text>
              <TextInput
                value={courseCode}
                onChangeText={setCourseCode}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Absence Reason</Text>
              <TextInput
                value={leaveReason}
                onChangeText={setLeaveReason}
                multiline
                numberOfLines={3}
                style={[styles.inputMulti, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmitLeave}
                disabled={submitting}
                style={[styles.submitBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Confirm Request'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FacultyLeaveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    marginBottom: 20,
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  leaveCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leaveDate: {
    fontSize: 15,
    fontWeight: '700',
  },
  leaveFaculty: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reasonText: {
    fontSize: 12,
    marginBottom: 10,
  },
  substituteBox: {
    padding: 10,
    marginTop: 4,
  },
  substituteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  substituteHeading: {
    fontSize: 11,
    fontWeight: '700',
  },
  substituteName: {
    fontSize: 13,
    fontWeight: '700',
  },
  substituteReason: {
    fontSize: 11,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  inputMulti: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
