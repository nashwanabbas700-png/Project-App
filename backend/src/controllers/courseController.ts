import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class CourseController {
  public static async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const { department, semester, search } = req.query;
      let courses = store.getCourses();

      if (department && department !== 'All') {
        courses = courses.filter((c) => c.department === department);
      }
      if (semester) {
        courses = courses.filter((c) => c.semester === semester);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        courses = courses.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            (c.assignedFacultyName && c.assignedFacultyName.toLowerCase().includes(q))
        );
      }

      res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        code,
        name,
        department,
        semester = 'Fall 2026',
        credits = 3,
        weeklySessions = 2,
        durationMinutes = 90,
        requiredRoomType = 'Lecture Room',
        isLab = false,
        assignedFacultyId,
        sections = ['A'],
      } = req.body;

      if (!code || !name || !department) {
        res.status(400).json({ success: false, message: 'Course code, name, and department are required.' });
        return;
      }

      let assignedFacultyName = '';
      if (assignedFacultyId) {
        const fac = store.findFacultyById(assignedFacultyId);
        if (fac) assignedFacultyName = fac.name;
      }

      const course = store.addCourse({
        code: code.toUpperCase().trim(),
        name,
        department,
        semester,
        credits: Number(credits),
        weeklySessions: Number(weeklySessions),
        durationMinutes: Number(durationMinutes),
        requiredRoomType,
        isLab: Boolean(isLab),
        assignedFacultyId,
        assignedFacultyName,
        sections,
      });

      res.status(201).json({ success: true, message: `Course ${course.code} created.`, course });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async updateCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const updates = req.body;

      if (updates.assignedFacultyId) {
        const fac = store.findFacultyById(updates.assignedFacultyId);
        if (fac) updates.assignedFacultyName = fac.name;
      }

      const updated = store.updateCourse(code, updates);
      res.status(200).json({ success: true, message: `Course ${code} updated.`, course: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async deleteCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      store.deleteCourse(code);
      res.status(200).json({ success: true, message: `Course ${code} deleted.` });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
