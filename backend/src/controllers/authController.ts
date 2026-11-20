import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smartsched_ultra_secure_jwt_secret_key_2026!';

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Please provide email and password.' });
        return;
      }

      const user = store.findUserByEmail(email.trim());

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid university credentials. Please use demo accounts or sign in via SSO.',
        });
        return;
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid password. Please check your credentials or reset your password.',
        });
        return;
      }

      // Fetch linked faculty details if role is faculty
      let facultyDetails = null;
      if (user.role === 'faculty' && user.facultyId) {
        facultyDetails = store.findFacultyById(user.facultyId);
      }

      const tokenExpiresIn = rememberMe ? '30d' : '24h';
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          facultyId: user.facultyId,
          department: user.department,
        },
        JWT_SECRET,
        { expiresIn: tokenExpiresIn }
      );

      res.status(200).json({
        success: true,
        message: 'Authentication successful. Welcome to SmartSched.',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          facultyId: user.facultyId,
          department: user.department,
          avatarUrl: user.avatarUrl,
          facultyDetails,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async ssoLogin(req: Request, res: Response): Promise<void> {
    try {
      const { provider = 'Institutional Identity Provider (SAML 2.0 / OIDC)', role = 'faculty' } = req.body;

      // In accordance with institutional guidelines: clear demo mode assertion
      const targetEmail = role === 'admin' ? 'admin@smartsched.edu' : 'faculty@smartsched.edu';
      const user = store.findUserByEmail(targetEmail);

      if (!user) {
        res.status(404).json({ success: false, message: 'Demo SSO user not found.' });
        return;
      }

      let facultyDetails = null;
      if (user.role === 'faculty' && user.facultyId) {
        facultyDetails = store.findFacultyById(user.facultyId);
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          facultyId: user.facultyId,
          department: user.department,
          authMethod: 'DEMO_SSO_SIMULATION',
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        isDemoSSO: true,
        message: `Successfully authenticated via simulated institutional SSO (${provider}).`,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          facultyId: user.facultyId,
          department: user.department,
          avatarUrl: user.avatarUrl,
          facultyDetails,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const user = store.findUserByEmail(req.user.email);
      if (!user) {
        res.status(404).json({ success: false, message: 'User record not found.' });
        return;
      }

      let facultyDetails = null;
      if (user.facultyId) {
        facultyDetails = store.findFacultyById(user.facultyId);
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          facultyId: user.facultyId,
          department: user.department,
          avatarUrl: user.avatarUrl,
          facultyDetails,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    res.status(200).json({
      success: true,
      message: `Password reset instructions have been dispatched to ${email || 'your university email'}. In demo mode, use Admin123! or Faculty123!.`,
      demoHint: 'Use Admin123! for admin or Faculty123! for faculty.',
    });
  }
}
