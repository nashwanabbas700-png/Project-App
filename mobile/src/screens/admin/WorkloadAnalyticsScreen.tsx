import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { BarChart3, AlertTriangle, CheckCircle2, TrendingUp, Users, ShieldAlert } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme'
import { api } from '../../services/api';
import { WorkloadReport } from '../../types';
import { WorkloadCard } from '../../components/workload/WorkloadCard';
import { StatWidget } from '../../components/common/StatWidget';

export const WorkloadAnalyticsScreen: React.FC = () => {
  const [report, setReport] = useState<WorkloadReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchWorkload = async () => {
    setIsLoading(true);
    try {
      const res = await api.getWorkloadAnalytics();
      if (res.success && res.report) {
        setReport(res.report);
      }
    } catch (e) {
      console.warn('Failed to fetch workload analytics', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchWorkload} />}
    >
      {/* Overview Score Card */}
      <View style={styles.topCard}>
        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.topCardLabel}>Institutional Balance Parity</Text>
            <Text style={styles.balanceScore}>{report?.overallBalanceScore || 92}%</Text>
          </View>

          <View style={styles.kpiPills}>
            <View style={[styles.kpiPill, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.kpiPillVal, { color: COLORS.danger }]}>
                {report?.overloadedCount || 0}
              </Text>
              <Text style={styles.kpiPillLabel}>Overloaded</Text>
            </View>

            <View style={[styles.kpiPill, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.kpiPillVal, { color: COLORS.success }]}>
                {report?.balancedCount || 0}
              </Text>
              <Text style={styles.kpiPillLabel}>Balanced</Text>
            </View>

            <View style={[styles.kpiPill, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.kpiPillVal, { color: COLORS.warning }]}>
                {report?.underutilizedCount || 0}
              </Text>
              <Text style={styles.kpiPillLabel}>Available</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        {report?.systemRecommendations && report.systemRecommendations.length > 0 && (
          <View style={styles.recsBox}>
            <Text style={styles.recsTitle}>AI Optimization Advice:</Text>
            {report.systemRecommendations.map((rec, i) => (
              <Text key={i} style={styles.recItem}>
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Metrics Row */}
      <View style={styles.statsRow}>
        <StatWidget
          label="Total Faculty"
          value={report?.totalFaculty || 10}
          subtitle="Monitored profiles"
          icon={<Users size={16} color={COLORS.primary} />}
          accentColor={COLORS.primary}
        />
        <StatWidget
          label="Weekly Total"
          value={`${report?.totalWeeklyTeachingHours || 0}h`}
          subtitle={`Avg: ${report?.averageWeeklyHours || 0}h / faculty`}
          icon={<BarChart3 size={16} color={COLORS.secondary} />}
          accentColor={COLORS.secondary}
        />
      </View>

      {/* Faculty Workload Breakdown List */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Individual Faculty Workload Distribution</Text>

        {report?.facultySummaries.map((fac) => (
          <WorkloadCard key={fac.facultyId} summary={fac} />
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
  topCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  topCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  balanceScore: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  kpiPills: {
    flexDirection: 'row',
    gap: 6,
  },
  kpiPill: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    minWidth: 64,
  },
  kpiPillVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  kpiPillLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  recsBox: {
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  recsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  recItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionWrap: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.md,
  },
});





export default WorkloadAnalyticsScreen;

