import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  Download,
  Share2,
  ChevronRight,
  User,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles,
  Info,
  LogOut,
  Sliders,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TimetableEntry } from '../../types';
import { Badge } from '../../components/common/Badge';

const SECTIONS = ['CS-A', 'CS-B', 'EE-A', 'BBA-A'];
const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Business Administration'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface RoomDetails {
  roomNumber: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  type: string;
  facilities: string[];
  directions: string;
}

const ROOM_SPECS: { [k: string]: RoomDetails } = {
  'LAB-CS1': {
    roomNumber: 'LAB-CS1',
    name: 'Advanced Computing Lab 1',
    building: 'Turing Technology Complex (Wing B)',
    floor: '2nd Floor, Room 204',
    capacity: 40,
    type: 'Computer Lab',
    facilities: ['Dual 4K Projectors', '35x GPU Workstations', 'Gigabit Fiber', 'Smart Podium'],
    directions: 'Take Central Elevator B to the 2nd floor. Turn left past the CS department lounge.',
  },
  'LAB-CS2': {
    roomNumber: 'LAB-CS2',
    name: 'Software Engineering Lab 2',
    building: 'Turing Technology Complex (Wing B)',
    floor: '2nd Floor, Room 206',
    capacity: 35,
    type: 'Computer Lab',
    facilities: ['Interactive Smart Board', '30x Linux Workstations', 'Cloud Sandbox Server'],
    directions: 'Located next to LAB-CS1 in the West corridor.',
  },
  'CR-101': {
    roomNumber: 'CR-101',
    name: 'Main Lecture Hall A',
    building: 'Central Academic Quad (Wing A)',
    floor: 'Ground Floor, Room G-12',
    capacity: 60,
    type: 'Lecture Room',
    facilities: ['Tiered Amphitheater Seating', 'Surround Sound Audio', 'Document Camera'],
    directions: 'Directly facing the Central Courtyard fountain entrance.',
  },
  'CR-102': {
    roomNumber: 'CR-102',
    name: 'Lecture Hall B',
    building: 'Central Academic Quad (Wing A)',
    floor: '1st Floor, Room 102',
    capacity: 50,
    type: 'Lecture Room',
    facilities: ['Wireless Presentation Gateway', 'Dual Display Screens', 'Acoustic Panels'],
    directions: '1st Floor right staircase from the main lobby.',
  },
  'SEM-HALL': {
    roomNumber: 'SEM-HALL',
    name: 'Executive Seminar Auditorium',
    building: 'Chancellor Memorial Building',
    floor: '3rd Floor Auditorium Suite',
    capacity: 120,
    type: 'Seminar Hall',
    facilities: ['Stage Lighting', 'Broadcast Streaming Pod', 'Wireless Lapel Microphones'],
    directions: 'North wing grand elevators to 3rd floor.',
  },
};

