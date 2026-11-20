import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class FacultyController {
  public static async getAllFaculty(req: Request, res: Response): Promise<void> {
    try {
      const { department, search } = req.query;
      let faculty = store.getFacultyList();

      if (department && department !== 'All') {
        faculty = faculty.filter((f) => f.department === department);
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        faculty = faculty.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.facultyId.toLowerCase().includes(q) ||
            f.email.toLowerCase().includes(q) ||
            f.designation.toLowerCase().includes(q)
        );
      }

      // Compute current weekly teaching hours from active timetable entries
      const activeEntries = store.getTimetableEntries();
      const enrichedFaculty = faculty.map((fac) => {
        const facEntries = activeEntries.filter((e) => e.facultyId === fac.facultyId);
        let minutes = 0;
        facEntries.forEach((e) => {
          const [sh, sm] = e.startTime.split(':').map(Number);
          const [eh, em] = e.endTime.split(':').map(Number);
          minutes += eh * 60 + em - (sh * 60 + sm);
        });
        const currentHours = parseFloat((minutes / 60).toFixed(1));
        return {
          ...fac,
          currentWeeklyHours: currentHours,
          assignedClassesCount: facEntries.length,
        };
      });

      res.status(200).json({ success: true, count: enrichedFaculty.length, faculty: enrichedFaculty });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getFacultyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const faculty = store.findFacultyById(id);

      if (!faculty) {
        res.status(404).json({ success: false, message: `Faculty member with ID ${id} not found.` });
        return;
      }

      const activeEntries = store.getTimetableEntries({ facultyId: id });
      const courses = store.getCourses().filter((c) => c.assignedFacultyId === id);

      res.status(200).json({
        success: true,
        faculty: {
          ...faculty,
          assignedCourses: courses,
          currentSchedule: activeEntries,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createFaculty(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        facultyId,
        name,
        email,
        department,
        designation,
        maxWeeklyHours = 16,
        preferredTimes = ['Morning'],
        unavailableDays = [],
        unavailableSlots = [],
        phone = '',
        office = '',
      } = req.body;

      if (!facultyId || !name || !email || !department || !designation) {
        res.status(400).json({
          success: false,
          message: 'Missing required faculty fields: facultyId, name, email, department, designation.',
        });
        return;
      }

      const newFaculty = store.addFaculty({
        facultyId,
        name,
        email,
        department,
        designation,
        maxWeeklyHours: Number(maxWeeklyHours),
        currentWeeklyHours: 0,
        preferredTimes,
        unavailableDays,
        unavailableSlots,
        phone,
        office,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150`,
      });

      res.status(201).json({
        success: true,
        message: `Faculty member ${name} (${facultyId}) created successfully.`,
        faculty: newFaculty,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async updateFaculty(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = store.updateFaculty(id, updates);
      res.status(200).json({
        success: true,
        message: `Faculty member ${updated.name} updated successfully.`,
        faculty: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async deleteFaculty(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      store.deleteFaculty(id);
      res.status(200).json({ success: true, message: `Faculty member ${id} deleted successfully.` });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
