import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ConflictDetector } from '../algorithms/conflictDetector.js';
import { broadcastTimetableUpdate, broadcastNotification } from '../services/socketService.js';

export class TimetableController {
  public static async getMasterTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { semester = 'Fall 2026', department, facultyId, section, day } = req.query;

      const timetable = store.getTimetables().find((t) => t.semester === semester) || store.getTimetables()[0];

      const entries = store.getTimetableEntries({
        timetableId: timetable?.id,
        semester: String(semester),
        department: department ? String(department) : undefined,
        facultyId: facultyId ? String(facultyId) : undefined,
        day: day ? String(day) : undefined,
      });

      // Filter by section if requested
      const filteredEntries = section ? entries.filter((e) => e.section === section) : entries;

      // Run conflict audit on returned dataset
      const conflicts = ConflictDetector.detectAllConflicts(
        filteredEntries,
        store.getFacultyList(),
        store.getClassrooms(),
        store.getCourses()
      );

      res.status(200).json({
        success: true,
        timetable,
        entriesCount: filteredEntries.length,
        entries: filteredEntries,
        conflictsCount: conflicts.length,
        conflicts,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getFacultyPersonalTimetable(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const facultyId = req.params.facultyId || req.user?.facultyId;

      if (!facultyId) {
        res.status(400).json({ success: false, message: 'Faculty ID required.' });
        return;
      }

      const faculty = store.findFacultyById(facultyId);
      const entries = store.getTimetableEntries({ facultyId });

      // Sort by day and time
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      entries.sort((a, b) => {
        const d1 = dayOrder.indexOf(a.day);
        const d2 = dayOrder.indexOf(b.day);
        if (d1 !== d2) return d1 - d2;
        return a.startTime.localeCompare(b.startTime);
      });

      // Group by day for convenience
      const groupedByDay: Record<string, any[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
      };
      entries.forEach((e) => {
        if (!groupedByDay[e.day]) groupedByDay[e.day] = [];
        groupedByDay[e.day].push(e);
      });

      res.status(200).json({
        success: true,
        faculty,
        totalClasses: entries.length,
        entries,
        groupedByDay,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async addTimetableEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        timetableId = 'tt-fall-2026-main',
        courseCode,
        facultyId,
        roomNumber,
        day,
        startTime,
        endTime,
        semester = 'Fall 2026',
        section = 'A',
      } = req.body;

      if (!courseCode || !facultyId || !roomNumber || !day || !startTime || !endTime) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: courseCode, facultyId, roomNumber, day, startTime, endTime.',
        });
        return;
      }

      const course = store.findCourseByCode(courseCode);
      const faculty = store.findFacultyById(facultyId);
      const classroom = store.findClassroomByNumber(roomNumber);

      const newEntryCandidate = {
        timetableId,
        courseCode,
        courseName: course?.name || courseCode,
        facultyId,
        facultyName: faculty?.name || facultyId,
        roomNumber,
        roomType: classroom?.type || 'Lecture Room',
        day,
        startTime,
        endTime,
        semester,
        section,
        department: course?.department || 'Computer Science',
        color: '#2563EB',
        status: 'scheduled',
      };

      // Conflict validation before insertion
      const existingEntries = store.getTimetableEntries({ timetableId });
      const testSet = [...existingEntries, newEntryCandidate];
      const conflicts = ConflictDetector.detectAllConflicts(
        testSet,
        store.getFacultyList(),
        store.getClassrooms(),
        store.getCourses()
      );

      const criticalConflicts = conflicts.filter((c) => c.severity === 'CRITICAL');
      if (criticalConflicts.length > 0) {
        res.status(409).json({
          success: false,
          message: `Cannot schedule: ${criticalConflicts[0].description}`,
          conflicts: criticalConflicts,
        });
        return;
      }

      const createdEntry = store.addTimetableEntry(newEntryCandidate);

      // Audit trail & Notification
      store.addTimetableHistory({
        timetableId,
        action: 'ENTRY_ADDED',
        modifiedBy: req.user?.email || 'admin@smartsched.edu',
        summary: `Added ${courseCode} (${section}) on ${day} ${startTime}-${endTime} in Room ${roomNumber}.`,
        newSchedule: createdEntry,
        affectedFacultyIds: [facultyId],
        reason: 'Manual timetable schedule insertion.',
      });

      const notification = store.addNotification({
        recipientFacultyId: facultyId,
        title: `New Timetable Assignment: ${courseCode}`,
        message: `You have been scheduled for ${courseCode} (${section}) on ${day} at ${startTime}-${endTime} in Room ${roomNumber}.`,
        type: 'TIMETABLE_UPDATED',
        relatedCourseCode: courseCode,
        relatedRoom: roomNumber,
        relatedDay: day,
        relatedTime: `${startTime} - ${endTime}`,
      });

      broadcastNotification(facultyId, notification);
      broadcastTimetableUpdate({
        timetableId,
        action: 'ENTRY_ADDED',
        affectedFacultyIds: [facultyId],
        message: `New class ${courseCode} added to schedule.`,
        data: createdEntry,
      });

      res.status(201).json({
        success: true,
        message: 'Timetable entry added successfully.',
        entry: createdEntry,
        warnings: conflicts.filter((c) => c.severity === 'WARNING'),
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async updateTimetableEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { reason = 'Administrative timetable adjustment' } = req.body;

      const existingEntries = store.getTimetableEntries();
      const current = existingEntries.find((e) => e.id === id);

      if (!current) {
        res.status(404).json({ success: false, message: 'Timetable entry not found.' });
        return;
      }

      const updatedCandidate = { ...current, ...updates };

      // Validate conflicts
      const testList = existingEntries.map((e) => (e.id === id ? updatedCandidate : e));
      const conflicts = ConflictDetector.detectAllConflicts(
        testList,
        store.getFacultyList(),
        store.getClassrooms(),
        store.getCourses()
      );

      const criticalConflicts = conflicts.filter((c) => c.severity === 'CRITICAL');
      if (criticalConflicts.length > 0) {
        res.status(409).json({
          success: false,
          message: `Cannot update: ${criticalConflicts[0].description}`,
          conflicts: criticalConflicts,
        });
        return;
      }

      const updated = store.updateTimetableEntry(id, updates);

      const affected = [current.facultyId];
      if (updates.facultyId && updates.facultyId !== current.facultyId) {
        affected.push(updates.facultyId);
      }

      // History & Notifications
      store.addTimetableHistory({
        timetableId: current.timetableId,
        action: 'ENTRY_MODIFIED',
        modifiedBy: req.user?.email || 'admin@smartsched.edu',
        summary: `Adjusted ${current.courseCode}: Day ${updated.day}, Time ${updated.startTime}-${updated.endTime}, Room ${updated.roomNumber}.`,
        previousSchedule: current,
        newSchedule: updated,
        affectedFacultyIds: affected,
        reason,
      });

      affected.forEach((facId) => {
        const notif = store.addNotification({
          recipientFacultyId: facId,
          title: `Timetable Adjusted: ${updated.courseCode}`,
          message: `Your class for ${updated.courseCode} has been moved to ${updated.day} ${updated.startTime}-${updated.endTime} (Room ${updated.roomNumber}). Reason: ${reason}`,
          type: updates.roomNumber !== current.roomNumber ? 'ROOM_CHANGED' : 'CLASS_RESCHEDULED',
          relatedCourseCode: updated.courseCode,
          relatedRoom: updated.roomNumber,
          relatedDay: updated.day,
          relatedTime: `${updated.startTime} - ${updated.endTime}`,
        });
        broadcastNotification(facId, notif);
      });

      broadcastTimetableUpdate({
        timetableId: current.timetableId,
        action: 'ENTRY_MODIFIED',
        affectedFacultyIds: affected,
        message: `Class ${updated.courseCode} updated.`,
        data: updated,
      });

      res.status(200).json({
        success: true,
        message: 'Timetable entry updated successfully.',
        entry: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async deleteTimetableEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason = 'Course session cancelled by administration' } = req.body;

      const current = store.getTimetableEntries().find((e) => e.id === id);
      if (!current) {
        res.status(404).json({ success: false, message: 'Timetable entry not found.' });
        return;
      }

      store.deleteTimetableEntry(id);

      // Audit trail & Notification
      store.addTimetableHistory({
        timetableId: current.timetableId,
        action: 'ENTRY_DELETED',
        modifiedBy: req.user?.email || 'admin@smartsched.edu',
        summary: `Cancelled session for ${current.courseCode} on ${current.day} ${current.startTime}.`,
        previousSchedule: current,
        affectedFacultyIds: [current.facultyId],
        reason,
      });

      const notif = store.addNotification({
        recipientFacultyId: current.facultyId,
        title: `Class Session Cancelled: ${current.courseCode}`,
        message: `The session on ${current.day} ${current.startTime}-${current.endTime} in Room ${current.roomNumber} has been removed. Reason: ${reason}`,
        type: 'CLASS_CANCELLED',
        relatedCourseCode: current.courseCode,
      });

      broadcastNotification(current.facultyId, notif);
      broadcastTimetableUpdate({
        timetableId: current.timetableId,
        action: 'ENTRY_DELETED',
        affectedFacultyIds: [current.facultyId],
        message: `Class session for ${current.courseCode} cancelled.`,
      });

      res.status(200).json({ success: true, message: 'Timetable entry deleted successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async publishTimetable(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { timetableId = 'tt-fall-2026-main' } = req.body;

      const entries = store.getTimetableEntries({ timetableId });
      const conflicts = ConflictDetector.detectAllConflicts(
        entries,
        store.getFacultyList(),
        store.getClassrooms(),
        store.getCourses()
      );

      const critical = conflicts.filter((c) => c.severity === 'CRITICAL');
      if (critical.length > 0) {
        res.status(400).json({
          success: false,
          message: `Cannot publish timetable with ${critical.length} critical conflicts. Please resolve them first.`,
          conflicts: critical,
        });
        return;
      }

      const qualityScore = Math.max(90, 100 - conflicts.length * 3);

      store.updateTimetable(timetableId, {
        status: 'published',
        qualityScore,
        publishedAt: new Date(),
        publishedBy: req.user?.email || 'admin@smartsched.edu',
      });

      // Collect all affected faculty
      const uniqueFacultyIds = Array.from(new Set(entries.map((e) => e.facultyId)));

      store.addTimetableHistory({
        timetableId,
        action: 'PUBLISHED',
        modifiedBy: req.user?.email || 'admin@smartsched.edu',
        summary: `Timetable published with quality score of ${qualityScore}%.`,
        affectedFacultyIds: uniqueFacultyIds,
        reason: 'Official semester timetable publication.',
      });

      // Broadcast notifications
      uniqueFacultyIds.forEach((facId) => {
        const notif = store.addNotification({
          recipientFacultyId: facId,
          title: `Semester Timetable Published!`,
          message: `The institutional timetable has been officially finalized and published. Your schedule is live.`,
          type: 'TIMETABLE_PUBLISHED',
        });
        broadcastNotification(facId, notif);
      });

      broadcastTimetableUpdate({
        timetableId,
        action: 'PUBLISHED',
        affectedFacultyIds: uniqueFacultyIds,
        message: 'The institutional timetable has been officially published.',
      });

      res.status(200).json({
        success: true,
        message: 'Timetable published successfully to all faculty members.',
        qualityScore,
        affectedFacultyCount: uniqueFacultyIds.length,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { timetableId } = req.query;
      const history = store.getTimetableHistory(timetableId ? String(timetableId) : undefined);
      res.status(200).json({ success: true, count: history.length, history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Student Section Portal
  public static async getStudentTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { department = 'Computer Science', semester = 'Fall 2026', section = 'CS-A' } = req.query;

      const entries = store.getTimetableEntries({
        semester: String(semester),
        department: String(department),
      }).filter((e) => !section || e.section === section);

      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      entries.sort((a, b) => {
        if (a.day !== b.day) return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        return a.startTime.localeCompare(b.startTime);
      });

      // Calculate total credits and contact hours
      const uniqueCodes = Array.from(new Set(entries.map((e) => e.courseCode)));
      let totalMinutes = 0;
      entries.forEach((e) => {
        const [sh, sm] = e.startTime.split(':').map(Number);
        const [eh, em] = e.endTime.split(':').map(Number);
        totalMinutes += eh * 60 + em - (sh * 60 + sm);
      });

      res.status(200).json({
        success: true,
        department,
        semester,
        section,
        totalCourses: uniqueCodes.length,
        totalClassesPerWeek: entries.length,
        totalWeeklyHours: (totalMinutes / 60).toFixed(1),
        entries,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Export Calendar Feed (.ics)
  public static async exportCalendarICS(req: Request, res: Response): Promise<void> {
    try {
      const { facultyId, section, department, semester = 'Fall 2026' } = req.query;

      let entries = store.getTimetableEntries({
        semester: String(semester),
        facultyId: facultyId ? String(facultyId) : undefined,
        department: department ? String(department) : undefined,
      });

      if (section) {
        entries = entries.filter((e) => e.section === section);
      }

      const dayToIcal: { [k: string]: string } = {
        Monday: 'MO',
        Tuesday: 'TU',
        Wednesday: 'WE',
        Thursday: 'TH',
        Friday: 'FR',
        Saturday: 'SA',
      };

      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//EduNova//City University SmartSched//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:EduNova - ${facultyId || section || 'Academic Schedule'}`,
      ];

      entries.forEach((e) => {
        const byDay = dayToIcal[e.day] || 'MO';
        const startClean = e.startTime.replace(':', '') + '00';
        const endClean = e.endTime.replace(':', '') + '00';
        const uid = `edunova-${e.id || Math.random().toString(36).substring(7)}@cityuni.edu`;

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `SUMMARY:${e.courseCode} - ${e.courseName} (${e.section})`,
          `LOCATION:${e.classroomName || 'Campus Room'}`,
          `DESCRIPTION:Instructor: ${e.facultyName} | Room Type: ${e.roomType || 'Standard'}`,
          `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
          `DTSTART;TZID=UTC:20261116T${startClean}`,
          `DTEND;TZID=UTC:20261116T${endClean}`,
          'END:VEVENT'
        );
      });

      icsContent.push('END:VCALENDAR');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="edunova-schedule.ics"');
      res.status(200).send(icsContent.join('\r\n'));
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Export CSV
  public static async exportTimetableCSV(req: Request, res: Response): Promise<void> {
    try {
      const { semester = 'Fall 2026', department, facultyId, section } = req.query;

      let entries = store.getTimetableEntries({
        semester: String(semester),
        department: department ? String(department) : undefined,
        facultyId: facultyId ? String(facultyId) : undefined,
      });

      if (section) entries = entries.filter((e) => e.section === section);

      const header = 'Day,Start Time,End Time,Course Code,Course Name,Section,Faculty Name,Classroom,Room Type\n';
      const rows = entries.map((e) =>
        `"${e.day}","${e.startTime}","${e.endTime}","${e.courseCode}","${e.courseName.replace(/"/g, '""')}","${e.section}","${e.facultyName}","${e.classroomName}","${e.roomType || ''}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="edunova-timetable.csv"');
      res.status(200).send(header + rows);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Substitute Recommendation Intelligence
  public static async getSubstituteRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { courseCode, day, startTime, endTime } = req.body;

      if (!courseCode || !day || !startTime || !endTime) {
        res.status(400).json({ success: false, message: 'courseCode, day, startTime, and endTime are required.' });
        return;
      }

      const candidates = store.findSubstituteCandidates(courseCode, day, startTime, endTime);
      res.status(200).json({
        success: true,
        count: candidates.length,
        courseCode,
        day,
        slot: `${startTime} – ${endTime}`,
        candidates,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Faculty Leave Requests
  public static async getLeaveRequests(req: Request, res: Response): Promise<void> {
    try {
      const leaves = store.getLeaveRequests();
      res.status(200).json({ success: true, count: leaves.length, leaves });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async submitLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { facultyId, facultyName, department, date, day, reason, affectedClasses } = req.body;

      if (!facultyId || !date || !day) {
        res.status(400).json({ success: false, message: 'facultyId, date, and day are required.' });
        return;
      }

      // Automatically recommend substitute for primary class
      let recommendedSubstitute = null;
      if (affectedClasses && affectedClasses.length > 0) {
        const first = affectedClasses[0];
        const [st, et] = (first.time || '08:30 - 10:00').split(' - ');
        const candidates = store.findSubstituteCandidates(first.courseCode, day, st.trim(), et.trim());
        const valid = candidates.find((c) => !c.hasClash);
        if (valid) {
          recommendedSubstitute = {
            facultyId: valid.facultyId,
            name: valid.name,
            reason: `Zero clashes on ${day}, teaches ${valid.department}, capacity: ${valid.remainingCapacity} remaining.`,
          };
        }
      }

      const leave = store.addLeaveRequest({
        facultyId,
        facultyName: facultyName || 'Faculty Member',
        department: department || 'Academic',
        date,
        day,
        reason: reason || 'Personal absence',
        affectedClasses: affectedClasses || [],
        recommendedSubstitute,
      });

      res.status(201).json({
        success: true,
        message: 'Leave request recorded and intelligent substitute recommended.',
        leave,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, approvedSubstitute } = req.body;
      const updated = store.updateLeaveRequest(id, { status, approvedSubstitute });
      res.status(200).json({ success: true, leave: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Scenarios Sandbox
  public static async getScenarios(req: Request, res: Response): Promise<void> {
    try {
      const scenarios = store.getScenarios();
      res.status(200).json({ success: true, count: scenarios.length, scenarios });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createScenario(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, semester = 'Fall 2026', qualityScore = 90 } = req.body;
      const scenario = store.addScenario({ name, description, semester, qualityScore, hardConflicts: 0 });
      res.status(201).json({ success: true, scenario });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async promoteScenario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promoted = store.promoteScenario(id);
      res.status(200).json({
        success: true,
        message: `Scenario "${promoted.name}" promoted to live institutional schedule.`,
        promoted,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
