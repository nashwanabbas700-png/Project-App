import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Users,
  BookOpen,
  Calendar,
  Building2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowRight,
  Download,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { StatCard } from '../../components/mobile/StatCard';

export const AdminDashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, radius, shadow } = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalFaculty: 5,
    totalCourses: 10,
    totalClassrooms: 5,
    totalScheduledClasses: 18,
    totalConflicts: 0,
    qualityScore: 94,
    status: 'ONLINE',
  });
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [dashRes, histRes] = await Promise.all([
        api.getDashboardStats(),
        api.getTimetableHistory(),
      ]);

      if (dashRes.success && dashRes.stats) {
        setStats(dashRes.stats);
      }
      if (histRes.success && histRes.history) {
        setRecentHistory(histRes.history.slice(0, 5));
      }
    } catch (e) {
      console.warn('Dashboard data fetch error', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="EduNova Administration" subtitle="University Timetable SaaS" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
      >
        {/* Welcome Admin Banner */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary, borderRadius: radius.lg }, shadow.md]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroPre}>Institutional Control Center</Text>
              <Text style={styles.heroName}>{user?.name || 'Administrator'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.25)' }]}>
              <View style={[styles.pulseDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statusText}>Live System</Text>
            </View>
          </View>
          <Text style={styles.heroSub}>
            Fall 2026 Master Timetable active with verified zero-conflict schedule.
          </Text>
        </View>

        {/* System Health / Quality Rating Banner */}
        <View
          style={[
            styles.healthCard,
            {
              backgroundColor: colors.card,
              borderColor: stats.totalConflicts === 0 ? colors.successBorder : colors.warningBorder,
              borderRadius: radius.md,
            },
            shadow.sm,
          ]}
        >
          <View style={styles.healthLeft}>
            {stats.totalConflicts === 0 ? (
              <ShieldCheck size={24} color={colors.success} />
            ) : (
              <ShieldAlert size={24} color={colors.warning} />
            )}
            <View style={styles.healthTextWrap}>
              <Text style={[styles.healthTitle, { color: colors.text }]}>
                {stats.totalConflicts === 0 ? 'Optimal Schedule Health' : 'Conflicts Detected'}
              </Text>
              <Text style={[styles.healthDesc, { color: colors.textSecondary }]}>
                Quality Rating: <Text style={{ fontWeight: '800', color: colors.accent }}>{stats.qualityScore}%</Text> • {stats.totalConflicts} hard clashes
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation?.navigate('Timetable')}
            style={[styles.inspectBtn, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm }]}
          >
            <Text style={[styles.inspectText, { color: colors.accent }]}>Audit</Text>
          </TouchableOpacity>
        </View>

        {/* KPI Stats Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Institutional Metrics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Faculty"
              value={stats.totalFaculty}
              subtitle="Registered professors"
              icon={<Users size={16} color={colors.accent} />}
            />
            <StatCard
              label="Courses"
              value={stats.totalCourses}
              subtitle="Academic catalog"
              icon={<BookOpen size={16} color={colors.purple} />}
              accentColor={colors.purple}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Campus Rooms"
              value={stats.totalClassrooms}
              subtitle="Labs & lecture halls"
              icon={<Building2 size={16} color={colors.teal} />}
              accentColor={colors.teal}
            />
            <StatCard
              label="Weekly Sessions"
              value={stats.totalScheduledClasses}
              subtitle="Scheduled classes"
              icon={<Clock size={16} color={colors.warning} />}
              accentColor={colors.warning}
            />
          </View>
        </View>

        {/* Quick Management Shortcuts */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Management</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('Timetable')}
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: colors.infoBg }]}>
              <Sparkles size={20} color={colors.accent} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Smart Scheduler</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>Run generation engine & scenarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('Faculty')}
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: colors.warningBg }]}>
              <Users size={20} color={colors.warning} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Faculty & Leaves</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>Workloads & substitute approvals</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Audit Activity Feed */}
        <View style={styles.historyHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Recent Audit History</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Settings')}>
            <Text style={[styles.viewAllText, { color: colors.accent }]}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.historyContainer, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
          {recentHistory.length === 0 ? (
            <Text style={[styles.noHistoryText, { color: colors.textMuted }]}>
              No modifications recorded this session.
            </Text>
          ) : (
            recentHistory.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[
                  styles.historyItem,
                  idx !== recentHistory.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.historyTopLine}>
                  <View style={[styles.actionBadge, { backgroundColor: `${colors.accent}14` }]}>
                    <Text style={[styles.actionBadgeText, { color: colors.accent }]}>{item.action}</Text>
                  </View>
                  <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                    {new Date(item.modificationDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={[styles.historySummary, { color: colors.text }]}>{item.summary}</Text>
                <Text style={[styles.historyBy, { color: colors.textSecondary }]}>By: {item.modifiedBy}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboardScreen;

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
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroPre: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  heroSub: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  healthCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  healthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  healthTextWrap: {
    flex: 1,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  healthDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  inspectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inspectText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 4,
  },
  statsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyContainer: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  noHistoryText: {
    paddingVertical: 14,
    textAlign: 'center',
    fontSize: 12,
  },
  historyItem: {
    paddingVertical: 12,
  },
  historyTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  historyDate: {
    fontSize: 11,
  },
  historySummary: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyBy: {
    fontSize: 11,
  },
});
