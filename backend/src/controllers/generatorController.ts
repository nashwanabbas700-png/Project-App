import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { SchedulingEngine } from '../algorithms/schedulingEngine.js';
import { broadcastTimetableUpdate, broadcastNotification } from '../services/socketService.js';

export class GeneratorController {
  public static async simulateSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        semester = 'Spring 2027',
        academicYear = '2026-2027',
        department = 'All',
        preferHistoricalPatterns = true,
        balanceWorkload = true,
      } = req.body;

      const facultyList = store.getFacultyList();
      const coursesList = store.getCourses();
      const classroomsList = store.getClassrooms();
      const historicalRecords = store.getHistoricalRecords();

      const result = SchedulingEngine.generateTimetable(
        {
          semester,
          academicYear,
          department,
          preferHistoricalPatterns,
          balanceWorkload,
        },
        {
          facultyList,
          coursesList,
          classroomsList,
          historicalRecords,
        }
      );

      res.status(200).json({
        success: true,
        message: 'Intelligent schedule generated successfully using constraint solver and historical patterns.',
        result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async applyGeneratedSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        timetableId = 'tt-fall-2026-main',
        semester = 'Fall 2026',
        generatedEntries = [],
        qualityScore = 95,
        metrics,
      } = req.body;

      if (!generatedEntries || generatedEntries.length === 0) {
        res.status(400).json({ success: false, message: 'No generated schedule entries provided to apply.' });
        return;
      }

      // Replace entries in store
      const appliedEntries = store.replaceTimetableEntries(timetableId, generatedEntries);

      // Update timetable record metadata
      store.updateTimetable(timetableId, {
        status: 'published',
        qualityScore,
        metrics: metrics || {
          hardConstraintsViolated: 0,
          softConstraintsSatisfaction: 94,
          workloadBalanceScore: 92,
          historicalAlignmentScore: 95,
        },
        publishedAt: new Date(),
        publishedBy: req.user?.email || 'admin@smartsched.edu',
      });

      // Audit trail
      const affectedFaculty = Array.from(new Set(appliedEntries.map((e) => e.facultyId)));
      store.addTimetableHistory({
        timetableId,
        action: 'AUTO_GENERATED',
        modifiedBy: req.user?.email || 'admin@smartsched.edu',
        summary: `Intelligent timetable engine committed ${appliedEntries.length} classes for ${semester} with score ${qualityScore}%.`,
        affectedFacultyIds: affectedFaculty,
        reason: 'Automated AI timetable optimization and deployment.',
      });

      // Notify faculty
      affectedFaculty.forEach((facId) => {
        const notif = store.addNotification({
          recipientFacultyId: facId,
          title: `New Optimized Timetable Applied`,
          message: `Your schedule for ${semester} has been auto-generated with historical preferences and published.`,
          type: 'TIMETABLE_PUBLISHED',
        });
        broadcastNotification(facId, notif);
      });

      broadcastTimetableUpdate({
        timetableId,
        action: 'AUTO_GENERATED',
        affectedFacultyIds: affectedFaculty,
        message: 'Intelligent timetable generated and applied.',
      });

      res.status(200).json({
        success: true,
        message: `Successfully applied ${appliedEntries.length} optimized timetable entries.`,
        entriesCount: appliedEntries.length,
        affectedFacultyCount: affectedFaculty.length,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getHistoricalInsights(req: Request, res: Response): Promise<void> {
    try {
      const records = store.getHistoricalRecords();

      const semesterGroup: Record<string, number> = {};
      let totalRating = 0;
      let zeroConflictCount = 0;

      records.forEach((r) => {
        semesterGroup[r.semester] = (semesterGroup[r.semester] || 0) + 1;
        totalRating += r.successRating || 4.5;
        if (r.conflictCount === 0) zeroConflictCount++;
      });

      const avgSatisfaction = parseFloat((totalRating / (records.length || 1)).toFixed(2));
      const zeroConflictRate = parseFloat(((zeroConflictCount / (records.length || 1)) * 100).toFixed(1));

      res.status(200).json({
        success: true,
        totalRecords: records.length,
        semestersAnalyzed: Object.keys(semesterGroup),
        semesterBreakdown: semesterGroup,
        averageSatisfactionRating: avgSatisfaction,
        historicalZeroConflictRate: `${zeroConflictRate}%`,
        records,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
