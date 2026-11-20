export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  facultyId?: string;
  department?: string;
  studentSection?: string;
  avatarUrl?: string;
  facultyDetails?: Faculty;
}

export interface Faculty {
  facultyId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  maxWeeklyHours: number;
  currentWeeklyHours: number;
  preferredTimes: string[];
  unavailableDays: string[];
  unavailableSlots: {
    day: string;
    startTime: string;
    endTime: string;
    reason?: string;
  }[];
  phone?: string;
  office?: string;
  avatarUrl?: string;
  assignedClassesCount?: number;
}

export type RoomType = 'Lecture Room' | 'Computer Lab' | 'Science Lab' | 'Seminar Hall';

export interface Course {
  code: string;
  name: string;
  department: string;
  semester: string;
  credits: number;
  weeklySessions: number;
  durationMinutes: number;
  requiredRoomType: RoomType;
  isLab: boolean;
  assignedFacultyId?: string;
  assignedFacultyName?: string;
  sections: string[];
}

export interface Classroom {
  roomNumber: string;
  building: string;
  capacity: number;
  type: RoomType;
  features: string[];
  isAvailable: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableEntry {
  id?: string;
  timetableId?: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
  roomType: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  semester: string;
  section: string;
  department: string;
  color: string;
  status?: 'scheduled' | 'rescheduled' | 'cancelled';
}

export interface TimetableMetadata {
  id: string;
  title: string;
  semester: string;
  academicYear: string;
  department: string;
  status: 'draft' | 'generated' | 'published';
  qualityScore: number;
  metrics?: {
    hardConstraintsViolated: number;
    softConstraintsSatisfaction: number;
    workloadBalanceScore: number;
    historicalAlignmentScore: number;
  };
  publishedAt?: string;
  publishedBy?: string;
}

export interface DetectedConflict {
  id: string;
  severity: 'CRITICAL' | 'WARNING';
  type: string;
  title: string;
  description: string;
  suggestedCorrection: string;
  day: string;
  startTime: string;
  endTime: string;
  facultyId?: string;
  facultyName?: string;
  roomNumber?: string;
  courseCode?: string;
  section?: string;
}

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
  utilizationRate: number;
  status: 'OVERLOADED' | 'BALANCED' | 'UNDERUTILIZED';
  statusColor: string;
  dayDistribution: Record<string, number>;
  optimizationNotes: string[];
}

export interface WorkloadReport {
  totalFaculty: number;
  totalWeeklyTeachingHours: number;
  averageWeeklyHours: number;
  overloadedCount: number;
  balancedCount: number;
  underutilizedCount: number;
  overallBalanceScore: number;
  facultySummaries: FacultyWorkloadSummary[];
  systemRecommendations: string[];
}

export interface NotificationItem {
  id: string;
  recipientFacultyId?: string;
  title: string;
  message: string;
  type: 'TIMETABLE_PUBLISHED' | 'TIMETABLE_UPDATED' | 'CLASS_RESCHEDULED' | 'ROOM_CHANGED' | 'CLASS_CANCELLED' | 'GENERAL_ANNOUNCEMENT';
  relatedCourseCode?: string;
  relatedRoom?: string;
  relatedDay?: string;
  relatedTime?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TimetableHistoryRecord {
  id: string;
  timetableId: string;
  action: string;
  modifiedBy: string;
  modificationDate: string;
  summary: string;
  previousSchedule?: any;
  newSchedule?: any;
  affectedFacultyIds: string[];
  reason: string;
}

export interface GenerationSimulationResult {
  semester: string;
  academicYear: string;
  generatedEntries: TimetableEntry[];
  qualityScore: number;
  metrics: {
    hardConstraintsSatisfied: number;
    softConstraintsSatisfaction: number;
    workloadBalanceScore: number;
    historicalAlignmentScore: number;
    totalClassesScheduled: number;
    totalUniqueCourses: number;
    conflictsDetectedCount: number;
  };
  historicalInsightsApplied: {
    patternMatchesCount: number;
    roomContinuityScore: number;
    timePreferenceScore: number;
    summary: string[];
  };
  facultyWorkloadImpact: {
    facultyId: string;
    facultyName: string;
    assignedHours: number;
    maxHours: number;
    status: 'OVERLOADED' | 'BALANCED' | 'UNDERUTILIZED';
  }[];
  unassignedRequirements: string[];
  recommendations: string[];
}
