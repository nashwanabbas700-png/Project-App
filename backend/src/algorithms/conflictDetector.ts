export interface ConflictCheckItem {
  id?: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
  roomType?: string;
  day: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  section: string;
  department: string;
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

export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
};

export const isTimeOverlapping = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
};

export class ConflictDetector {
  /**
   * Evaluates an entire list of timetable entries against institutional constraints.
   */
  public static detectAllConflicts(
    entries: ConflictCheckItem[],
    facultyList: any[] = [],
    classList: any[] = [],
    courseList: any[] = []
  ): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];

    // Map helpers for fast lookup
    const facultyMap = new Map<string, any>();
    facultyList.forEach((f) => facultyMap.set(f.facultyId, f));

    const classroomMap = new Map<string, any>();
    classList.forEach((r) => classroomMap.set(r.roomNumber, r));

    const courseMap = new Map<string, any>();
    courseList.forEach((c) => courseMap.set(c.code, c));

    // 1. Pairwise checks between entries
    for (let i = 0; i < entries.length; i++) {
      const a = entries[i];

      for (let j = i + 1; j < entries.length; j++) {
        const b = entries[j];

        // Only compare entries on the same day
        if (a.day !== b.day) continue;

        // Check if time intervals overlap
        if (isTimeOverlapping(a.startTime, a.endTime, b.startTime, b.endTime)) {
          // Hard Constraint 1: Faculty Double-Booking
          if (a.facultyId && b.facultyId && a.facultyId === b.facultyId) {
            conflicts.push({
              id: `cf-fac-${a.facultyId}-${a.day}-${a.startTime}`,
              severity: 'CRITICAL',
              type: 'FACULTY_DOUBLE_BOOKING',
              title: `Faculty Conflict: ${a.facultyName}`,
              description: `${a.facultyName} is scheduled simultaneously for ${a.courseCode} (${a.section}) and ${b.courseCode} (${b.section}) on ${a.day} at ${a.startTime}-${a.endTime}.`,
              suggestedCorrection: `Move ${b.courseCode} to a non-overlapping time slot or assign a substitute faculty member.`,
              day: a.day,
              startTime: a.startTime,
              endTime: a.endTime,
              facultyId: a.facultyId,
              facultyName: a.facultyName,
              courseCode: `${a.courseCode} / ${b.courseCode}`,
              section: `${a.section}, ${b.section}`,
            });
          }

          // Hard Constraint 2: Room Double-Booking
          if (a.roomNumber && b.roomNumber && a.roomNumber === b.roomNumber) {
            conflicts.push({
              id: `cf-room-${a.roomNumber}-${a.day}-${a.startTime}`,
              severity: 'CRITICAL',
              type: 'ROOM_DOUBLE_BOOKING',
              title: `Classroom Conflict: Room ${a.roomNumber}`,
              description: `Room ${a.roomNumber} is occupied by both ${a.courseCode} and ${b.courseCode} on ${a.day} at ${a.startTime}-${a.endTime}.`,
              suggestedCorrection: `Relocate ${b.courseCode} to an available alternate room with matching capacity.`,
              day: a.day,
              startTime: a.startTime,
              endTime: a.endTime,
              roomNumber: a.roomNumber,
              courseCode: `${a.courseCode} / ${b.courseCode}`,
            });
          }

          // Hard Constraint 3: Student Section Double-Booking
          if (a.section && b.section && a.section === b.section && a.department === b.department) {
            conflicts.push({
              id: `cf-sec-${a.section}-${a.day}-${a.startTime}`,
              severity: 'CRITICAL',
              type: 'SECTION_DOUBLE_BOOKING',
              title: `Student Section Conflict: Section ${a.section}`,
              description: `Students in section ${a.section} have overlapping classes: ${a.courseCode} and ${b.courseCode} on ${a.day} at ${a.startTime}.`,
              suggestedCorrection: `Reschedule one of the section lectures to an alternate open period.`,
              day: a.day,
              startTime: a.startTime,
              endTime: a.endTime,
              section: a.section,
              courseCode: `${a.courseCode} / ${b.courseCode}`,
            });
          }
        }
      }

      // 2. Individual Entry Validation against Faculty Availability
      const faculty = facultyMap.get(a.facultyId);
      if (faculty) {
        // Check unavailable days
        if (faculty.unavailableDays && faculty.unavailableDays.includes(a.day)) {
          conflicts.push({
            id: `cf-unavail-day-${a.facultyId}-${a.day}`,
            severity: 'CRITICAL',
            type: 'FACULTY_UNAVAILABLE',
            title: `Faculty Day Restriction: ${a.facultyName}`,
            description: `${a.facultyName} is marked unavailable on ${a.day}s per departmental policy.`,
            suggestedCorrection: `Reschedule ${a.courseCode} to one of ${faculty.name}'s active teaching days.`,
            day: a.day,
            startTime: a.startTime,
            endTime: a.endTime,
            facultyId: a.facultyId,
            facultyName: a.facultyName,
            courseCode: a.courseCode,
          });
        }

        // Check unavailable slots
        if (faculty.unavailableSlots && faculty.unavailableSlots.length > 0) {
          for (const slot of faculty.unavailableSlots) {
            if (slot.day === a.day && isTimeOverlapping(a.startTime, a.endTime, slot.startTime, slot.endTime)) {
              conflicts.push({
                id: `cf-unavail-slot-${a.facultyId}-${a.day}-${slot.startTime}`,
                severity: 'CRITICAL',
                type: 'FACULTY_UNAVAILABLE',
                title: `Faculty Blocked Time: ${a.facultyName}`,
                description: `${a.facultyName} has a blocked time slot on ${a.day} (${slot.startTime}-${slot.endTime})${slot.reason ? `: ${slot.reason}` : ''}.`,
                suggestedCorrection: `Shift ${a.courseCode} outside the blocked interval.`,
                day: a.day,
                startTime: a.startTime,
                endTime: a.endTime,
                facultyId: a.facultyId,
                facultyName: a.facultyName,
                courseCode: a.courseCode,
              });
            }
          }
        }
      }

      // 3. Room Type Compatibility Check
      const course = courseMap.get(a.courseCode);
      const room = classroomMap.get(a.roomNumber);

      if (course && room) {
        if (course.requiredRoomType && room.type !== course.requiredRoomType) {
          conflicts.push({
            id: `cf-roomtype-${a.courseCode}-${a.roomNumber}`,
            severity: course.isLab ? 'CRITICAL' : 'WARNING',
            type: 'ROOM_TYPE_MISMATCH',
            title: `Room Specification Mismatch`,
            description: `${course.name} requires a "${course.requiredRoomType}" but is placed in Room ${room.roomNumber} (${room.type}).`,
            suggestedCorrection: `Reassign to a laboratory or room with "${course.requiredRoomType}" equipment.`,
            day: a.day,
            startTime: a.startTime,
            endTime: a.endTime,
            roomNumber: room.roomNumber,
            courseCode: a.courseCode,
          });
        }
      }
    }

    // 4. Faculty Workload & Fatigue Checks
    const facultyHours = new Map<string, number>();
    entries.forEach((e) => {
      const durationHours = (timeToMinutes(e.endTime) - timeToMinutes(e.startTime)) / 60;
      facultyHours.set(e.facultyId, (facultyHours.get(e.facultyId) || 0) + durationHours);
    });

    facultyHours.forEach((totalHours, facultyId) => {
      const faculty = facultyMap.get(facultyId);
      if (faculty && faculty.maxWeeklyHours && totalHours > faculty.maxWeeklyHours) {
        conflicts.push({
          id: `cf-workload-${facultyId}`,
          severity: 'WARNING',
          type: 'WORKLOAD_LIMIT_EXCEEDED',
          title: `Overallocated Faculty Workload: ${faculty.name}`,
          description: `${faculty.name} is assigned ${totalHours.toFixed(1)} hours/week, exceeding the institutional ceiling of ${faculty.maxWeeklyHours} hours/week.`,
          suggestedCorrection: `Transfer one lecture section to another faculty member within ${faculty.department}.`,
          day: 'Weekly',
          startTime: '08:30',
          endTime: '17:30',
          facultyId: faculty.facultyId,
          facultyName: faculty.name,
        });
      }
    });

    return conflicts;
  }
}
