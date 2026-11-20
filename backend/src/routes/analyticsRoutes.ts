import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';

const router = Router();

router.get('/workload', AnalyticsController.getWorkloadAnalytics);
router.get('/conflicts', AnalyticsController.getConflictReport);
router.get('/dashboard', AnalyticsController.getDashboardStats);

export default router;
