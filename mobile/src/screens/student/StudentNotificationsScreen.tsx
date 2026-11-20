import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Bell, CheckCheck, Calendar, MapPin, AlertTriangle, Info, Clock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { EmptyState } from '../../components/mobile/EmptyState';

const MOCK_STUDENT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-stu-1',
    title: 'Semester Timetable Published',
    message: 'The official Fall 2026 academic timetable has been finalized and published by the registrar.',
    type: 'TIMETABLE_PUBLISHED',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-stu-2',
    title: 'Room Assignment Notice: CS-101',
    message: 'CS-101 Programming Lab is allocated to Turing Complex LAB-CS1 equipped with 35x workstations.',
    type: 'ROOM_CHANGED',
    relatedCourseCode: 'CS-101',
    relatedRoom: 'LAB-CS1',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'notif-stu-3',
    title: 'Midterm Evaluation Schedule',
    message: 'Academic department schedules are aligned to avoid overlapping exam slots.',
    type: 'GENERAL_ANNOUNCEMENT',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const StudentNotificationsScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_STUDENT_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.notifications && res.notifications.length > 0) {
        setNotifications([...res.notifications, ...MOCK_STUDENT_NOTIFICATIONS]);
      }
    } catch {
      // Use seeded notifications
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'TIMETABLE_PUBLISHED':
        return <Calendar size={18} color={colors.accent} />;
      case 'ROOM_CHANGED':
        return <MapPin size={18} color={colors.teal} />;
      case 'CLASS_CANCELLED':
        return <AlertTriangle size={18} color={colors.danger} />;
      default:
        return <Bell size={18} color={colors.accent} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Academic Alerts" subtitle={`${unreadCount} unread notices`} />

      <View style={styles.contentWrap}>
        {unreadCount > 0 && (
          <View style={styles.topActionsRow}>
            <Text style={[styles.unreadBadgeText, { color: colors.textSecondary }]}>
              {unreadCount} unread alerts
            </Text>
            <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn}>
              <CheckCheck size={14} color={colors.accent} />
              <Text style={[styles.markReadText, { color: colors.accent }]}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          contentContainerStyle={styles.listContainer}
        >
          {notifications.length === 0 ? (
            <EmptyState
              title="No Notifications"
              description="You have no pending academic or timetable notifications at this time."
              icon={<Bell size={32} color={colors.textMuted} />}
            />
          ) : (
            notifications.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: item.isRead ? colors.card : colors.surface,
                    borderColor: item.isRead ? colors.border : colors.accent,
                    borderWidth: item.isRead ? 1 : 1.5,
                    borderRadius: radius.md,
                  },
                  shadow.sm,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm },
                      ]}
                    >
                      {getIconForType(item.type)}
                    </View>
                    <View style={styles.titleWrap}>
                      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.dateText, { color: colors.textMuted }]}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>

                  {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
                </View>

                <Text style={[styles.message, { color: colors.textSecondary }]}>{item.message}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default StudentNotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    padding: 16,
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 30,
    gap: 10,
  },
  notifCard: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    marginTop: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 46,
  },
});
