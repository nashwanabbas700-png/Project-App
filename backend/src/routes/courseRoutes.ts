import { Router } from 'express';
import { CourseController } from '../controllers/courseController.js';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', CourseController.getAllCourses);
router.post('/', authenticateJWT, requireAdmin, CourseController.createCourse);
router.put('/:code', authenticateJWT, requireAdmin, CourseController.updateCourse);
router.delete('/:code', authenticateJWT, requireAdmin, CourseController.deleteCourse);

export default router;
