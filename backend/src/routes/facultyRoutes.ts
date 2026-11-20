import { Router } from 'express';
import { FacultyController } from '../controllers/facultyController.js';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', FacultyController.getAllFaculty);
router.get('/:id', FacultyController.getFacultyById);
router.post('/', authenticateJWT, requireAdmin, FacultyController.createFaculty);
router.put('/:id', authenticateJWT, FacultyController.updateFaculty);
router.delete('/:id', authenticateJWT, requireAdmin, FacultyController.deleteFaculty);

export default router;
