import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class NotificationController {
  public static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const facultyId = req.query.facultyId ? String(req.query.facultyId) : req.user?.facultyId;
      const notifications = store.getNotifications(facultyId);
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      res.status(200).json({
        success: true,
        total: notifications.length,
        unreadCount,
        notifications,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = store.markNotificationAsRead(id);
      res.status(200).json({ success: true, notification: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const facultyId = req.query.facultyId ? String(req.query.facultyId) : req.user?.facultyId;
      store.markAllNotificationsAsRead(facultyId);
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
