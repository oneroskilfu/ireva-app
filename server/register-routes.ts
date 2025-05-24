import express, { Express } from 'express';
import adminRouter from './routes/admin-routes';

/**
 * Register all routes with the Express application
 * @param app Express application instance
 */
export function registerRoutes(app: Express): void {
  // Mount admin routes
  app.use('/api/admin', adminRouter);
  
  // You would add other routes here
  // app.use('/api/investors', investorRouter);
  // app.use('/api/properties', propertyRouter);
  // etc.
  
  // Example of a simple public route
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is healthy' });
  });
}