import express from 'express';
import path from 'path';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { setupAuth } from './auth.cjs';
import { storage } from './storage.cjs';

// Import routes
const authRoutes = require('./routes/auth-routes');
const propertyRoutes = require('./routes/property-routes');
const investmentRoutes = require('./routes/investment-routes');
const walletRoutes = require('./routes/wallet-routes');
const notificationRoutes = require('./routes/notification-routes');

export function registerRoutes(app: express.Express) {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  
  // Enable CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://ireva.com', 'https://www.ireva.com'] 
      : true,
    credentials: true
  }));
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });

  // Apply rate limiting to API routes
  app.use('/api', apiLimiter);
  
  // Body parser, cookie parser
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());
  
  // Setup authentication
  setupAuth(app, storage);
  
  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/investments', investmentRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/notifications', notificationRoutes);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'iREVA Platform API is running',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Static files - serve public directory
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}