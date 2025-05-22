/**
 * API Routes Configuration
 * 
 * This file registers all API routes for the application:
 * - Auth routes for registration, login, and user management
 * - Tenant routes for organization management
 * - Tenant user routes for managing users within an organization
 * - Invitation routes for inviting users to organizations
 */

import { Express } from 'express';
import { createServer } from 'http';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { setupAuth } from './auth';
import tenantRoutes from './routes/tenant-routes';
import tenantUserRoutes from './routes/tenant-user-routes';
import invitationRoutes from './routes/invitation-routes';

export function registerRoutes(app: Express) {
  // Set up basic middleware
  app.use(cookieParser());
  
  // Set up authentication
  setupAuth(app);
  
  // Set up static file serving for uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Register API routes
  app.use('/api', tenantRoutes);
  app.use('/api', tenantUserRoutes);
  app.use('/api', invitationRoutes);
  
  // Create and return HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}