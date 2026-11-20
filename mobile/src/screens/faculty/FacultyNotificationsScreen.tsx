import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, CheckCheck, Calendar, MapPin, AlertCircle, Info, CheckCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme'
import { useTimetable } from '../../context/TimetableContext';
import { NotificationItem } from '../../types';

export const FacultyNotificationsScreen: React.FC = () => {
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } =
    useTimetable();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const displayed = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ROOM_CHANGED':
        return <MapPin size={18} color="#D97706" />;
      case 'CLASS_CANCELLED':
        return <AlertCircle size={18} color={COLORS.danger} />;
      case 'TIMETABLE_PUBLISHED':
        return <CheckCircle2 size={18} color={COLORS.success} />;
      case 'TIMETABLE_UPDATED':
      case 'CLASS_RESCHEDULED':
        return <Calendar size={18} color={COLORS.secondary} />;
      default:
        return <Info size={18} color={COLORS.primary} />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Just now';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <View style={styles.filterPills}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'unread' && styles.filterPillActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
              Unread ({unreadNotificationCount})
            </Text>
          </TouchableOpacity>
        </View>

        {unreadNotificationCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllNotificationsRead}
            activeOpacity={0.8}
          >
            <CheckCheck size={14} color={COLORS.secondary} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {displayed.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'unread'
              ? 'You have caught up with all institutional updates.'
              : 'You will receive automatic alerts whenever the administrator updates or reschedules your timetable.'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {displayed.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => !item.isRead && markNotificationRead(item.id)}
              style={[styles.card, !item.isRead && styles.cardUnread]}
            >
              <View style={[styles.iconWrap, !item.isRead ? styles.iconWrapUnread : {}]}>
                {getNotificationIcon(item.type)}
              </View>

              <View style={styles.textWrap}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.title, !item.isRead && styles.titleUnread]}>
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.message}>{item.message}</Text>

                <View style={styles.footerRow}>
                  <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
                  {item.relatedCourseCode && (
                    <View style={styles.courseTag}>
                      <Text style={styles.courseTagText}>{item.relatedCourseCode}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  filterPills: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  filterPillActive: {
    backgroundColor: COLORS.surface,
    ...SHADOW.subtle,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  list: {
    gap: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.subtle,
  },
  cardUnread: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFF',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: {
    backgroundColor: '#EFF6FF',
  },
  textWrap: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1,
  },
  titleUnread: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary,
    marginLeft: SPACING.xs,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  courseTag: {
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  courseTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    padding: SPACING.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 280,
  },
});



export default FacultyNotificationsScreen;

