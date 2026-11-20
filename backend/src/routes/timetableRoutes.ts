import { Router } from 'express';
import { TimetableController } from '../controllers/timetableController.js';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/master', TimetableController.getMasterTimetable);
router.get('/faculty/:facultyId?', authenticateJWT, TimetableController.getFacultyPersonalTimetable);
router.get('/student', TimetableController.getStudentTimetable);
router.get('/export/ics', TimetableController.exportCalendarICS);
router.get('/export/csv', TimetableController.exportTimetableCSV);
router.post('/substitutes/recommend', TimetableController.getSubstituteRecommendations);
router.get('/leaves', TimetableController.getLeaveRequests);
router.post('/leaves', TimetableController.submitLeaveRequest);
router.put('/leaves/:id', authenticateJWT, requireAdmin, TimetableController.updateLeaveRequest);
router.get('/scenarios', TimetableController.getScenarios);
router.post('/scenarios', authenticateJWT, requireAdmin, TimetableController.createScenario);
router.post('/scenarios/:id/promote', authenticateJWT, requireAdmin, TimetableController.promoteScenario);
router.get('/history', TimetableController.getHistory);
router.post('/entries', authenticateJWT, requireAdmin, TimetableController.addTimetableEntry);
router.put('/entries/:id', authenticateJWT, requireAdmin, TimetableController.updateTimetableEntry);
router.delete('/entries/:id', authenticateJWT, requireAdmin, TimetableController.deleteTimetableEntry);
router.post('/publish', authenticateJWT, requireAdmin, TimetableController.publishTimetable);

export default router;
