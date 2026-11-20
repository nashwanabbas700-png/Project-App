import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW, SHADOWS } from '../../constants/theme';

export type AdminScreen =
  | 'Dashboard'
  | 'SmartScheduler'
  | 'MasterTimetable'
  | 'FacultyManagement'
  | 'WorkloadAnalytics'
  | 'CourseManagement'
  | 'ClassroomManagement'
  | 'HistoryAudit'
  | 'StudentPortal';

interface SidebarProps {
  activeScreen: AdminScreen;
  onNavigate: (screen: AdminScreen) => void;
  adminName?: string;
  onLogout: () => void;
}

const NAV_ITEMS: { screen: AdminScreen; icon: string; label: string }[] = [
  { screen: 'Dashboard', icon: '⊞', label: 'Dashboard' },
  { screen: 'SmartScheduler', icon: '✦', label: 'Smart Scheduler' },
  { screen: 'MasterTimetable', icon: '▦', label: 'Master Timetable' },
  { screen: 'FacultyManagement', icon: '◎', label: 'Faculty' },
  { screen: 'WorkloadAnalytics', icon: '◈', label: 'Workload' },
  { screen: 'CourseManagement', icon: '◉', label: 'Courses' },
  { screen: 'ClassroomManagement', icon: '◫', label: 'Rooms' },
  { screen: 'HistoryAudit', icon: '◷', label: 'Audit History' },
  { screen: 'StudentPortal', icon: '🎓', label: 'Student View' },
];

export function Sidebar({
  activeScreen,
  onNavigate,
  adminName = 'Admin',
  onLogout,
}: SidebarProps) {
  return (
    <View style={styles.sidebar}>
      {/* Logo area */}
      <View style={styles.logoArea}>
        <View style={styles.logoImgWrap}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImg}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.brandName}>EduNova</Text>
        <Text style={styles.brandSub}>City University Portal</Text>
      </View>

      <View style={styles.divider} />

      {/* Nav items */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <TouchableOpacity
              key={item.screen}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onNavigate(item.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                  {item.icon}
                </Text>
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.divider} />

      {/* Admin profile */}
      <View style={styles.profileArea}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{adminName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {adminName}
          </Text>
          <Text style={styles.profileRole}>Administrator</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutIcon}>⏻</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: COLORS.sidebarBg,
    flexDirection: 'column',
    paddingTop: Platform.OS === 'web' ? 0 : 44,
    ...SHADOW.lg,
    zIndex: 100,
  },
  logoArea: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  logoImgWrap: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
  },
  logoImg: {
    width: 54,
    height: 54,
  },
  brandName: {
    color: COLORS.textOnDark,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSub: {
    color: COLORS.sidebarText,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: SPACING.md,
    marginVertical: 2,
  },
  navList: {
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    marginHorizontal: SPACING.sm,
    marginVertical: 1,
    borderRadius: RADIUS.md,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(46,124,246,0.9)',
  },
  navIconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  navIcon: {
    fontSize: 14,
    color: COLORS.sidebarText,
  },
  navIconActive: {
    color: COLORS.textOnDark,
  },
  navLabel: {
    color: COLORS.sidebarText,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  navLabelActive: {
    color: COLORS.textOnDark,
    fontWeight: '700',
  },
  activeBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    position: 'absolute',
    right: 8,
  },
  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.textOnDark,
    fontWeight: '800',
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: COLORS.textOnDark,
    fontSize: 13,
    fontWeight: '700',
  },
  profileRole: {
    color: COLORS.sidebarText,
    fontSize: 11,
    marginTop: 1,
  },
  logoutBtn: {
    padding: SPACING.xs,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoutIcon: {
    color: COLORS.sidebarText,
    fontSize: 14,
  },
});

export default Sidebar;

