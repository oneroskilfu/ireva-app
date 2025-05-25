/**
 * API Routes Configuration
 * 
 * This file registers all API routes for the application:
 * - Auth routes for registration, login, and user management
 * - Tenant routes for organization management
 * - Tenant user routes for managing users within an organization
 * - Invitation routes for inviting users to organizations
 * - Health check routes for system monitoring
 */

import { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { setupAuth } from './auth';
import { sessionMiddleware, trackUserActivity } from './session';
import { cacheMiddleware } from './middleware/cache';
import requestLogger from './middleware/request-logger';
import logger from './lib/logger';
import tenantRoutes from './routes/tenant-routes';
import tenantUserRoutes from './routes/tenant-user-routes';
import invitationRoutes from './routes/invitation-routes';
import healthRoutes from './routes/health-routes';
import jobQueueRoutes from './routes/job-queue-routes';
import { devToolsRouter } from './routes/dev-tools';
import refreshTokenRoutes from './routes/refresh-token.routes';
import swaggerRoutes from './routes/swagger.routes';
import emailVerificationRoutes from './routes/email-verification.routes';

export async function registerRoutes(app: Express) {
  // Set up request ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.id = req.headers['x-request-id'] as string || uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
  });

  // Set up error handling
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error in request', { 
      error: err, 
      url: req.url, 
      method: req.method,
      requestId: req.id
    });
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      requestId: req.id
    });
  });
  
  // Set up request logging
  app.use(requestLogger);
  
  // Set up basic middleware
  app.use(cookieParser());
  
  // Set up session and user activity tracking
  app.use(sessionMiddleware);
  app.use(trackUserActivity);
  
  // Set up API cache middleware for GET requests (5 minute TTL)
  app.use('/api', cacheMiddleware({ ttl: 300, keyPrefix: 'api:cache' }));
  
  // Set up authentication
  setupAuth(app);
  
  // Set up static file serving for uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Register API routes
  app.use('/api', tenantRoutes);
  app.use('/api', tenantUserRoutes);
  app.use('/api', invitationRoutes);
  app.use('/api', healthRoutes);
  app.use('/api/jobs', jobQueueRoutes);
  app.use('/api/dev-tools', devToolsRouter);
  
  // Secure JWT-based authentication routes
  try {
    const secureAuthModule = await import('./routes/secure-auth.routes');
    app.use('/api/secure-auth', secureAuthModule.default);
  } catch (error) {
    console.error('Failed to load secure auth routes:', error);
  }
  
  // Refresh token routes
  app.use('/api', refreshTokenRoutes);
  
  // Swagger API documentation
  app.use('/api', swaggerRoutes);
  
  // Email verification routes
  app.use('/api', emailVerificationRoutes);
  
  // Add route to verify Redis is working
  app.get('/redis-test', (req, res) => {
    if (req.session) {
      // Increment redis test counter in session
      const visits = req.session.visits || 0;
      req.session.visits = visits + 1;
      
      logger.info('Redis test route accessed', { 
        sessionId: req.sessionID,
        visits: req.session.visits
      });
      
      res.json({
        message: 'Redis session store is working',
        session_id: req.sessionID,
        visits: req.session.visits,
      });
    } else {
      logger.error('Session not available in Redis test route');
      
      res.status(500).json({
        error: 'Session not available',
      });
    }
  });
  
  // Add route to test LogDNA integration
  app.get('/logdna-test', (req, res) => {
    const testId = uuidv4();
    
    logger.info('LogDNA test message', { 
      test_id: testId,
      test_data: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });
    
    res.json({
      message: 'Test log sent to LogDNA',
      test_id: testId,
      note: 'Check LogDNA dashboard for this message'
    });
  });
  
  // Note: Catch-all handler removed to allow Vite middleware to serve frontend routes
  // API 404s will be handled by individual route handlers
  
  // Create and return HTTP server
  const httpServer = createServer(app);
  
  // Log application startup
  logger.info('Application routes registered successfully', {
    routes: [
      '/api/tenants',
      '/api/tenants/:tenantId/users',
      '/api/tenants/:tenantId/invitations',
      '/api/invitations',
      '/api/health',
      '/api/jobs/email',
      '/api/jobs/roi-distribution',
      '/api/jobs/report',
      '/api/jobs/stats',
      '/redis-test',
      '/logdna-test'
    ]
  });
  
  return httpServer;
}