import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import commandRoutes from './routes/commandRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/healthRoutes.js';

export function createApp() {
  const app = express();

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false // Allows API communication in local dev
  }));

  // CORS configuration
  app.use(cors({
    origin: '*', // Supports localhost frontend and mobile agent requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Token']
  }));

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health and telemetry check
  app.use('/health', healthRoutes);
  app.use('/api/health', healthRoutes);

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/devices', deviceRoutes);
  app.use('/api/commands', commandRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/activity', activityRoutes);

  // 404 & Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
