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
  Platform,
} from 'react-native';
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  Sparkles,
  ChevronRight,
  Download,
  AlertCircle,
  Building2,
  Layers,
  Info,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TimetableEntry } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { ClassCard } from '../../components/mobile/ClassCard';
import { StatCard } from '../../components/mobile/StatCard';
import { EmptyState } from '../../components/mobile/EmptyState';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

export const StudentHomeScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [summary, setSummary] = useState({
    totalCourses: 0,
    totalClassesPerWeek: 0,
    totalWeeklyHours: '0.0',
  });
  const [activeRoomModal, setActiveRoomModal] = useState<RoomDetails | null>(null);

  const section = user?.studentSection || 'CS-A';
  const todayDayIndex = new Date().getDay();
  // Default to today if weekday, else Monday
  const currentDayName = (todayDayIndex >= 1 && todayDayIndex <= 5) ? DAYS[todayDayIndex] : 'Monday';

  const loadData = async () => {
    try {
      const res = await api.getStudentTimetable({
        department: user?.department || 'Computer Science',
        section,
        semester: 'Fall 2026',
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
      console.warn('Failed to load student home timetable', e);
    } finally {
      setIsLoading(false);
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

  // Filter today's classes
  const todayClasses = entries.filter((e) => e.day === currentDayName);
  const nextClass = todayClasses.length > 0 ? todayClasses[0] : entries[0];

  const handleOpenRoomSpecs = (roomNumber: string) => {
    const specs = ROOM_SPECS[roomNumber] || {
      roomNumber,
      name: `Classroom ${roomNumber}`,
      building: 'Main Academic Campus',
      floor: 'Refer to campus directory',
      capacity: 45,
      type: 'Lecture Room',
      facilities: ['Smart Board', 'AV Projector', 'Climate Control'],
      directions: 'Check the digital display at the central building lobby.',
    };
    setActiveRoomModal(specs);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader
        title="EduNova Student"
        subtitle={`Section ${section} • ${user?.department || 'Computer Science'}`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
      >
        {/* Welcome Hero Banner */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary, borderRadius: radius.lg }, shadow.md]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>Welcome back,</Text>
              <Text style={styles.heroName}>{user?.name || 'Student'}</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{section}</Text>
            </View>
          </View>
          <Text style={styles.heroSub}>
            You have {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} scheduled for today ({currentDayName}).
          </Text>
        </View>

        {/* Next Class Hero Card */}
        {nextClass && (
          <View style={[styles.nextClassCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }, shadow.sm]}>
            <View style={styles.nextClassHeader}>
              <View style={[styles.pulseDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.nextClassTag, { color: colors.accent }]}>
                {todayClasses.length > 0 ? "TODAY'S UPCOMING CLASS" : "UPCOMING LECTURE"}
              </Text>
            </View>
            <Text style={[styles.nextClassTitle, { color: colors.text }]}>{nextClass.courseName}</Text>
            <View style={styles.nextClassMetaRow}>
              <View style={styles.metaItem}>
                <Clock size={13} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {nextClass.day} • {nextClass.startTime} - {nextClass.endTime}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleOpenRoomSpecs(nextClass.roomNumber)}
                style={[styles.roomPill, { backgroundColor: `${colors.accent}14` }]}
              >
                <MapPin size={12} color={colors.accent} />
                <Text style={[styles.roomPillText, { color: colors.accent }]}>{nextClass.roomNumber}</Text>
                <ChevronRight size={12} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Academic Stats Grid */}
        <View style={styles.statsRow}>
          <StatCard
            label="Enrolled"
            value={summary.totalCourses}
            subtitle="Courses"
            icon={<BookOpen size={16} color={colors.accent} />}
          />
          <StatCard
            label="Weekly Load"
            value={`${summary.totalWeeklyHours}h`}
            subtitle={`${summary.totalClassesPerWeek} sessions`}
            icon={<Clock size={16} color={colors.teal} />}
            accentColor={colors.teal}
          />
        </View>

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule ({currentDayName})</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Timetable')}>
            <Text style={[styles.viewAllText, { color: colors.accent }]}>Full Week →</Text>
          </TouchableOpacity>
        </View>

        {todayClasses.length === 0 ? (
          <EmptyState
            title="No Classes Today"
            description="Enjoy your study break or review past coursework. Check the Timetable tab for the rest of the week."
          />
        ) : (
          todayClasses.map((item, index) => (
            <ClassCard
              key={item.id || index}
              entry={item}
              onPress={() => handleOpenRoomSpecs(item.roomNumber)}
              isActiveNow={index === 0}
            />
          ))
        )}

        {/* Quick Action Tools */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Academic Tools</Text>
        </View>

        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}
            onPress={() => handleOpenRoomSpecs(nextClass?.roomNumber || 'LAB-CS1')}
          >
            <View style={[styles.toolIconWrap, { backgroundColor: colors.infoBg }]}>
              <Building2 size={20} color={colors.accent} />
            </View>
            <Text style={[styles.toolTitle, { color: colors.text }]}>Campus Room Finder</Text>
            <Text style={[styles.toolDesc, { color: colors.textMuted }]}>Indoor GPS & floor navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}
            onPress={() => {
              const url = api.getExportICSUrl({ section, semester: 'Fall 2026' });
              Linking.openURL(url);
            }}
          >
            <View style={[styles.toolIconWrap, { backgroundColor: colors.successBg }]}>
              <Download size={20} color={colors.success} />
            </View>
            <Text style={[styles.toolTitle, { color: colors.text }]}>Sync to Calendar</Text>
            <Text style={[styles.toolDesc, { color: colors.textMuted }]}>Export .ics for Outlook/Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Campus Room Geolocation Modal */}
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
                  <Text style={[styles.modalInfoText, { color: colors.text }]}>{activeRoomModal.floor} (Capacity: {activeRoomModal.capacity} students)</Text>
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
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default StudentHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    padding: 20,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  heroGreeting: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionBadge: {
    backgroundColor: 'rgba(46, 124, 246, 0.4)',
    borderWidth: 1,
    borderColor: '#2E7CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  heroSub: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },
  nextClassCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  nextClassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextClassTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nextClassTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  nextClassMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  toolCard: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
  },
  toolIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
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
