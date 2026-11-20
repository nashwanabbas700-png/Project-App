import { Router } from 'express';
import { ClassroomController } from '../controllers/classroomController.js';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', ClassroomController.getAllClassrooms);
router.post('/', authenticateJWT, requireAdmin, ClassroomController.createClassroom);
router.put('/:roomNumber', authenticateJWT, requireAdmin, ClassroomController.updateClassroom);
router.delete('/:roomNumber', authenticateJWT, requireAdmin, ClassroomController.deleteClassroom);

export default router;
