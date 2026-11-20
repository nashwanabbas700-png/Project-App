import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ClassroomController {
  public static async getAllClassrooms(req: Request, res: Response): Promise<void> {
    try {
      const { type, minCapacity } = req.query;
      let rooms = store.getClassrooms();

      if (type && type !== 'All') {
        rooms = rooms.filter((r) => r.type === type);
      }
      if (minCapacity) {
        rooms = rooms.filter((r) => r.capacity >= Number(minCapacity));
      }

      res.status(200).json({ success: true, count: rooms.length, classrooms: rooms });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createClassroom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { roomNumber, building, capacity = 40, type = 'Lecture Room', features = [] } = req.body;

      if (!roomNumber || !building) {
        res.status(400).json({ success: false, message: 'Room number and building are required.' });
        return;
      }

      const room = store.addClassroom({
        roomNumber: roomNumber.toUpperCase().trim(),
        building,
        capacity: Number(capacity),
        type,
        features,
        isAvailable: true,
      });

      res.status(201).json({ success: true, message: `Classroom ${room.roomNumber} created.`, classroom: room });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async updateClassroom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { roomNumber } = req.params;
      const updates = req.body;

      const updated = store.updateClassroom(roomNumber, updates);
      res.status(200).json({ success: true, message: `Classroom ${roomNumber} updated.`, classroom: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async deleteClassroom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { roomNumber } = req.params;
      store.deleteClassroom(roomNumber);
      res.status(200).json({ success: true, message: `Classroom ${roomNumber} deleted.` });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
