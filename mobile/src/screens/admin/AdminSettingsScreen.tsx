import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import {
  Settings,
  BookOpen,
  Building2,
  Clock,
  Moon,
  Sun,
  LogOut,
  Plus,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Course, Classroom } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { API_BASE_URL } from '../../constants/config';

export const AdminSettingsScreen: React.FC = () => {
  const { colors, isDark, toggleTheme, radius, shadow } = useTheme();
  const { user, logout } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [historyCount, setHistoryCount] = useState(0);

  // Quick Add Course Modal
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDept, setCourseDept] = useState('Computer Science');
  const [courseCredits, setCourseCredits] = useState('3');
  const [courseRoomType, setCourseRoomType] = useState<'Lecture Room' | 'Computer Lab' | 'Science Lab' | 'Seminar Hall'>('Lecture Room');

  // Quick Add Room Modal
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomBuilding, setRoomBuilding] = useState('Central Academic Quad');
  const [roomCapacity, setRoomCapacity] = useState('50');
  const [roomType, setRoomType] = useState<'Lecture Room' | 'Computer Lab' | 'Science Lab' | 'Seminar Hall'>('Lecture Room');

  const loadSettingsData = async () => {
    try {
      const [coursesRes, roomsRes, histRes] = await Promise.all([
        api.getCourses(),
        api.getClassrooms(),
        api.getTimetableHistory(),
      ]);

      if (coursesRes.success && coursesRes.courses) setCourses(coursesRes.courses);
      if (roomsRes.success && roomsRes.classrooms) setClassrooms(roomsRes.classrooms);
      if (histRes.success && histRes.history) setHistoryCount(histRes.history.length);
    } catch (e) {
      console.warn('Admin settings load error', e);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleCreateCourse = async () => {
    if (!courseCode.trim() || !courseName.trim()) {
      Alert.alert('Required Fields', 'Please enter course code and title.');
      return;
    }
    try {
      const res = await api.createCourse({
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
        department: courseDept,
        credits: parseInt(courseCredits, 10) || 3,
        weeklySessions: 2,
        durationMinutes: 90,
        requiredRoomType: courseRoomType,
        isLab: courseRoomType.includes('Lab'),
        sections: ['A'],
        semester: 'Fall 2026',
      });

      if (res.success) {
        Alert.alert('Course Created', `${res.course.code} added to academic curriculum.`);
        setCourseModalVisible(false);
        setCourseCode('');
        setCourseName('');
        loadSettingsData();
      }
    } catch (e: any) {
      Alert.alert('Creation Error', e.message);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomNumber.trim()) {
      Alert.alert('Required Field', 'Please enter a classroom number.');
      return;
    }
    try {
      const res = await api.createClassroom({
        roomNumber: roomNumber.trim().toUpperCase(),
        building: roomBuilding,
        capacity: parseInt(roomCapacity, 10) || 45,
        type: roomType,
        features: ['Smart Projector', 'Whiteboard', 'WiFi Access'],
        isAvailable: true,
      });

      if (res.success) {
        Alert.alert('Classroom Added', `Room ${res.classroom.roomNumber} created.`);
        setRoomModalVisible(false);
        setRoomNumber('');
        loadSettingsData();
      }
    } catch (e: any) {
      Alert.alert('Creation Error', e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="System Settings" subtitle="Institutional Configuration" rightAction="none" />

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {/* Academic Course Catalog Control */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              ACADEMIC CATALOG ({courses.length})
            </Text>
            <TouchableOpacity onPress={() => setCourseModalVisible(true)} style={styles.addBtn}>
              <Plus size={14} color={colors.accent} />
              <Text style={[styles.addBtnText, { color: colors.accent }]}>Add Course</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            {courses.slice(0, 4).map((c, idx) => (
              <View
                key={c.code}
                style={[
                  styles.itemRow,
                  idx !== 3 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.itemLeft}>
                  <BookOpen size={16} color={colors.accent} />
                  <View>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>
                      {c.code} • {c.name}
                    </Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                      {c.department} • {c.credits} Cr • {c.requiredRoomType}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Campus Rooms Inventory Control */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              CAMPUS CLASSROOMS ({classrooms.length})
            </Text>
            <TouchableOpacity onPress={() => setRoomModalVisible(true)} style={styles.addBtn}>
              <Plus size={14} color={colors.teal} />
              <Text style={[styles.addBtnText, { color: colors.teal }]}>Add Room</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            {classrooms.slice(0, 4).map((r, idx) => (
              <View
                key={r.roomNumber}
                style={[
                  styles.itemRow,
                  idx !== 3 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.itemLeft}>
                  <Building2 size={16} color={colors.teal} />
                  <View>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>
                      Room {r.roomNumber} ({r.type})
                    </Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                      {r.building} • Capacity: {r.capacity} seats
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Appearance & Dark Mode */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                {isDark ? <Moon size={18} color={colors.warning} /> : <Sun size={18} color={colors.accent} />}
                <View>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                    {isDark ? 'Dark theme active' : 'Light theme active'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Server & API Gateway Connection Info */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>API GATEWAY & INFRASTRUCTURE</Text>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Server size={16} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>REST Endpoint Base</Text>
                  <Text style={[styles.itemSub, { color: colors.textMuted }]} numberOfLines={1}>
                    {API_BASE_URL}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusTag, { backgroundColor: colors.successBg }]}>
                <Text style={[styles.statusTagText, { color: colors.success }]}>Connected</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Clock size={16} color={colors.purple} />
                <View>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>Total Audit Records</Text>
                  <Text style={[styles.itemSub, { color: colors.textMuted }]}>
                    {historyCount} modifications tracked in immutable ledger
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={logout}
          style={[styles.logoutBtn, { backgroundColor: colors.dangerBg, borderRadius: radius.md }]}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out Administrator</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          EduNova SmartSched Administrator v1.0.0 (Android Native)
        </Text>
      </ScrollView>

      {/* Add Course Modal */}
      <Modal visible={courseModalVisible} transparent animationType="slide" onRequestClose={() => setCourseModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderRadius: radius.lg }, shadow.lg]}>
            <Text style={[styles.modalHeading, { color: colors.text }]}>Add New Course</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Course Code (e.g. CS-205)</Text>
              <TextInput
                value={courseCode}
                onChangeText={setCourseCode}
                placeholder="CS-205"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Course Title</Text>
              <TextInput
                value={courseName}
                onChangeText={setCourseName}
                placeholder="Cloud Computing Systems"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Credit Hours</Text>
              <TextInput
                value={courseCredits}
                onChangeText={setCourseCredits}
                keyboardType="numeric"
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setCourseModalVisible(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateCourse} style={[styles.submitBtn, { backgroundColor: colors.accent }]}>
                <Text style={styles.submitBtnText}>Add Course</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Room Modal */}
      <Modal visible={roomModalVisible} transparent animationType="slide" onRequestClose={() => setRoomModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderRadius: radius.lg }, shadow.lg]}>
            <Text style={[styles.modalHeading, { color: colors.text }]}>Add Campus Classroom</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Room Number (e.g. LAB-CS3)</Text>
              <TextInput
                value={roomNumber}
                onChangeText={setRoomNumber}
                placeholder="LAB-CS3"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Building / Complex</Text>
              <TextInput
                value={roomBuilding}
                onChangeText={setRoomBuilding}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Student Capacity</Text>
              <TextInput
                value={roomCapacity}
                onChangeText={setRoomCapacity}
                keyboardType="numeric"
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setRoomModalVisible(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateRoom} style={[styles.submitBtn, { backgroundColor: colors.teal }]}>
                <Text style={styles.submitBtnText}>Add Classroom</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupCard: {
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
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
  modalHeading: {
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
