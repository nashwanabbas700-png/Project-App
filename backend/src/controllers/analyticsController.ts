import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { WorkloadOptimizer } from '../algorithms/workloadOptimizer.js';
import { ConflictDetector } from '../algorithms/conflictDetector.js';

export class AnalyticsController {
  public static async getWorkloadAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const facultyList = store.getFacultyList();
      const entries = store.getTimetableEntries();

      const report = WorkloadOptimizer.calculateWorkload(facultyList, entries);
      res.status(200).json({ success: true, report });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getConflictReport(req: Request, res: Response): Promise<void> {
    try {
      const entries = store.getTimetableEntries();
      const facultyList = store.getFacultyList();
      const classrooms = store.getClassrooms();
      const courses = store.getCourses();

      const conflicts = ConflictDetector.detectAllConflicts(entries, facultyList, classrooms, courses);

      const critical = conflicts.filter((c) => c.severity === 'CRITICAL');
      const warnings = conflicts.filter((c) => c.severity === 'WARNING');

      res.status(200).json({
        success: true,
        totalConflicts: conflicts.length,
        criticalCount: critical.length,
        warningCount: warnings.length,
        status: critical.length === 0 ? (warnings.length === 0 ? 'CLEAN' : 'WARNINGS') : 'CRITICAL_ISSUES',
        statusColor: critical.length === 0 ? (warnings.length === 0 ? '#16A34A' : '#F59E0B') : '#EF4444',
        critical,
        warnings,
        conflicts,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const faculty = store.getFacultyList();
      const courses = store.getCourses();
      const classrooms = store.getClassrooms();
      const departments = store.getDepartments();
      const entries = store.getTimetableEntries();
      const timetables = store.getTimetables();
      const conflicts = ConflictDetector.detectAllConflicts(entries, faculty, classrooms, courses);
      const workloadReport = WorkloadOptimizer.calculateWorkload(faculty, entries);

      const activeTimetable = timetables[0] || null;

      res.status(200).json({
        success: true,
        stats: {
          totalFaculty: faculty.length,
          totalDepartments: departments.length,
          totalCourses: courses.length,
          totalClassrooms: classrooms.length,
          totalScheduledClasses: entries.length,
          totalConflicts: conflicts.length,
          criticalConflicts: conflicts.filter((c) => c.severity === 'CRITICAL').length,
          qualityScore: activeTimetable?.qualityScore || 95,
          workloadDistribution: {
            overloaded: workloadReport.overloadedCount,
            balanced: workloadReport.balancedCount,
            underutilized: workloadReport.underutilizedCount,
            averageHours: workloadReport.averageWeeklyHours,
            institutionalBalanceScore: workloadReport.overallBalanceScore,
          },
          currentSemester: activeTimetable?.semester || 'Fall 2026',
          status: activeTimetable?.status || 'published',
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
