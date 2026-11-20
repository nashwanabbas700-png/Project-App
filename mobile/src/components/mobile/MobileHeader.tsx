import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Moon, Sun, LogOut, Bell } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  rightAction?: 'logout' | 'notifications' | 'none';
  onNotificationPress?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
  rightAction = 'logout',
  onNotificationPress,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme, radius } = useTheme();
  const { user, logout } = useAuth();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 20 : 12),
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left Side: Logo and Brand / Page Title */}
        <View style={styles.leftRow}>
          {showLogo && (
            <View
              style={[
                styles.logoWrap,
                {
                  borderColor: colors.accent,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: radius.sm,
                },
              ]}
            >
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
          )}

          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {title || 'EduNova SmartSched'}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                City University Academic Portal
              </Text>
            )}
          </View>
        </View>

        {/* Right Side: Theme Toggle & Logout / Notifications */}
        <View style={styles.rightRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleTheme}
            style={[
              styles.iconBtn,
              { backgroundColor: colors.surfaceSecondary, borderRadius: radius.full },
            ]}
          >
            {isDark ? (
              <Sun size={18} color={colors.warning} />
            ) : (
              <Moon size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          {rightAction === 'logout' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={logout}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.dangerBg, borderRadius: radius.full },
              ]}
            >
              <LogOut size={16} color={colors.danger} />
            </TouchableOpacity>
          )}

          {rightAction === 'notifications' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNotificationPress}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surfaceSecondary, borderRadius: radius.full },
              ]}
            >
              <Bell size={18} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoWrap: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 36,
    height: 36,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
