import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import {
  User,
  GraduationCap,
  Mail,
  Shield,
  Moon,
  Sun,
  LogOut,
  MapPin,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { MobileHeader } from '../../components/mobile/MobileHeader';

export const StudentProfileScreen: React.FC = () => {
  const { colors, isDark, toggleTheme, radius, shadow } = useTheme();
  const { user, logout } = useAuth();

  const section = user?.studentSection || 'CS-A';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Student Profile" subtitle="Account & Preferences" rightAction="none" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
            shadow.sm,
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarText}>
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Alex Rivera'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'student@edunova.edu'}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: `${colors.accent}14` }]}>
              <GraduationCap size={13} color={colors.accent} />
              <Text style={[styles.roleBadgeText, { color: colors.accent }]}>Section {section}</Text>
            </View>

            <View style={[styles.deptBadge, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.deptBadgeText, { color: colors.textSecondary }]}>
                {user?.department || 'Computer Science'}
              </Text>
            </View>
          </View>
        </View>

        {/* Academic Details Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACADEMIC ENROLLMENT</Text>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Program</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>BS Computer Science</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Current Semester</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Fall 2026 (Semester 5)</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Campus Wing</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Turing Technology Complex</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APP SETTINGS</Text>

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

        {/* Institutional Support */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CAMPUS & SUPPORT</Text>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.supportRow}>
              <MapPin size={16} color={colors.accent} />
              <View style={styles.supportInfo}>
                <Text style={[styles.supportTitle, { color: colors.text }]}>City University Main Campus</Text>
                <Text style={[styles.supportSub, { color: colors.textMuted }]}>
                  Central Academic Quad, 100 University Ave
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.supportRow}>
              <Mail size={16} color={colors.teal} />
              <View style={styles.supportInfo}>
                <Text style={[styles.supportTitle, { color: colors.text }]}>Registrar Help Desk</Text>
                <Text style={[styles.supportSub, { color: colors.textMuted }]}>
                  support@edunova.edu • Mon–Fri 08:30–17:00
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={logout}
          style={[styles.logoutBtn, { backgroundColor: colors.dangerBg, borderRadius: radius.md }]}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out from EduNova</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          EduNova SmartSched Mobile v1.0.0 (Build 2026)
        </Text>
      </ScrollView>
    </View>
  );
};

export default StudentProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deptBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deptBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionWrap: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  groupCard: {
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
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
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  supportSub: {
    fontSize: 11,
    marginTop: 2,
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
});
