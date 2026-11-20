import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, LogOut, ArrowLeftRight, Calendar } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme'
import { useAuth } from '../../context/AuthContext';
import { useTimetable } from '../../context/TimetableContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNotificationsPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onNotificationsPress,
}) => {
  const { user, role, switchRoleForPresentation, logout } = useAuth();
  const { unreadNotificationCount } = useTimetable();

  const handleRoleToggle = () => {
    const nextRole = role === 'admin' ? 'faculty' : 'admin';
    switchRoleForPresentation(nextRole);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.headerLogoImage}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.brandText}>EduNova</Text>
            <Text style={styles.subBrand}>Faculty Timetable System</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {/* Quick presentation role switch pill */}
          <TouchableOpacity
            style={[
              styles.roleSwitchPill,
              role === 'admin' ? styles.adminPill : styles.facultyPill,
            ]}
            onPress={handleRoleToggle}
            activeOpacity={0.8}
          >
            <ArrowLeftRight size={12} color={role === 'admin' ? COLORS.primary : COLORS.secondary} />
            <Text
              style={[
                styles.roleText,
                { color: role === 'admin' ? COLORS.primary : COLORS.secondary },
              ]}
            >
              {role === 'admin' ? 'Admin Mode' : 'Faculty Mode'}
            </Text>
          </TouchableOpacity>

          {/* Notification bell */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationsPress}
            activeOpacity={0.7}
          >
            <Bell size={20} color={COLORS.text} />
            {unreadNotificationCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifText}>
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Logout button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={logout}
            activeOpacity={0.7}
          >
            <LogOut size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {(title || subtitle) && (
        <View style={styles.titleRow}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOW.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerLogoImage: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  subBrand: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  roleSwitchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  adminPill: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  facultyPill: {
    backgroundColor: COLORS.secondarySubtle,
    borderColor: '#BFDBFE',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceBlue,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifText: {
    color: COLORS.textOnDark,
    fontSize: 9,
    fontWeight: '700',
  },
  titleRow: {
    marginTop: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});


