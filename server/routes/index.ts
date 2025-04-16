import { Express } from 'express';
import propertyRoutes from './propertyRoutes';
import investmentRoutes from './investmentRoutes';
import notificationRoutes from './notificationRoutes';
import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';

/**
 * Register all API routes
 */
export function registerRoutes(app: Express) {
  // Auth routes
  app.use('/api/auth', authRoutes);
  
  // Property routes - publicly accessible
  app.use('/api/properties', propertyRoutes);
  
  // Protected routes
  app.use('/api/investments', investmentRoutes);
  app.use('/api/notifications', notificationRoutes);
  
  // Admin routes
  app.use('/api/admin', adminRoutes);
}

export default registerRoutes;