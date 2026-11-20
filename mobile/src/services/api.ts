import { API_BASE_URL } from '../constants/config';
import { AuthStorage } from './authStorage';
import {
  User,
  Faculty,
  Course,
  Classroom,
  TimetableEntry,
  TimetableMetadata,
  DetectedConflict,
  WorkloadReport,
  NotificationItem,
  TimetableHistoryRecord,
  GenerationSimulationResult,
} from '../types';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await AuthStorage.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (error: any) {
      console.warn(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
      throw error;
    }
  }

  // --- Auth Endpoints ---
  async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return this.request<{ success: boolean; token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async ssoLogin(role: 'admin' | 'faculty' = 'faculty') {
    return this.request<{ success: boolean; token: string; user: User; isDemoSSO: boolean; message: string }>(
      '/auth/sso-login',
      {
        method: 'POST',
        body: JSON.stringify({ role }),
      }
    );
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string; demoHint: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // --- Faculty Endpoints ---
  async getFacultyList(params?: { department?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; count: number; faculty: Faculty[] }>(
      `/faculty${query ? `?${query}` : ''}`
    );
  }

  async getFacultyById(id: string) {
    return this.request<{ success: boolean; faculty: Faculty & { assignedCourses: Course[]; currentSchedule: TimetableEntry[] } }>(
      `/faculty/${id}`
    );
  }

  async createFaculty(facultyData: Partial<Faculty>) {
    return this.request<{ success: boolean; faculty: Faculty; message: string }>('/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData),
    });
  }

  async updateFaculty(id: string, updates: Partial<Faculty>) {
    return this.request<{ success: boolean; faculty: Faculty; message: string }>(`/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFaculty(id: string) {
    return this.request<{ success: boolean; message: string }>(`/faculty/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Course Endpoints ---
  async getCourses(params?: { department?: string; semester?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; count: number; courses: Course[] }>(
      `/courses${query ? `?${query}` : ''}`
    );
  }

  async createCourse(courseData: Partial<Course>) {
    return this.request<{ success: boolean; course: Course; message: string }>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(code: string, updates: Partial<Course>) {
    return this.request<{ success: boolean; course: Course; message: string }>(`/courses/${code}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCourse(code: string) {
    return this.request<{ success: boolean; message: string }>(`/courses/${code}`, {
      method: 'DELETE',
    });
  }

  // --- Classroom Endpoints ---
  async getClassrooms(params?: { type?: string; minCapacity?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; count: number; classrooms: Classroom[] }>(
      `/classrooms${query ? `?${query}` : ''}`
    );
  }

  async createClassroom(roomData: Partial<Classroom>) {
    return this.request<{ success: boolean; classroom: Classroom; message: string }>('/classrooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async updateClassroom(roomNumber: string, updates: Partial<Classroom>) {
    return this.request<{ success: boolean; classroom: Classroom; message: string }>(`/classrooms/${roomNumber}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteClassroom(roomNumber: string) {
    return this.request<{ success: boolean; message: string }>(`/classrooms/${roomNumber}`, {
      method: 'DELETE',
    });
  }

  // --- Timetable Endpoints ---
  async getMasterTimetable(params?: { semester?: string; department?: string; facultyId?: string; section?: string; day?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{
      success: boolean;
      timetable: TimetableMetadata;
      entriesCount: number;
      entries: TimetableEntry[];
      conflictsCount: number;
      conflicts: DetectedConflict[];
    }>(`/timetable/master${query ? `?${query}` : ''}`);
  }

  async getFacultyPersonalTimetable(facultyId?: string) {
    return this.request<{
      success: boolean;
      faculty: Faculty;
      totalClasses: number;
      entries: TimetableEntry[];
      groupedByDay: Record<string, TimetableEntry[]>;
    }>(`/timetable/faculty${facultyId ? `/${facultyId}` : ''}`);
  }

  async addTimetableEntry(entry: Partial<TimetableEntry>) {
    return this.request<{ success: boolean; entry: TimetableEntry; message: string; warnings?: any[] }>(
      '/timetable/entries',
      {
        method: 'POST',
        body: JSON.stringify(entry),
      }
    );
  }

  async updateTimetableEntry(id: string, updates: Partial<TimetableEntry>, reason?: string) {
    return this.request<{ success: boolean; entry: TimetableEntry; message: string }>(`/timetable/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, reason }),
    });
  }

  async deleteTimetableEntry(id: string, reason?: string) {
    return this.request<{ success: boolean; message: string }>(`/timetable/entries/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async publishTimetable(timetableId: string = 'tt-fall-2026-main') {
    return this.request<{ success: boolean; message: string; qualityScore: number; affectedFacultyCount: number }>(
      '/timetable/publish',
      {
        method: 'POST',
        body: JSON.stringify({ timetableId }),
      }
    );
  }

  async getTimetableHistory(timetableId?: string) {
    return this.request<{ success: boolean; count: number; history: TimetableHistoryRecord[] }>(
      `/timetable/history${timetableId ? `?timetableId=${timetableId}` : ''}`
    );
  }

  // --- Intelligent Scheduling Generator ---
  async simulateIntelligentSchedule(params: {
    semester: string;
    academicYear?: string;
    department?: string;
    preferHistoricalPatterns?: boolean;
    balanceWorkload?: boolean;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      result: GenerationSimulationResult;
    }>('/generate/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async applyGeneratedSchedule(payload: {
    timetableId?: string;
    semester: string;
    generatedEntries: TimetableEntry[];
    qualityScore: number;
    metrics?: any;
  }) {
    return this.request<{ success: boolean; message: string; entriesCount: number; affectedFacultyCount: number }>(
      '/generate/apply',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async getHistoricalInsights() {
    return this.request<{
      success: boolean;
      totalRecords: number;
      semestersAnalyzed: string[];
      averageSatisfactionRating: number;
      historicalZeroConflictRate: string;
      records: any[];
    }>('/generate/historical-insights');
  }

  // --- Analytics Endpoints ---
  async getWorkloadAnalytics() {
    return this.request<{ success: boolean; report: WorkloadReport }>('/analytics/workload');
  }

  async getConflictReport() {
    return this.request<{
      success: boolean;
      totalConflicts: number;
      criticalCount: number;
      warningCount: number;
      status: string;
      statusColor: string;
      critical: DetectedConflict[];
      warnings: DetectedConflict[];
      conflicts: DetectedConflict[];
    }>('/analytics/conflicts');
  }

  async getDashboardStats() {
    return this.request<{
      success: boolean;
      stats: {
        totalFaculty: number;
        totalDepartments: number;
        totalCourses: number;
        totalClassrooms: number;
        totalScheduledClasses: number;
        totalConflicts: number;
        criticalConflicts: number;
        qualityScore: number;
        workloadDistribution: {
          overloaded: number;
          balanced: number;
          underutilized: number;
          averageHours: number;
          institutionalBalanceScore: number;
        };
        currentSemester: string;
        status: string;
      };
    }>('/analytics/dashboard');
  }

  // --- Notifications Endpoints ---
  async getNotifications(facultyId?: string) {
    return this.request<{
      success: boolean;
      total: number;
      unreadCount: number;
      notifications: NotificationItem[];
    }>(`/notifications${facultyId ? `?facultyId=${facultyId}` : ''}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request<{ success: boolean; notification: NotificationItem }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(facultyId?: string) {
    return this.request<{ success: boolean; message: string }>(
      `/notifications/mark-all-read${facultyId ? `?facultyId=${facultyId}` : ''}`,
      {
        method: 'PUT',
      }
    );
  }

  // --- Student Section Portal ---
  async getStudentTimetable(params: { department?: string; semester?: string; section?: string }) {
    const query = new URLSearchParams();
    if (params.department) query.append('department', params.department);
    if (params.semester) query.append('semester', params.semester);
    if (params.section) query.append('section', params.section);
    return this.request<{
      success: boolean;
      department: string;
      semester: string;
      section: string;
      totalCourses: number;
      totalClassesPerWeek: number;
      totalWeeklyHours: string;
      entries: TimetableEntry[];
    }>(`/timetable/student?${query.toString()}`);
  }

  // --- Scenarios Sandbox ---
  async getScenarios() {
    return this.request<{ success: boolean; count: number; scenarios: any[] }>('/timetable/scenarios');
  }

  async createScenario(data: any) {
    return this.request<{ success: boolean; scenario: any }>('/timetable/scenarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async promoteScenario(id: string) {
    return this.request<{ success: boolean; message: string; promoted: any }>(`/timetable/scenarios/${id}/promote`, {
      method: 'POST',
    });
  }

  // --- Substitute Recommendation & Leaves ---
  async getSubstituteRecommendations(data: { courseCode: string; day: string; startTime: string; endTime: string }) {
    return this.request<{
      success: boolean;
      count: number;
      candidates: any[];
    }>('/timetable/substitutes/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLeaveRequests() {
    return this.request<{ success: boolean; count: number; leaves: any[] }>('/timetable/leaves');
  }

  async submitLeaveRequest(data: any) {
    return this.request<{ success: boolean; message: string; leave: any }>('/timetable/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeaveRequest(id: string, data: any) {
    return this.request<{ success: boolean; leave: any }>(`/timetable/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  getExportICSUrl(params: { facultyId?: string; section?: string; department?: string; semester?: string }) {
    const query = new URLSearchParams();
    if (params.facultyId) query.append('facultyId', params.facultyId);
    if (params.section) query.append('section', params.section);
    if (params.department) query.append('department', params.department);
    if (params.semester) query.append('semester', params.semester);
    return `${API_BASE_URL}/timetable/export/ics?${query.toString()}`;
  }

  getExportCSVUrl(params: { facultyId?: string; section?: string; department?: string; semester?: string }) {
    const query = new URLSearchParams();
    if (params.facultyId) query.append('facultyId', params.facultyId);
    if (params.section) query.append('section', params.section);
    if (params.department) query.append('department', params.department);
    if (params.semester) query.append('semester', params.semester);
    return `${API_BASE_URL}/timetable/export/csv?${query.toString()}`;
  }
}

export const api = new ApiService();
