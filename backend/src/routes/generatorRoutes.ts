import { Router } from 'express';
import { GeneratorController } from '../controllers/generatorController.js';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/simulate', authenticateJWT, requireAdmin, GeneratorController.simulateSchedule);
router.post('/apply', authenticateJWT, requireAdmin, GeneratorController.applyGeneratedSchedule);
router.get('/historical-insights', GeneratorController.getHistoricalInsights);

export default router;
