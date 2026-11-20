import React, { useState } from 'react';
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
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  Edit3,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MobileHeader } from '../../components/mobile/MobileHeader';

export const FacultyProfileScreen: React.FC = () => {
  const { colors, isDark, toggleTheme, radius, shadow } = useTheme();
  const { user, logout, refreshProfile } = useAuth();

  const [phone, setPhone] = useState<string>(user?.facultyDetails?.phone || '+1 (555) 234-8901');
  const [office, setOffice] = useState<string>(user?.facultyDetails?.office || 'Turing Hall, Room 304');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const maxHours = user?.facultyDetails?.maxWeeklyHours || 16;

  const handleSaveContact = async () => {
    if (!user?.facultyId) return;
    setIsSaving(true);
    try {
      await api.updateFaculty(user.facultyId, { phone, office });
      await refreshProfile();
      setEditModalVisible(false);
      Alert.alert('Profile Saved', 'Your office contact information has been updated.');
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not save profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Faculty Profile" subtitle="Academic Credentials & Preferences" rightAction="none" />

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
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                : 'SJ'}
            </Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Dr. Sarah Jenkins'}</Text>
          <Text style={[styles.dept, { color: colors.textSecondary }]}>
            {user?.department || 'Computer Science'} • Associate Professor
          </Text>

          <View style={styles.badgeRow}>
            <View style={[styles.idBadge, { backgroundColor: `${colors.accent}14` }]}>
              <Text style={[styles.idBadgeText, { color: colors.accent }]}>
                ID: {user?.facultyId || 'CS-FAC-01'}
              </Text>
            </View>

            <View style={[styles.verifiedBadge, { backgroundColor: colors.successBg }]}>
              <ShieldCheck size={12} color={colors.success} />
              <Text style={[styles.verifiedText, { color: colors.success }]}>Tenured Faculty</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>OFFICE & CONTACT</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editBtn}>
              <Edit3 size={13} color={colors.accent} />
              <Text style={[styles.editText, { color: colors.accent }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Mail size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Institutional Email</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || 'faculty@edunova.edu'}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Phone size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Direct Extension</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>{phone}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <MapPin size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Campus Office</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>{office}</Text>
            </View>
          </View>
        </View>

        {/* Teaching Guidelines */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TEACHING ALLOCATION</Text>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Clock size={16} color={colors.accent} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Max Weekly Ceiling</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>{maxHours}.0 Hours / week</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <CheckCircle size={16} color={colors.success} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Research Reserve</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>Fridays (Protected)</Text>
            </View>
          </View>
        </View>

        {/* Theme & Display */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APP DISPLAY</Text>

          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                {isDark ? <Moon size={18} color={colors.warning} /> : <Sun size={18} color={colors.accent} />}
                <View>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                    {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
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

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={logout}
          style={[styles.logoutBtn, { backgroundColor: colors.dangerBg, borderRadius: radius.md }]}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          EduNova SmartSched Faculty Mobile v1.0.0
        </Text>
      </ScrollView>

      {/* Edit Contact Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderRadius: radius.lg }, shadow.lg]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Faculty Office Info</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Phone Extension</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Office Location</Text>
              <TextInput
                value={office}
                onChangeText={setOffice}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveContact} disabled={isSaving} style={[styles.submitBtn, { backgroundColor: colors.accent }]}>
                <Text style={styles.submitBtnText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FacultyProfileScreen;

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
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  dept: {
    fontSize: 13,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  idBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionWrap: {
    marginBottom: 18,
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
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
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
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
