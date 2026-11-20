import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateJWT, NotificationController.getNotifications);
router.put('/:id/read', authenticateJWT, NotificationController.markAsRead);
router.put('/mark-all-read', authenticateJWT, NotificationController.markAllAsRead);

export default router;
