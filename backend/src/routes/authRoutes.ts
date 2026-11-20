import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/sso-login', AuthController.ssoLogin);
router.post('/forgot-password', AuthController.forgotPassword);
router.get('/me', authenticateJWT, AuthController.getCurrentUser);

export default router;
