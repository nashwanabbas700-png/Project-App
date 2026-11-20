import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { initSocket } from './services/socketService.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import classroomRoutes from './routes/classroomRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import generatorRoutes from './routes/generatorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'SmartSched Institutional API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'JWT Authentication & Demo SSO Assertion',
      'Constraint-Based Intelligent Timetable Generator',
      'Historical Data Pattern Compatibility Engine',
      'Real-Time Automatic Conflict Detection',
      'Faculty Workload Analytics & Balancing',
      'Real-Time Socket.IO Synchronization',
    ],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/generate', generatorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Create HTTP and Socket.IO Server
const server = http.createServer(app);
initSocket(server);

// Start Server
const startServer = async () => {
  await connectDatabase();
  server.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 SmartSched Backend Server running on port ${port}`);
    console.log(`📡 REST API: http://localhost:${port}/api`);
    console.log(`⚡ Socket.IO Gateway active`);
    console.log(`🎓 Institutional Mode: University Faculty Timetable System`);
    console.log(`=======================================================`);
  });
};

startServer();
