import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import {
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  MapPin,
  Building2,
  Layers,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TimetableEntry } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { ClassCard } from '../../components/mobile/ClassCard';
import { EmptyState } from '../../components/mobile/EmptyState';

const SECTIONS = ['CS-A', 'CS-B', 'EE-A', 'BBA-A'];
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
    directions: 'Take West elevator to 2nd Floor. Follow the blue overhead directional signs down Hallway B.',
  },
  'LAB-CS2': {
    roomNumber: 'LAB-CS2',
    name: 'Software Engineering Studio',
    building: 'Turing Technology Complex (Wing B)',
    floor: '3rd Floor, Room 310',
    capacity: 35,
    type: 'Computer Lab',
    facilities: ['Agile Pod Seating', 'Interactive Whiteboards', 'Linux Testbed'],
    directions: 'Take West elevator to 3rd Floor. Lab 2 is the glass-fronted room opposite the faculty lounge.',
  },
  'CR-101': {
    roomNumber: 'CR-101',
    name: 'Auditorium Hall A',
    building: 'Central Academic Quad (Wing A)',
    floor: 'Ground Level, Room 101',
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

export const StudentTimetableScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [selectedSection, setSelectedSection] = useState<string>(user?.studentSection || 'CS-A');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [summary, setSummary] = useState({
    totalCourses: 0,
    totalClassesPerWeek: 0,
    totalWeeklyHours: '0.0',
  });
  const [activeRoomModal, setActiveRoomModal] = useState<RoomDetails | null>(null);

  const fetchTimetable = async () => {
    try {
      const res = await api.getStudentTimetable({
        department: user?.department || 'Computer Science',
        semester: 'Fall 2026',
        section: selectedSection,
      });
      if (res.success) {
        setEntries(res.entries || []);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedSection]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimetable();
  };

  const dayEntries = entries.filter((e) => e.day === selectedDay);

  const handleOpenRoomModal = (roomNumber: string) => {
    const specs = ROOM_SPECS[roomNumber] || {
      roomNumber,
      name: `Classroom ${roomNumber}`,
      building: 'Main Academic Quad',
      floor: 'Refer to campus directory',
      capacity: 45,
      type: 'Lecture Room',
      facilities: ['Smart Board', 'AV Projector', 'Climate Control'],
      directions: 'Check the digital display at the central building lobby.',
    };
    setActiveRoomModal(specs);
  };

  const handleExportICS = () => {
    const url = api.getExportICSUrl({
      section: selectedSection,
      semester: 'Fall 2026',
    });
    Linking.openURL(url);
  };

  const handleExportCSV = () => {
    const url = api.getExportCSVUrl({
      section: selectedSection,
      semester: 'Fall 2026',
    });
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Academic Timetable" subtitle={`Fall 2026 • Section ${selectedSection}`} />

      {/* Section Selector Strip */}
      <View style={[styles.filterStrip, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.stripLabel, { color: colors.textSecondary }]}>Section:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroll}>
          {SECTIONS.map((sec) => {
            const active = selectedSection === sec;
            return (
              <TouchableOpacity
                key={sec}
                activeOpacity={0.7}
                onPress={() => setSelectedSection(sec)}
                style={[
                  styles.sectionPill,
                  {
                    backgroundColor: active ? colors.accent : colors.surfaceSecondary,
                    borderColor: active ? colors.accent : colors.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text style={[styles.sectionPillText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                  {sec}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Day Tabs Switcher */}
      <View style={[styles.dayTabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {DAYS.map((day) => {
          const active = selectedDay === day;
          return (
            <TouchableOpacity
              key={day}
              activeOpacity={0.7}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayTabItem,
                active && { borderBottomColor: colors.accent, borderBottomWidth: 3 },
              ]}
            >
              <Text style={[styles.dayTabShort, { color: active ? colors.accent : colors.textMuted }]}>
                {day.substring(0, 3)}
              </Text>
              <Text style={[styles.dayTabFull, { color: active ? colors.text : colors.textMuted }]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content List */}
      <ScrollView
        contentContainerStyle={styles.scrollList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Strip */}
        <View style={[styles.kpiBox, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md }]}>
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiVal, { color: colors.text }]}>{dayEntries.length}</Text>
            <Text style={[styles.kpiDesc, { color: colors.textSecondary }]}>Classes Today</Text>
          </View>
          <View style={[styles.kpiDivider, { backgroundColor: colors.border }]} />
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiVal, { color: colors.text }]}>{summary.totalCourses}</Text>
            <Text style={[styles.kpiDesc, { color: colors.textSecondary }]}>Total Courses</Text>
          </View>
          <View style={[styles.kpiDivider, { backgroundColor: colors.border }]} />
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiVal, { color: colors.accent }]}>{summary.totalWeeklyHours}h</Text>
            <Text style={[styles.kpiDesc, { color: colors.textSecondary }]}>Weekly Contact</Text>
          </View>
        </View>

        {/* Classes List for Selected Day */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderTitle, { color: colors.text }]}>{selectedDay}'s Classes</Text>
          <Text style={[styles.listCountBadge, { color: colors.textSecondary }]}>{dayEntries.length} sessions</Text>
        </View>

        {dayEntries.length === 0 ? (
          <EmptyState
            title={`No Classes on ${selectedDay}`}
            description={`Section ${selectedSection} has no scheduled lectures or lab sessions on ${selectedDay}s.`}
          />
        ) : (
          dayEntries.map((item, idx) => (
            <ClassCard
              key={item.id || idx}
              entry={item}
              onPress={() => handleOpenRoomModal(item.roomNumber)}
              showFaculty={true}
              showSection={false}
            />
          ))
        )}

        {/* Export Action Bar */}
        <View style={styles.exportSection}>
          <Text style={[styles.exportTitle, { color: colors.text }]}>Export & Calendar Sync</Text>
          <View style={styles.exportBtnRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleExportICS}
              style={[styles.exportBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
            >
              <Download size={16} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Sync to Calendar (.ics)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleExportCSV}
              style={[
                styles.exportBtnOutline,
                { borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius.md },
              ]}
            >
              <FileSpreadsheet size={16} color={colors.text} />
              <Text style={[styles.exportBtnOutlineText, { color: colors.text }]}>Export CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Room Geolocation Modal */}
      {activeRoomModal && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setActiveRoomModal(null)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: radius.lg }, shadow.lg]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={[styles.modalIconWrap, { backgroundColor: colors.infoBg }]}>
                    <MapPin size={22} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={[styles.modalRoomNumber, { color: colors.text }]}>{activeRoomModal.roomNumber}</Text>
                    <Text style={[styles.modalRoomName, { color: colors.textSecondary }]}>{activeRoomModal.name}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setActiveRoomModal(null)} style={styles.closeBtn}>
                  <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalInfoRow}>
                  <Building2 size={16} color={colors.textSecondary} />
                  <Text style={[styles.modalInfoText, { color: colors.text }]}>{activeRoomModal.building}</Text>
                </View>

                <View style={styles.modalInfoRow}>
                  <Layers size={16} color={colors.textSecondary} />
                  <Text style={[styles.modalInfoText, { color: colors.text }]}>
                    {activeRoomModal.floor} (Capacity: {activeRoomModal.capacity} students)
                  </Text>
                </View>

                <View style={[styles.directionsBox, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm }]}>
                  <Text style={[styles.directionsHeading, { color: colors.accent }]}>Indoor Walking Directions:</Text>
                  <Text style={[styles.directionsText, { color: colors.textSecondary }]}>{activeRoomModal.directions}</Text>
                </View>

                <Text style={[styles.facilitiesHeading, { color: colors.text }]}>Installed Equipment & Tech:</Text>
                <View style={styles.facilitiesWrap}>
                  {activeRoomModal.facilities.map((fac, idx) => (
                    <View key={idx} style={[styles.facilityPill, { backgroundColor: colors.surfaceSecondary }]}>
                      <CheckCircle size={12} color={colors.success} />
                      <Text style={[styles.facilityText, { color: colors.textSecondary }]}>{fac}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setActiveRoomModal(null)}
                style={[styles.modalDoneBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
              >
                <Text style={styles.modalDoneText}>Close Navigator</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default StudentTimetableScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  stripLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
    textTransform: 'uppercase',
  },
  sectionScroll: {
    gap: 8,
  },
  sectionPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  sectionPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  dayTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  dayTabShort: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayTabFull: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 16,
  },
  kpiItem: {
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  kpiDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  kpiDivider: {
    width: 1,
    height: 24,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listCountBadge: {
    fontSize: 12,
    fontWeight: '500',
  },
  exportSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.25)',
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  exportBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  exportBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 6,
  },
  exportBtnOutlineText: {
    fontWeight: '700',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRoomNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalRoomName: {
    fontSize: 13,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    gap: 10,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInfoText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  directionsBox: {
    padding: 12,
    marginTop: 6,
  },
  directionsHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  directionsText: {
    fontSize: 12,
    lineHeight: 17,
  },
  facilitiesHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  facilitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  facilityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalDoneBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
