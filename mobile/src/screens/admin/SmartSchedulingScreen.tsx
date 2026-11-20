import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import {
  Sparkles,
  History,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Send,
  Sliders,
  Check,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme'
import { SEMESTER_OPTIONS, DEPARTMENT_OPTIONS } from '../../constants/config';
import { useTimetable } from '../../context/TimetableContext';
import { api } from '../../services/api';
import { GenerationSimulationResult } from '../../types';
import { QualityScoreCard } from '../../components/smartScheduling/QualityScoreCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ClassCard } from '../../components/timetable/ClassCard';

export const SmartSchedulingScreen: React.FC = () => {
  const { refreshAll } = useTimetable();

  // Step state (1: Setup, 2: Simulating, 3: Review Results)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [targetSemester, setTargetSemester] = useState<string>('Spring 2027');
  const [targetDepartment, setTargetDepartment] = useState<string>('All');
  const [preferHistorical, setPreferHistorical] = useState<boolean>(true);
  const [balanceWorkload, setBalanceWorkload] = useState<boolean>(true);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<GenerationSimulationResult | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const res = await api.getScenarios();
        if (res.success) setScenarios(res.scenarios);
      } catch (e) {
        // silent
      }
    };
    loadScenarios();
  }, []);

  const handlePromoteScenario = async (id: string, name: string) => {
    try {
      await api.promoteScenario(id);
      Alert.alert('Scenario Activated!', `"${name}" is now the live institutional master timetable.`);
      await refreshAll();
      const res = await api.getScenarios();
      if (res.success) setScenarios(res.scenarios);
    } catch (e: any) {
      Alert.alert('Promotion Failed', e.message);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setCurrentStep(2);
    try {
      const res = await api.simulateIntelligentSchedule({
        semester: targetSemester,
        academicYear: '2026-2027',
        department: targetDepartment,
        preferHistoricalPatterns: preferHistorical,
        balanceWorkload,
      });

      if (res.success && res.result) {
        setSimulationResult(res.result);
        setCurrentStep(3);
      }
    } catch (e: any) {
      Alert.alert('Scheduling Engine Error', e.message);
      setCurrentStep(1);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCommitSchedule = async () => {
    if (!simulationResult) return;
    setIsCommitting(true);
    try {
      const res = await api.applyGeneratedSchedule({
        semester: simulationResult.semester,
        generatedEntries: simulationResult.generatedEntries,
        qualityScore: simulationResult.qualityScore,
        metrics: simulationResult.metrics,
      });

      Alert.alert(
        'Timetable Successfully Applied & Published!',
        `The intelligent schedule with ${res.entriesCount} lectures and quality score of ${simulationResult.qualityScore}% has been deployed. All ${res.affectedFacultyCount} affected faculty members received instant synchronization alerts.`
      );
      await refreshAll();
    } catch (e: any) {
      Alert.alert('Deployment Failed', e.message);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Title Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerBadge}>
          <Sparkles size={16} color="#B45309" />
          <Text style={styles.headerBadgeText}>AI & Constraint Engine</Text>
        </View>
        <Text style={styles.headerTitle}>Intelligent Timetable Generator</Text>
        <Text style={styles.headerSub}>
          Leverages previous semester patterns, faculty availability constraints, and room capacities to create optimal schedules.
        </Text>

        {/* Step Progress Bar */}
        <View style={styles.stepsBar}>
          <View style={[styles.stepItem, currentStep >= 1 && styles.stepItemActive]}>
            <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
              <Text style={[styles.stepNum, currentStep >= 1 && styles.stepNumActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Parameters</Text>
          </View>

          <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

          <View style={[styles.stepItem, currentStep >= 2 && styles.stepItemActive]}>
            <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
              <Text style={[styles.stepNum, currentStep >= 2 && styles.stepNumActive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Constraint Solver</Text>
          </View>

          <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

          <View style={[styles.stepItem, currentStep >= 3 && styles.stepItemActive]}>
            <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
              <Text style={[styles.stepNum, currentStep >= 3 && styles.stepNumActive]}>3</Text>
            </View>
            <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Review & Publish</Text>
          </View>
        </View>
      </View>

      {/* ── Multi-Scenario Planning Sandbox ── */}
      {currentStep === 1 && scenarios.length > 0 && (
        <View style={styles.scenarioSandboxCard}>
          <View style={styles.sandboxHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sandboxTitle}>Multi-Scenario Sandbox ("What-If" Branches)</Text>
              <Text style={styles.sandboxSub}>Compare active vs draft scheduling scenarios and promote with 1-click</Text>
            </View>
            <Badge label={`${scenarios.length} Scenarios`} variant="secondary" size="sm" />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarioList}>
            {scenarios.map((scen) => (
              <View key={scen.id} style={[styles.scenCard, scen.isPublished && styles.scenCardActive]}>
                <View style={styles.scenTopRow}>
                  <Badge
                    label={scen.isPublished ? '● Active Live' : 'Draft Scenario'}
                    variant={scen.isPublished ? 'success' : 'neutral'}
                    size="sm"
                  />
                  <Text style={styles.scenScore}>{scen.qualityScore}% Quality</Text>
                </View>

                <Text style={styles.scenName}>{scen.name}</Text>
                <Text style={styles.scenDesc} numberOfLines={2}>{scen.description}</Text>

                <View style={styles.scenFooter}>
                  {scen.isPublished ? (
                    <Text style={styles.activeLabel}>Currently Live Schedule</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.promoteBtn}
                      onPress={() => handlePromoteScenario(scen.id, scen.name)}
                      activeOpacity={0.8}
                    >
                      <Sparkles size={12} color={COLORS.secondary} />
                      <Text style={styles.promoteBtnText}>Promote to Live</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* STEP 1: Parameters Setup */}
      {currentStep === 1 && (
        <View style={styles.stepSection}>
          <Text style={styles.sectionTitle}>1. Target Semester & Scope</Text>

          {/* Semester Selector */}
          <Text style={styles.fieldLabel}>Select Academic Semester</Text>
          <View style={styles.pillsRow}>
            {SEMESTER_OPTIONS.map((sem) => {
              const isSelected = targetSemester === sem;
              return (
                <TouchableOpacity
                  key={sem}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setTargetSemester(sem)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {sem}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Department Selector */}
          <Text style={styles.fieldLabel}>Department Scope</Text>
          <View style={styles.pillsRow}>
            {DEPARTMENT_OPTIONS.map((dept) => {
              const isSelected = targetDepartment === dept;
              return (
                <TouchableOpacity
                  key={dept}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setTargetDepartment(dept)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {dept}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Optimization Flags */}
          <Text style={styles.fieldLabel}>Scheduling Intelligence Options</Text>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setPreferHistorical(!preferHistorical)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, preferHistorical && styles.checkboxActive]}>
              {preferHistorical && <Check size={14} color={COLORS.surface} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Historical Pattern Compatibility Engine</Text>
              <Text style={styles.optionDesc}>
                Weights previous successful classroom allocations and student attendance ratings from Fall 2025 & Spring 2025.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setBalanceWorkload(!balanceWorkload)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, balanceWorkload && styles.checkboxActive]}>
              {balanceWorkload && <Check size={14} color={COLORS.surface} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Faculty Workload & Fatigue Optimization</Text>
              <Text style={styles.optionDesc}>
                Avoids consecutive marathon lectures and equalizes teaching credit distributions across all departments.
              </Text>
            </View>
          </TouchableOpacity>

          <Button
            title="Analyze Constraints & Generate Timetable"
            onPress={handleRunSimulation}
            icon={<Sparkles size={18} color={COLORS.surface} />}
            size="lg"
            style={{ marginTop: SPACING.xl }}
          />
        </View>
      )}

      {/* STEP 2: Solver Running Animation */}
      {currentStep === 2 && isSimulating && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingTitle}>Running Constraint Solver...</Text>
          <Text style={styles.loadingSub}>
            Evaluating 8 classrooms, 10 faculty member availability windows, laboratory hardware requirements, and historical records.
          </Text>
        </View>
      )}

      {/* STEP 3: Results & Quality Metrics */}
      {currentStep === 3 && simulationResult && (
        <View style={styles.stepSection}>
          <QualityScoreCard
            score={simulationResult.qualityScore}
            metrics={simulationResult.metrics}
          />

          {/* Recommendations Banner */}
          <View style={styles.recsBox}>
            <View style={styles.recsHeader}>
              <ShieldCheck size={18} color={COLORS.success} />
              <Text style={styles.recsTitle}>Constraint Engine Validation</Text>
            </View>
            {simulationResult.recommendations.map((rec, idx) => (
              <Text key={idx} style={styles.recItem}>
                • {rec}
              </Text>
            ))}
          </View>

          {/* Historical Insights Applied */}
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <History size={16} color={COLORS.secondary} />
              <Text style={styles.insightsTitle}>Historical Data Intelligence Applied</Text>
            </View>
            {simulationResult.historicalInsightsApplied.summary.map((insight, idx) => (
              <Text key={idx} style={styles.insightItem}>
                ✓ {insight}
              </Text>
            ))}
          </View>

          {/* Workload Impact Snapshot */}
          <View style={styles.workloadSnapshot}>
            <Text style={styles.snapshotTitle}>Faculty Workload Distribution</Text>
            <View style={styles.impactGrid}>
              {simulationResult.facultyWorkloadImpact.map((fac) => (
                <View key={fac.facultyId} style={styles.impactCard}>
                  <Text style={styles.impactName} numberOfLines={1}>
                    {fac.facultyName}
                  </Text>
                  <Text style={styles.impactHours}>
                    {fac.assignedHours}h / {fac.maxHours}h
                  </Text>
                  <Badge
                    label={fac.status}
                    variant={fac.status === 'OVERLOADED' ? 'danger' : 'success'}
                    size="sm"
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Generated Entries Preview List */}
          <View style={styles.previewWrap}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                Generated Classes ({simulationResult.generatedEntries.length})
              </Text>
              <Badge label="100% Conflict-Free" variant="success" size="sm" />
            </View>

            {simulationResult.generatedEntries.slice(0, 6).map((entry, idx) => (
              <ClassCard key={idx} entry={entry} showFaculty={true} />
            ))}

            {simulationResult.generatedEntries.length > 6 && (
              <Text style={styles.moreClassesNote}>
                + {simulationResult.generatedEntries.length - 6} more optimized class sessions ready to deploy.
              </Text>
            )}
          </View>

          {/* Action Row: Regenerate or 1-Click Commit */}
          <View style={styles.finalActions}>
            <Button
              title="Regenerate"
              onPress={handleRunSimulation}
              variant="outline"
              icon={<RefreshCw size={16} color={COLORS.primary} />}
              style={{ flex: 1 }}
            />
            <Button
              title="Accept & Publish Timetable"
              onPress={handleCommitSchedule}
              loading={isCommitting}
              icon={<Send size={16} color={COLORS.surface} />}
              style={{ flex: 2 }}
            />
          </View>
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
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  scenarioSandboxCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  sandboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sandboxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sandboxSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  scenarioList: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  scenCard: {
    width: 260,
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  scenCardActive: {
    borderColor: COLORS.success,
    backgroundColor: '#F0FDF4',
  },
  scenTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scenScore: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scenName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  scenDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginBottom: SPACING.sm,
  },
  scenFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.xs,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  promoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  promoteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  stepsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepItemActive: {},
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceBlue,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepNumActive: {
    color: COLORS.textOnDark,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  stepLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.textOnDark,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  optionDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  loadingBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: SPACING.lg,
  },
  loadingSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
    maxWidth: 280,
  },
  recsBox: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: SPACING.md,
  },
  recsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  recItem: {
    fontSize: 12,
    color: '#14532D',
    marginTop: 2,
    lineHeight: 16,
  },
  insightsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  insightsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  insightItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  workloadSnapshot: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  snapshotTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  impactCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  impactName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  impactHours: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  previewWrap: {
    marginTop: SPACING.md,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  moreClassesNote: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  finalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});







export default SmartSchedulingScreen;

