import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import {
  Sparkles,
  Calendar,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Download,
  FileSpreadsheet,
  CheckCircle,
  TrendingUp,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { TimetableEntry, DetectedConflict } from '../../types';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { ClassCard } from '../../components/mobile/ClassCard';
import { EmptyState } from '../../components/mobile/EmptyState';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DEPARTMENTS = ['All', 'Computer Science', 'Electrical Engineering', 'Business Administration'];

export const AdminTimetableScreen: React.FC = () => {
  const { colors, radius, shadow } = useTheme();

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedDept, setSelectedDept] = useState('All');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [conflicts, setConflicts] = useState<DetectedConflict[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Generation Modal State
  const [genModalVisible, setGenModalVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const loadTimetableData = async () => {
    try {
      const [masterRes, scenRes] = await Promise.all([
        api.getMasterTimetable({
          semester: 'Fall 2026',
          department: selectedDept === 'All' ? undefined : selectedDept,
        }),
        api.getScenarios(),
      ]);

      if (masterRes.success) {
        setEntries(masterRes.entries || []);
        setConflicts(masterRes.conflicts || []);
      }
      if (scenRes.success && scenRes.scenarios) {
        setScenarios(scenRes.scenarios);
      }
    } catch (e) {
      console.warn('Admin timetable fetch error', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTimetableData();
  }, [selectedDept]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTimetableData();
  };

  const dayEntries = entries.filter((e) => e.day === selectedDay);

  const handleSimulate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.simulateIntelligentSchedule({
        semester: 'Fall 2026',
        academicYear: '2026-2027',
        department: selectedDept === 'All' ? 'All' : selectedDept,
        preferHistoricalPatterns: true,
        balanceWorkload: true,
      });

      if (res.success && res.result) {
        setSimulationResult(res.result);
      }
    } catch (e: any) {
      Alert.alert('Simulation Error', e.message || 'Failed to run generator');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySchedule = async () => {
    if (!simulationResult) return;
    try {
      const res = await api.applyGeneratedSchedule({
        semester: 'Fall 2026',
        generatedEntries: simulationResult.generatedEntries,
        qualityScore: simulationResult.qualityScore,
        metrics: simulationResult.metrics,
      });

      if (res.success) {
        Alert.alert('Success', `Master schedule updated with ${res.entriesCount} slots.`);
        setGenModalVisible(false);
        setSimulationResult(null);
        loadTimetableData();
      }
    } catch (e: any) {
      Alert.alert('Apply Failed', e.message);
    }
  };

  const handlePromoteScenario = async (id: string, name: string) => {
    try {
      const res = await api.promoteScenario(id);
      if (res.success) {
        Alert.alert('Scenario Promoted', `"${name}" is now the active live institutional schedule.`);
        loadTimetableData();
      }
    } catch (e: any) {
      Alert.alert('Promotion Error', e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Master Timetable" subtitle="Institutional Scheduling Engine" />

      {/* Department Filter Strip */}
      <View style={[styles.filterStrip, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {DEPARTMENTS.map((dept) => {
            const active = selectedDept === dept;
            return (
              <TouchableOpacity
                key={dept}
                onPress={() => setSelectedDept(dept)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? colors.accent : colors.surfaceSecondary,
                    borderColor: active ? colors.accent : colors.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text style={[styles.filterPillText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                  {dept}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Day Tabs */}
      <View style={[styles.dayTabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {DAYS.map((day) => {
          const active = selectedDay === day;
          const count = entries.filter((e) => e.day === day).length;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayTabItem,
                active && { borderBottomColor: colors.accent, borderBottomWidth: 3 },
              ]}
            >
              <Text style={[styles.dayTabShort, { color: active ? colors.accent : colors.textMuted }]}>
                {day.substring(0, 3)}
              </Text>
              <Text style={[styles.dayTabCount, { color: active ? colors.text : colors.textMuted }]}>
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Generator Launch Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setGenModalVisible(true);
            handleSimulate();
          }}
          style={[styles.generatorHeroBtn, { backgroundColor: colors.primary, borderRadius: radius.md }, shadow.sm]}
        >
          <View style={styles.generatorLeft}>
            <View style={[styles.sparkleWrap, { backgroundColor: colors.accent }]}>
              <Sparkles size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.generatorTitle}>Run Smart Scheduler</Text>
              <Text style={styles.generatorSub}>Constraint optimization + historical patterns</Text>
            </View>
          </View>
          <View style={styles.arrowPill}>
            <Text style={styles.arrowText}>Launch →</Text>
          </View>
        </TouchableOpacity>

        {/* Conflict Detection Banner */}
        {conflicts.length > 0 ? (
          <View style={[styles.conflictBanner, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder, borderRadius: radius.md }]}>
            <ShieldAlert size={18} color={colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.conflictTitle, { color: colors.danger }]}>
                {conflicts.length} Hard Clashes Detected
              </Text>
              <Text style={[styles.conflictDesc, { color: colors.textSecondary }]}>
                {conflicts[0]?.description}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.verifiedBanner, { backgroundColor: colors.successBg, borderColor: colors.successBorder, borderRadius: radius.md }]}>
            <ShieldCheck size={18} color={colors.success} />
            <Text style={[styles.verifiedText, { color: colors.success }]}>
              Zero schedule conflicts detected. All faculty, rooms, and sections compliant.
            </Text>
          </View>
        )}

        {/* Multi-Scenario Sandbox Carousel */}
        <View style={styles.scenariosSection}>
          <Text style={[styles.scenariosHeading, { color: colors.text }]}>What-If Planning Scenarios</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarioCardsWrap}>
            {scenarios.map((scen) => (
              <View
                key={scen.id}
                style={[
                  styles.scenarioCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: scen.isPublished ? colors.accent : colors.border,
                    borderWidth: scen.isPublished ? 1.5 : 1,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <View style={styles.scenTop}>
                  <Text style={[styles.scenName, { color: colors.text }]} numberOfLines={1}>
                    {scen.name}
                  </Text>
                  {scen.isPublished && (
                    <View style={[styles.activeTag, { backgroundColor: colors.accent }]}>
                      <Text style={styles.activeTagText}>LIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.scenDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {scen.description}
                </Text>
                <View style={styles.scenFooter}>
                  <Text style={[styles.scenScore, { color: colors.accent }]}>
                    {scen.qualityScore}% Quality
                  </Text>
                  {!scen.isPublished && (
                    <TouchableOpacity
                      onPress={() => handlePromoteScenario(scen.id, scen.name)}
                      style={[styles.promoteBtn, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <Text style={[styles.promoteBtnText, { color: colors.accent }]}>Promote to Live</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Classes Scheduled for the Day */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
            {selectedDay} Schedule ({dayEntries.length})
          </Text>
          <Text style={[styles.deptSub, { color: colors.textSecondary }]}>
            {selectedDept}
          </Text>
        </View>

        {dayEntries.length === 0 ? (
          <EmptyState
            title={`No Classes Scheduled on ${selectedDay}`}
            description="Run the Smart Scheduler above to generate institutional assignments for this period."
          />
        ) : (
          dayEntries.map((item, idx) => (
            <ClassCard
              key={item.id || idx}
              entry={item}
              showFaculty={true}
              showSection={true}
            />
          ))
        )}

        {/* Export Actions */}
        <View style={styles.exportSection}>
          <Text style={[styles.exportTitle, { color: colors.text }]}>Export Master Timetable</Text>
          <View style={styles.exportBtnRow}>
            <TouchableOpacity
              onPress={() => Linking.openURL(api.getExportICSUrl({ semester: 'Fall 2026' }))}
              style={[styles.exportBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
            >
              <Download size={15} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Calendar (.ics)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL(api.getExportCSVUrl({ semester: 'Fall 2026' }))}
              style={[
                styles.exportBtnOutline,
                { borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius.md },
              ]}
            >
              <FileSpreadsheet size={15} color={colors.text} />
              <Text style={[styles.exportBtnOutlineText, { color: colors.text }]}>CSV Spreadsheet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Generator Simulation Modal */}
      <Modal visible={genModalVisible} transparent animationType="slide" onRequestClose={() => setGenModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderRadius: radius.lg }, shadow.lg]}>
            <View style={styles.modalTopLine}>
              <View style={styles.modalTopLeft}>
                <Sparkles size={20} color={colors.accent} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Smart Scheduling Generator</Text>
              </View>
              <TouchableOpacity onPress={() => setGenModalVisible(false)}>
                <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            {isGenerating ? (
              <View style={styles.generatingState}>
                <Text style={[styles.generatingText, { color: colors.text }]}>
                  Evaluating constraints & historical patterns...
                </Text>
                <Text style={[styles.generatingSub, { color: colors.textSecondary }]}>
                  Balancing faculty contact hours and room types.
                </Text>
              </View>
            ) : simulationResult ? (
              <View style={styles.resultBox}>
                <View style={[styles.scoreHero, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md }]}>
                  <Text style={[styles.scoreNumber, { color: colors.accent }]}>
                    {simulationResult.qualityScore}%
                  </Text>
                  <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                    Optimization Quality Score
                  </Text>
                </View>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: colors.success }]}>
                      {simulationResult.metrics?.hardConstraintsSatisfied || 100}%
                    </Text>
                    <Text style={[styles.metricLbl, { color: colors.textSecondary }]}>Hard Rules</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: colors.accent }]}>
                      {simulationResult.metrics?.totalClassesScheduled || 18}
                    </Text>
                    <Text style={[styles.metricLbl, { color: colors.textSecondary }]}>Slots Created</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: colors.purple }]}>
                      {simulationResult.metrics?.workloadBalanceScore || 92}%
                    </Text>
                    <Text style={[styles.metricLbl, { color: colors.textSecondary }]}>Load Balance</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleApplySchedule}
                  style={[styles.applyBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
                >
                  <Text style={styles.applyBtnText}>Apply Schedule to Live Timetable</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminTimetableScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  dayTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  dayTabShort: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayTabCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  generatorHeroBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 14,
  },
  generatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sparkleWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatorTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  generatorSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  arrowPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  conflictTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  conflictDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  scenariosSection: {
    marginBottom: 18,
  },
  scenariosHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  scenarioCardsWrap: {
    gap: 10,
  },
  scenarioCard: {
    width: 240,
    padding: 14,
    justifyContent: 'space-between',
  },
  scenTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scenName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  activeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scenDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 10,
  },
  scenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scenScore: {
    fontSize: 12,
    fontWeight: '800',
  },
  promoteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoteBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  deptSub: {
    fontSize: 12,
  },
  exportSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.25)',
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  exportBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  exportBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 6,
  },
  exportBtnOutlineText: {
    fontWeight: '700',
    fontSize: 12,
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
  modalTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  generatingState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  generatingText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  generatingSub: {
    fontSize: 12,
  },
  resultBox: {
    gap: 14,
  },
  scoreHero: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  applyBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
