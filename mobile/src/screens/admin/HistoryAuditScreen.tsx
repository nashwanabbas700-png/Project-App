import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { History, User, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme'
import { api } from '../../services/api';
import { TimetableHistoryRecord } from '../../types';
import { Badge } from '../../components/common/Badge';

export const HistoryAuditScreen: React.FC = () => {
  const [history, setHistory] = useState<TimetableHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTimetableHistory();
      if (res.success) {
        setHistory(res.history);
      }
    } catch (e) {
      console.warn('Could not load timetable history', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'PUBLISHED':
        return <Badge label="Published" variant="success" size="sm" />;
      case 'AUTO_GENERATED':
        return <Badge label="AI Generated" variant="secondary" size="sm" />;
      case 'ENTRY_ADDED':
        return <Badge label="Class Added" variant="primary" size="sm" />;
      case 'ENTRY_MODIFIED':
        return <Badge label="Rescheduled" variant="warning" size="sm" />;
      case 'ENTRY_DELETED':
        return <Badge label="Cancelled" variant="danger" size="sm" />;
      default:
        return <Badge label={action} variant="neutral" size="sm" />;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchHistory} />}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Timetable Update Audit Trail</Text>
          <Text style={styles.sub}>
            Chronological record of institutional schedule changes, optimization deployments, and reasons.
          </Text>
        </View>
        <Badge label={`${history.length} Log Entries`} variant="neutral" size="sm" />
      </View>

      <View style={styles.timeline}>
        {history.map((record, idx) => (
          <View key={record.id || idx} style={styles.itemWrap}>
            {/* Timeline Line */}
            {idx < history.length - 1 && <View style={styles.timelineLine} />}

            {/* Timeline Node */}
            <View style={styles.nodeCircle}>
              <History size={12} color={COLORS.surface} />
            </View>

            {/* Card Content */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {getActionBadge(record.action)}
                <Text style={styles.timestamp}>{formatDate(record.modificationDate)}</Text>
              </View>

              <Text style={styles.summaryText}>{record.summary}</Text>

              {record.reason ? (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonLabel}>Reason:</Text>
                  <Text style={styles.reasonText}>{record.reason}</Text>
                </View>
              ) : null}

              <View style={styles.footerRow}>
                <View style={styles.metaBox}>
                  <User size={12} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{record.modifiedBy}</Text>
                </View>

                {record.affectedFacultyIds && record.affectedFacultyIds.length > 0 && (
                  <Text style={styles.affectedText}>
                    {record.affectedFacultyIds.length} faculty alerted
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  sub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  timeline: {
    paddingLeft: SPACING.sm,
  },
  itemWrap: {
    position: 'relative',
    paddingLeft: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  timelineLine: {
    position: 'absolute',
    left: 9,
    top: 24,
    bottom: -SPACING.lg,
    width: 2,
    backgroundColor: COLORS.border,
  },
  nodeCircle: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    lineHeight: 18,
    marginVertical: SPACING.xs,
  },
  reasonBox: {
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  affectedText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});



export default HistoryAuditScreen;

