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

import { Express } from 'express';
import { createServer } from 'http';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { setupAuth } from './auth';
import { sessionMiddleware, trackUserActivity } from './session';
import { cacheMiddleware } from './middleware/cache';
import tenantRoutes from './routes/tenant-routes';
import tenantUserRoutes from './routes/tenant-user-routes';
import invitationRoutes from './routes/invitation-routes';
import healthRoutes from './routes/health-routes';

export function registerRoutes(app: Express) {
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
  
  // Add route to verify Redis is working
  app.get('/redis-test', (req, res) => {
    if (req.session) {
      // Increment redis test counter in session
      const visits = req.session.visits || 0;
      req.session.visits = visits + 1;
      
      res.json({
        message: 'Redis session store is working',
        session_id: req.sessionID,
        visits: req.session.visits,
      });
    } else {
      res.status(500).json({
        error: 'Session not available',
      });
    }
  });
  
  // Create and return HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}