export const StudentPortalScreen: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  const [selectedDept, setSelectedDept] = useState<string>('Computer Science');
  const [selectedSection, setSelectedSection] = useState<string>(user?.studentSection || 'CS-A');
  const [selectedSemester, setSelectedSemester] = useState<string>('Fall 2026');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [summary, setSummary] = useState({ totalCourses: 0, totalClassesPerWeek: 0, totalWeeklyHours: '0.0' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Room Locator Modal
  const [activeRoomModal, setActiveRoomModal] = useState<RoomDetails | null>(null);

  const fetchStudentSchedule = async () => {
    setIsLoading(true);
    try {
      const res = await api.getStudentTimetable({
        department: selectedDept,
        semester: selectedSemester,
        section: selectedSection,
      });
      if (res.success) {
        setEntries(res.entries);
        setSummary({
          totalCourses: res.totalCourses,
          totalClassesPerWeek: res.totalClassesPerWeek,
          totalWeeklyHours: res.totalWeeklyHours,
        });
      }
    } catch (e) {
      console.warn('Could not load student timetable', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentSchedule();
  }, [selectedDept, selectedSection, selectedSemester]);

  const handleDownloadICS = () => {
    const url = api.getExportICSUrl({
      department: selectedDept,
      section: selectedSection,
      semester: selectedSemester,
    });
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const handleDownloadCSV = () => {
    const url = api.getExportCSVUrl({
      department: selectedDept,
      section: selectedSection,
      semester: selectedSemester,
    });
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const openRoomLocator = (roomNumber?: string) => {
    const key = roomNumber || 'CR-101';
    const spec = ROOM_SPECS[key] || {
      roomNumber: key,
      name: `Classroom ${key}`,
      building: 'Main Academic Complex',
      floor: 'Standard Academic Wing',
      capacity: 45,
      type: 'General Classroom',
      facilities: ['Standard Projector', 'Whiteboard', 'Air Conditioning'],
      directions: 'Consult the department floor directory in the main lobby.',
    };
    setActiveRoomModal(spec);
  };

  const dayEntries = entries.filter((e) => e.day === selectedDay);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchStudentSchedule} />}
    >
      {/* ── Student Hero Banner ── */}
      <View style={styles.heroBanner}>
        <View style={styles.heroLeft}>
          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText}>● Student Portal · {selectedSemester}</Text>
          </View>
          <Text style={styles.heroGreeting}>Welcome back,</Text>
          <Text style={styles.heroName}>{user?.name || 'Enrolled Student'}</Text>
          <Text style={styles.heroProgram}>Bachelor of Science · Section {selectedSection}</Text>
        </View>

        <View style={styles.heroRight}>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
            <LogOut size={16} color={COLORS.textOnDark} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── KPI Summary Cards ── */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: COLORS.infoLight }]}>
          <BookOpen size={18} color={COLORS.info} />
          <Text style={[styles.kpiVal, { color: COLORS.info }]}>{summary.totalCourses}</Text>
          <Text style={styles.kpiLabel}>Enrolled Courses</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: COLORS.successLight }]}>
          <Calendar size={18} color={COLORS.success} />
          <Text style={[styles.kpiVal, { color: COLORS.success }]}>{summary.totalClassesPerWeek}</Text>
          <Text style={styles.kpiLabel}>Weekly Classes</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: COLORS.purpleLight }]}>
          <Clock size={18} color={COLORS.purple} />
          <Text style={[styles.kpiVal, { color: COLORS.purple }]}>{summary.totalWeeklyHours}h</Text>
          <Text style={styles.kpiLabel}>Contact Hours</Text>
        </View>
      </View>

      {/* ── Quick Calendar Sync & Export Strip ── */}
      <View style={styles.exportCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.exportTitle}>Sync & Export Schedule</Text>
          <Text style={styles.exportSub}>Add to Google / Outlook Calendar or download as CSV table</Text>
        </View>

        <View style={styles.exportBtnRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={handleDownloadICS} activeOpacity={0.8}>
            <Calendar size={14} color={COLORS.secondary} />
            <Text style={styles.exportBtnText}>Sync (.ics)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportBtn} onPress={handleDownloadCSV} activeOpacity={0.8}>
            <Download size={14} color={COLORS.secondary} />
            <Text style={styles.exportBtnText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Section & Department Selector Strip ── */}
      <View style={styles.sectionControls}>
        <Text style={styles.sectionTitle}>Select Your Section</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {SECTIONS.map((sec) => {
            const isSelected = selectedSection === sec;
            return (
              <TouchableOpacity
                key={sec}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setSelectedSection(sec)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  Section {sec}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Day of Week Selector ── */}
      <View style={styles.daySelectorRow}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayTab, isSelected && styles.dayTabActive]}
              onPress={() => setSelectedDay(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Classes List for Selected Day ── */}
      <View style={styles.scheduleList}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {selectedDay} Schedule ({selectedSection})
          </Text>
          <Badge label={`${dayEntries.length} Classes`} variant="primary" size="sm" />
        </View>

        {dayEntries.length === 0 ? (
          <View style={styles.emptyCard}>
            <ShieldCheck size={28} color={COLORS.success} />
            <Text style={styles.emptyTitle}>No Lectures on {selectedDay}</Text>
            <Text style={styles.emptySub}>You have no scheduled classes for Section {selectedSection} on this day.</Text>
          </View>
        ) : (
          dayEntries.map((item, idx) => (
            <View key={item.id || idx} style={styles.classCard}>
              <View style={styles.cardTimeCol}>
                <Clock size={14} color={COLORS.secondary} />
                <Text style={styles.startTimeText}>{item.startTime}</Text>
                <Text style={styles.endTimeText}>{item.endTime}</Text>
              </View>

              <View style={styles.cardContentCol}>
                <View style={styles.codeRow}>
                  <Text style={styles.courseCode}>{item.courseCode}</Text>
                  <Badge label={item.section} variant="secondary" size="sm" />
                  {item.roomType && <Badge label={item.roomType} variant="neutral" size="sm" />}
                </View>

                <Text style={styles.courseName}>{item.courseName}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <User size={13} color={COLORS.textMuted} />
                    <Text style={styles.instructorText}>{item.facultyName}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.roomTag}
                    onPress={() => openRoomLocator(item.roomNumber)}
                    activeOpacity={0.7}
                  >
                    <MapPin size={13} color={COLORS.secondary} />
                    <Text style={styles.roomTagText}>{item.roomNumber || 'Room TBA'}</Text>
                    <ChevronRight size={12} color={COLORS.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* ── Room Locator & Directions Modal ── */}
      <Modal
        visible={!!activeRoomModal}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveRoomModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Building2 size={20} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalRoomNum}>{activeRoomModal?.roomNumber}</Text>
                <Text style={styles.modalRoomName}>{activeRoomModal?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveRoomModal(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.specGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Building & Wing</Text>
                <Text style={styles.specVal}>{activeRoomModal?.building}</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Floor & Suite</Text>
                <Text style={styles.specVal}>{activeRoomModal?.floor}</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Capacity</Text>
                <Text style={styles.specVal}>{activeRoomModal?.capacity} Seats</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Facility Type</Text>
                <Text style={styles.specVal}>{activeRoomModal?.type}</Text>
              </View>
            </View>

            <View style={styles.directionsBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <MapPin size={14} color={COLORS.secondary} />
                <Text style={styles.directionsTitle}>Indoor Navigation Directions:</Text>
              </View>
              <Text style={styles.directionsText}>{activeRoomModal?.directions}</Text>
            </View>

            <View style={styles.facilitiesWrap}>
              <Text style={styles.facilitiesTitle}>Installed Room Equipment:</Text>
              <View style={styles.facilitiesBadges}>
                {activeRoomModal?.facilities.map((fac, i) => (
                  <Badge key={i} label={fac} variant="neutral" size="sm" />
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default StudentPortalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  heroBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    ...SHADOW.lg,
  },
  heroLeft: {
    flex: 1,
  },
  studentBadge: {
    backgroundColor: 'rgba(46,124,246,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: 6,
  },
  studentBadgeText: {
    color: COLORS.secondaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  heroGreeting: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  heroName: {
    color: COLORS.textOnDark,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroProgram: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  heroRight: {
    marginLeft: SPACING.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  logoutText: {
    color: COLORS.textOnDark,
    fontSize: 11,
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  kpiCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  exportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  exportTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  exportSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  exportBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  sectionControls: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  pillsScroll: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  pill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.textOnDark,
    fontWeight: '700',
  },
  daySelectorRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  dayTab: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dayTabTextActive: {
    color: COLORS.textOnDark,
    fontWeight: '700',
  },
  scheduleList: {
    gap: SPACING.sm,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  classCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  cardTimeCol: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
    paddingRight: SPACING.sm,
    marginRight: SPACING.sm,
  },
  startTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  endTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  cardContentCol: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  courseCode: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instructorText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roomTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,30,69,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOW.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRoomNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalRoomName: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeBtnText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  specItem: {
    width: '47%',
  },
  specLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
  },
  directionsBox: {
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: SPACING.md,
  },
  directionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  directionsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  facilitiesWrap: {
    marginTop: 4,
  },
  facilitiesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  facilitiesBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});
