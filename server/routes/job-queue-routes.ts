/**
 * Job Queue API Routes
 * 
 * This module defines the routes for the job queue system API.
 * It provides endpoints for managing jobs, viewing queue stats,
 * and triggering various background tasks.
 */

import express from 'express';
import queueController from '../controllers/queue-controller';

const router = express.Router();

// Middleware to check admin permissions
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // In a real app, you'd check if the authenticated user has admin permissions
  // For now, we'll just check if they're authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Check if user has admin role (example implementation)
  if (req.user && (req.user as any).role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
};

// Email routes
router.post('/email', queueController.sendEmail);

// ROI distribution routes (admin only)
router.post('/roi-distribution', requireAdmin, queueController.scheduleROIDistribution);

// Report generation routes
router.post('/report', queueController.generateReport);

// Queue statistics routes (admin only)
router.get('/stats', requireAdmin, queueController.getQueueStats);
router.get('/stats/:queueName', requireAdmin, queueController.getQueueStatsByName);

// Queue management routes (admin only)
router.delete('/clear/:queueName', requireAdmin, queueController.clearQueue);

export default router;