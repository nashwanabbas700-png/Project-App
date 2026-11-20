import {
  SEED_DEPARTMENTS,
  SEED_FACULTY,
  SEED_COURSES,
  SEED_CLASSROOMS,
  SEED_HISTORICAL_RECORDS,
  SEED_NOTIFICATIONS,
  SEED_TIMETABLE_ENTRIES,
  SEED_TIMETABLE_MAIN,
  getHashedPassword,
} from '../seed/seedData.js';
import { ConflictDetector } from '../algorithms/conflictDetector.js';

export interface DataStoreState {
  users: any[];
  departments: any[];
  faculty: any[];
  courses: any[];
  classrooms: any[];
  timetables: any[];
  timetableEntries: any[];
  historicalRecords: any[];
  notifications: any[];
  timetableHistory: any[];
  scenarios: any[];
  leaveRequests: any[];
}

class InstitutionalDataStore {
  private state: DataStoreState;

  constructor() {
    this.state = this.getInitialState();
  }

  public getInitialState(): DataStoreState {
    const adminPasswordHash = getHashedPassword('Admin123!');
    const facultyPasswordHash = getHashedPassword('Faculty123!');

    const users = [
      {
        id: 'user-admin',
        email: 'admin@smartsched.edu',
        password: adminPasswordHash,
        role: 'admin',
        name: 'University Registrar Admin',
        department: 'Academic Administration',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      },
      {
        id: 'user-faculty',
        email: 'faculty@smartsched.edu',
        password: facultyPasswordHash,
        role: 'faculty',
        name: 'Dr. Sarah Jenkins',
        facultyId: 'CS-FAC-01',
        department: 'Computer Science',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      },
      {
        id: 'user-student',
        email: 'student@edunova.edu',
        password: getHashedPassword('Student123!'),
        role: 'student',
        name: 'Alex Rivera (CS-A)',
        department: 'Computer Science',
        studentSection: 'CS-A',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    ];

    return {
      users,
      departments: [...SEED_DEPARTMENTS],
      faculty: JSON.parse(JSON.stringify(SEED_FACULTY)),
      courses: JSON.parse(JSON.stringify(SEED_COURSES)),
      classrooms: JSON.parse(JSON.stringify(SEED_CLASSROOMS)),
      timetables: [JSON.parse(JSON.stringify(SEED_TIMETABLE_MAIN))],
      timetableEntries: JSON.parse(JSON.stringify(SEED_TIMETABLE_ENTRIES)),
      historicalRecords: JSON.parse(JSON.stringify(SEED_HISTORICAL_RECORDS)),
      notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
      timetableHistory: [
        {
          id: 'hist-init',
          timetableId: 'tt-fall-2026-main',
          action: 'PUBLISHED',
          modifiedBy: 'admin@smartsched.edu',
          modificationDate: new Date(),
          summary: 'Fall 2026 Institutional Master Timetable published with verified zero-conflict schedule.',
          affectedFacultyIds: ['CS-FAC-01', 'CS-FAC-02', 'CS-FAC-03', 'EE-FAC-01', 'BBA-FAC-01'],
          reason: 'Initial semester schedule publication following smart optimization.',
        },
      ],
      scenarios: [
        {
          id: 'scen-balanced-5d',
          name: 'Scenario A: 5-Day Workload-Balanced (Active)',
          description: 'Optimized 5-day spread with zero hard conflicts and 100% room capacity compliance.',
          semester: 'Fall 2026',
          qualityScore: 94,
          hardConflicts: 0,
          isDraft: false,
          isPublished: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'scen-compact-4d',
          name: 'Scenario B: 4-Day Research-Compressed Draft',
          description: 'Compacts curriculum sessions into Mon-Thu, reserving Fridays for faculty departmental research.',
          semester: 'Fall 2026',
          qualityScore: 89,
          hardConflicts: 0,
          isDraft: true,
          isPublished: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'scen-morning-heavy',
          name: 'Scenario C: Morning-Shift Prime Slots',
          description: 'Prioritizes 08:30–13:30 slots to minimize afternoon room air conditioning and utility load.',
          semester: 'Fall 2026',
          qualityScore: 91,
          hardConflicts: 0,
          isDraft: true,
          isPublished: false,
          createdAt: new Date().toISOString(),
        },
      ],
      leaveRequests: [
        {
          id: 'leave-101',
          facultyId: 'CS-FAC-01',
          facultyName: 'Dr. Sarah Jenkins',
          department: 'Computer Science',
          date: '2026-11-20',
          day: 'Thursday',
          reason: 'IEEE Academic Conference Presentation',
          status: 'PENDING',
          affectedClasses: [
            {
              courseCode: 'CS-101',
              courseName: 'Introduction to Programming',
              time: '08:30 - 10:00',
              classroom: 'LAB-CS1',
            },
          ],
          recommendedSubstitute: {
            facultyId: 'CS-FAC-04',
            name: 'Dr. Michael Ross',
            reason: 'Zero Thursday morning commitments, teaches same discipline, current load 10.5h/16h.',
          },
        },
      ],
    };
  }

  public resetToDefault() {
    this.state = this.getInitialState();
  }

  // Users
  public getUsers() {
    return this.state.users;
  }
  public findUserByEmail(email: string) {
    const normalized = email.toLowerCase().replace('@edunova.edu', '@smartsched.edu');
    return this.state.users.find(
      (u) => u.email.toLowerCase() === normalized || u.email.toLowerCase() === email.toLowerCase()
    );
  }
  public addUser(user: any) {
    this.state.users.push(user);
    return user;
  }

  // Faculty
  public getFacultyList() {
    return this.state.faculty;
  }
  public findFacultyById(id: string) {
    return this.state.faculty.find((f) => f.facultyId === id);
  }
  public addFaculty(facultyData: any) {
    const existing = this.findFacultyById(facultyData.facultyId);
    if (existing) {
      throw new Error(`Faculty with ID ${facultyData.facultyId} already exists`);
    }
    this.state.faculty.push(facultyData);
    return facultyData;
  }
  public updateFaculty(id: string, updates: any) {
    const idx = this.state.faculty.findIndex((f) => f.facultyId === id);
    if (idx === -1) throw new Error('Faculty not found');
    this.state.faculty[idx] = { ...this.state.faculty[idx], ...updates };
    return this.state.faculty[idx];
  }
  public deleteFaculty(id: string) {
    this.state.faculty = this.state.faculty.filter((f) => f.facultyId !== id);
    return true;
  }

  // Departments
  public getDepartments() {
    return this.state.departments;
  }

  // Courses
  public getCourses() {
    return this.state.courses;
  }
  public findCourseByCode(code: string) {
    return this.state.courses.find((c) => c.code === code);
  }
  public addCourse(courseData: any) {
    const existing = this.findCourseByCode(courseData.code);
    if (existing) throw new Error(`Course with code ${courseData.code} already exists`);
    this.state.courses.push(courseData);
    return courseData;
  }
  public updateCourse(code: string, updates: any) {
    const idx = this.state.courses.findIndex((c) => c.code === code);
    if (idx === -1) throw new Error('Course not found');
    this.state.courses[idx] = { ...this.state.courses[idx], ...updates };
    return this.state.courses[idx];
  }
  public deleteCourse(code: string) {
    this.state.courses = this.state.courses.filter((c) => c.code !== code);
    return true;
  }

  // Classrooms
  public getClassrooms() {
    return this.state.classrooms;
  }
  public findClassroomByNumber(roomNumber: string) {
    return this.state.classrooms.find((r) => r.roomNumber === roomNumber);
  }
  public addClassroom(roomData: any) {
    const existing = this.findClassroomByNumber(roomData.roomNumber);
    if (existing) throw new Error(`Classroom ${roomData.roomNumber} already exists`);
    this.state.classrooms.push(roomData);
    return roomData;
  }
  public updateClassroom(roomNumber: string, updates: any) {
    const idx = this.state.classrooms.findIndex((r) => r.roomNumber === roomNumber);
    if (idx === -1) throw new Error('Classroom not found');
    this.state.classrooms[idx] = { ...this.state.classrooms[idx], ...updates };
    return this.state.classrooms[idx];
  }
  public deleteClassroom(roomNumber: string) {
    this.state.classrooms = this.state.classrooms.filter((r) => r.roomNumber !== roomNumber);
    return true;
  }

  // Timetables
  public getTimetables() {
    return this.state.timetables;
  }
  public getTimetableById(id: string) {
    return this.state.timetables.find((t) => t.id === id);
  }
  public createTimetable(data: any) {
    this.state.timetables.push(data);
    return data;
  }
  public updateTimetable(id: string, updates: any) {
    const idx = this.state.timetables.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Timetable not found');
    this.state.timetables[idx] = { ...this.state.timetables[idx], ...updates };
    return this.state.timetables[idx];
  }

  // Timetable Entries
  public getTimetableEntries(filter?: {
    timetableId?: string;
    facultyId?: string;
    department?: string;
    semester?: string;
    day?: string;
  }) {
    return this.state.timetableEntries.filter((entry) => {
      if (filter?.timetableId && entry.timetableId !== filter.timetableId) return false;
      if (filter?.facultyId && entry.facultyId !== filter.facultyId) return false;
      if (filter?.department && filter.department !== 'All' && entry.department !== filter.department) return false;
      if (filter?.semester && entry.semester !== filter.semester) return false;
      if (filter?.day && entry.day !== filter.day) return false;
      return true;
    });
  }

  public addTimetableEntry(entry: any) {
    const newEntry = {
      id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...entry,
    };
    this.state.timetableEntries.push(newEntry);
    return newEntry;
  }

  public updateTimetableEntry(idOrIndex: string, updates: any) {
    const idx = this.state.timetableEntries.findIndex(
      (e) => e.id === idOrIndex || `${e.courseCode}_${e.day}_${e.startTime}` === idOrIndex
    );
    if (idx === -1) throw new Error('Timetable entry not found');
    this.state.timetableEntries[idx] = { ...this.state.timetableEntries[idx], ...updates };
    return this.state.timetableEntries[idx];
  }

  public deleteTimetableEntry(idOrIndex: string) {
    this.state.timetableEntries = this.state.timetableEntries.filter(
      (e) => e.id !== idOrIndex && `${e.courseCode}_${e.day}_${e.startTime}` !== idOrIndex
    );
    return true;
  }

  public replaceTimetableEntries(timetableId: string, newEntries: any[]) {
    // Remove existing entries for this timetable
    this.state.timetableEntries = this.state.timetableEntries.filter((e) => e.timetableId !== timetableId);
    // Add new ones
    const mapped = newEntries.map((e, idx) => ({
      id: `entry-${timetableId}-${idx + 1}`,
      timetableId,
      ...e,
    }));
    this.state.timetableEntries.push(...mapped);
    return mapped;
  }

  // Historical Records
  public getHistoricalRecords() {
    return this.state.historicalRecords;
  }

  // Notifications
  public getNotifications(facultyId?: string) {
    return this.state.notifications
      .filter((n) => {
        if (!facultyId) return true;
        return !n.recipientFacultyId || n.recipientFacultyId === facultyId;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(notification: any) {
    const item = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
      isRead: false,
      ...notification,
    };
    this.state.notifications.unshift(item);
    return item;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    return notif;
  }

  public markAllNotificationsAsRead(facultyId?: string) {
    this.state.notifications.forEach((n) => {
      if (!facultyId || !n.recipientFacultyId || n.recipientFacultyId === facultyId) {
        n.isRead = true;
      }
    });
    return true;
  }

  // History Audit Trail
  public getTimetableHistory(timetableId?: string) {
    return this.state.timetableHistory
      .filter((h) => !timetableId || h.timetableId === timetableId)
      .sort((a, b) => new Date(b.modificationDate).getTime() - new Date(a.modificationDate).getTime());
  }

  public addTimetableHistory(record: any) {
    const item = {
      id: `hist-${Date.now()}`,
      modificationDate: new Date(),
      ...record,
    };
    this.state.timetableHistory.unshift(item);
    return item;
  }

  // Multi-Scenario Draft Sandbox
  public getScenarios() {
    return this.state.scenarios;
  }

  public addScenario(scenarioData: any) {
    const item = {
      id: `scen-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDraft: true,
      isPublished: false,
      ...scenarioData,
    };
    this.state.scenarios.push(item);
    return item;
  }

  public promoteScenario(id: string) {
    const target = this.state.scenarios.find((s) => s.id === id);
    if (!target) throw new Error(`Scenario ${id} not found.`);
    this.state.scenarios.forEach((s) => {
      s.isPublished = s.id === id;
      s.isDraft = s.id !== id;
    });
    return target;
  }

  // Faculty Leave & Substitute Engine
  public getLeaveRequests() {
    return this.state.leaveRequests;
  }

  public addLeaveRequest(data: any) {
    const item = {
      id: `leave-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      ...data,
    };
    this.state.leaveRequests.unshift(item);
    return item;
  }

  public updateLeaveRequest(id: string, updates: any) {
    const item = this.state.leaveRequests.find((l) => l.id === id);
    if (!item) throw new Error(`Leave request ${id} not found.`);
    Object.assign(item, updates);
    return item;
  }

  // Substitute Recommendation Intelligence
  public findSubstituteCandidates(courseCode: string, day: string, startTime: string, endTime: string) {
    const course = this.findCourseByCode(courseCode);
    const department = course?.department;

    // Faculty in same department
    const deptFaculty = this.state.faculty.filter(
      (f) => !department || f.department === department
    );

    // Candidates without overlapping commitments on that day and time
    const candidates = deptFaculty.map((fac) => {
      const dayClasses = this.state.timetableEntries.filter(
        (e) => e.facultyId === fac.facultyId && e.day === day
      );

      // Check time overlap
      const hasClash = dayClasses.some((cls) => {
        return !(endTime <= cls.startTime || startTime >= cls.endTime);
      });

      // Calculate current assigned teaching load
      let totalMinutes = 0;
      this.state.timetableEntries
        .filter((e) => e.facultyId === fac.facultyId)
        .forEach((e) => {
          const [sh, sm] = e.startTime.split(':').map(Number);
          const [eh, em] = e.endTime.split(':').map(Number);
          totalMinutes += eh * 60 + em - (sh * 60 + sm);
        });
      const currentHours = (totalMinutes / 60).toFixed(1);
      const remainingHours = Math.max(0, fac.maxWeeklyHours - parseFloat(currentHours));

      return {
        facultyId: fac.facultyId,
        name: fac.name,
        email: fac.email,
        department: fac.department,
        designation: fac.designation,
        hasClash,
        currentHours: `${currentHours}h`,
        maxWeeklyHours: `${fac.maxWeeklyHours}h`,
        remainingCapacity: `${remainingHours.toFixed(1)}h`,
        matchScore: hasClash ? 0 : (remainingHours > 3 ? 95 : 80),
        reason: hasClash
          ? `Clash: already teaching on ${day} during ${startTime}–${endTime}`
          : `Available with ${remainingHours.toFixed(1)}h remaining teaching capacity.`,
      };
    });

    return candidates.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const store = new InstitutionalDataStore();
