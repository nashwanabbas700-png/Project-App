import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, CheckCircle2, ShieldCheck, TrendingUp, History } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme'

interface QualityScoreCardProps {
  score: number;
  metrics: {
    hardConstraintsSatisfied: number;
    softConstraintsSatisfaction: number;
    workloadBalanceScore: number;
    historicalAlignmentScore: number;
  };
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({ score, metrics }) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreNumber}>{score}%</Text>
          <Text style={styles.scoreLabel}>Scheduling Quality Score</Text>
        </View>

        <View style={styles.badge}>
          <Sparkles size={14} color="#F59E0B" />
          <Text style={styles.badgeText}>Smart Optimized</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Metrics Breakdown Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <ShieldCheck size={14} color={COLORS.success} />
            <Text style={styles.metricTitle}>Hard Constraints</Text>
          </View>
          <Text style={[styles.metricValue, { color: COLORS.success }]}>
            {metrics.hardConstraintsSatisfied}%
          </Text>
          <Text style={styles.metricSub}>100% Conflict-Free</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <History size={14} color={COLORS.secondary} />
            <Text style={styles.metricTitle}>Historical Match</Text>
          </View>
          <Text style={[styles.metricValue, { color: COLORS.secondary }]}>
            {metrics.historicalAlignmentScore}%
          </Text>
          <Text style={styles.metricSub}>Past Pattern Alignment</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <TrendingUp size={14} color="#7C3AED" />
            <Text style={styles.metricTitle}>Soft Preferences</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#7C3AED' }]}>
            {metrics.softConstraintsSatisfaction}%
          </Text>
          <Text style={styles.metricSub}>Faculty Window Fit</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <CheckCircle2 size={14} color={COLORS.primary} />
            <Text style={styles.metricTitle}>Workload Balance</Text>
          </View>
          <Text style={[styles.metricValue, { color: COLORS.primary }]}>
            {metrics.workloadBalanceScore}%
          </Text>
          <Text style={styles.metricSub}>Distribution Parity</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    marginBottom: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metricItem: {
    flex: 1,
    minWidth: 130,
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});




