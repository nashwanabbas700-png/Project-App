import { IFaculty } from '../models/Faculty.js';
import { ITimetableEntry } from '../models/TimetableEntry.js';
import { timeToMinutes } from './conflictDetector.js';

export interface FacultyWorkloadSummary {
  facultyId: string;
  name: string;
  department: string;
  designation: string;
  assignedCoursesCount: number;
  assignedSectionsCount: number;
  assignedCourseCodes: string[];
  totalWeeklyHours: number;
  maxWeeklyHours: number;
  utilizationRate: number; // Percentage, e.g. 85.5%
  status: 'OVERLOADED' | 'BALANCED' | 'UNDERUTILIZED';
  statusColor: string;
  dayDistribution: Record<string, number>; // hours per day
  optimizationNotes: string[];
}

export interface InstitutionalWorkloadReport {
  totalFaculty: number;
  totalWeeklyTeachingHours: number;
  averageWeeklyHours: number;
  overloadedCount: number;
  balancedCount: number;
  underutilizedCount: number;
  overallBalanceScore: number; // 0 - 100
  facultySummaries: FacultyWorkloadSummary[];
  systemRecommendations: string[];
}

export class WorkloadOptimizer {
  public static calculateWorkload(
    facultyList: any[],
    entries: any[]
  ): InstitutionalWorkloadReport {
    const facultySummaries: FacultyWorkloadSummary[] = [];

    let totalTeachingHours = 0;
    let overloadedCount = 0;
    let balancedCount = 0;
    let underutilizedCount = 0;

    facultyList.forEach((fac) => {
      const facEntries = entries.filter((e) => e.facultyId === fac.facultyId);

      const dayDistribution: Record<string, number> = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
      };

      let facTotalMinutes = 0;
      const courseCodesSet = new Set<string>();
      const sectionSet = new Set<string>();

      facEntries.forEach((entry) => {
        const dur = timeToMinutes(entry.endTime) - timeToMinutes(entry.startTime);
        facTotalMinutes += dur;
        if (dayDistribution[entry.day] !== undefined) {
          dayDistribution[entry.day] += dur / 60;
        }
        if (entry.courseCode) courseCodesSet.add(entry.courseCode);
        if (entry.section) sectionSet.add(entry.section);
      });

      const totalWeeklyHours = parseFloat((facTotalMinutes / 60).toFixed(1));
      totalTeachingHours += totalWeeklyHours;

      const maxHours = fac.maxWeeklyHours || 16;
      const utilizationRate = parseFloat(((totalWeeklyHours / maxHours) * 100).toFixed(1));

      let status: 'OVERLOADED' | 'BALANCED' | 'UNDERUTILIZED' = 'BALANCED';
      let statusColor = '#16A34A'; // Success green
      const optimizationNotes: string[] = [];

      if (utilizationRate > 100) {
        status = 'OVERLOADED';
        statusColor = '#EF4444'; // Danger red
        overloadedCount++;
        optimizationNotes.push(
          `Over institutional threshold by ${(totalWeeklyHours - maxHours).toFixed(1)} hrs. Consider redistributing 1 section.`
        );
      } else if (utilizationRate < 60 && maxHours > 0) {
        status = 'UNDERUTILIZED';
        statusColor = '#F59E0B'; // Warning amber
        underutilizedCount++;
        optimizationNotes.push(
          `Underutilized capacity (${(maxHours - totalWeeklyHours).toFixed(1)} hrs available). Suitable for additional elective or lab supervision.`
        );
      } else {
        status = 'BALANCED';
        statusColor = '#16A34A';
        balancedCount++;
        optimizationNotes.push('Optimal teaching distribution aligned with institutional guidelines.');
      }

      // Check daily spikes
      Object.entries(dayDistribution).forEach(([day, hrs]) => {
        if (hrs >= 6) {
          optimizationNotes.push(`High daily load on ${day} (${hrs} hours). May induce lecture fatigue.`);
        }
      });

      facultySummaries.push({
        facultyId: fac.facultyId,
        name: fac.name,
        department: fac.department,
        designation: fac.designation,
        assignedCoursesCount: courseCodesSet.size,
        assignedSectionsCount: sectionSet.size,
        assignedCourseCodes: Array.from(courseCodesSet),
        totalWeeklyHours,
        maxWeeklyHours: maxHours,
        utilizationRate,
        status,
        statusColor,
        dayDistribution,
        optimizationNotes,
      });
    });

    const totalFaculty = facultyList.length || 1;
    const averageWeeklyHours = parseFloat((totalTeachingHours / totalFaculty).toFixed(1));

    // Calculate institutional balance score: penalize variance and overloads
    const balancePenalty = overloadedCount * 20 + underutilizedCount * 10;
    const overallBalanceScore = Math.max(0, Math.min(100, Math.round(100 - balancePenalty / totalFaculty)));

    const systemRecommendations: string[] = [];
    if (overloadedCount > 0) {
      systemRecommendations.push(
        `Action needed: ${overloadedCount} faculty members exceed contract hours. Rebalance sections before semester finalization.`
      );
    }
    if (underutilizedCount > 0) {
      systemRecommendations.push(
        `Capacity available: ${underutilizedCount} faculty members can take additional co-teaching or seminar duties.`
      );
    }
    if (systemRecommendations.length === 0) {
      systemRecommendations.push('Faculty workload is harmoniously balanced across all university departments.');
    }

    return {
      totalFaculty,
      totalWeeklyTeachingHours: parseFloat(totalTeachingHours.toFixed(1)),
      averageWeeklyHours,
      overloadedCount,
      balancedCount,
      underutilizedCount,
      overallBalanceScore,
      facultySummaries,
      systemRecommendations,
    };
  }
}
