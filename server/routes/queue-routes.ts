/**
 * Queue Management Routes
 * 
 * This module provides API routes for managing the queue system,
 * including job creation, monitoring, and administration.
 */

import express from 'express';
import { QueueName, addJob, getQueueStats, getAllQueueStats, clearQueue } from '../lib/queue';
import { EmailJobData } from '../lib/queue/processors/email-processor';
import { ROIDistributionJobData } from '../lib/queue/processors/roi-processor';
import { ReportJobData } from '../lib/queue/processors/report-processor';
import logger from '../lib/logger';

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

// Add a job to the email queue
router.post('/email', async (req, res) => {
  try {
    const jobData: EmailJobData = req.body;
    
    // Basic validation
    if (!jobData.to || !jobData.subject || !jobData.template) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        requiredFields: ['to', 'subject', 'template'] 
      });
    }
    
    // Add job to queue
    const job = await addJob(QueueName.EMAIL, jobData);
    
    res.status(201).json({ 
      success: true, 
      jobId: job.id,
      message: 'Email job added to queue' 
    });
  } catch (error) {
    logger.error('Failed to add email job', { error });
    res.status(500).json({ 
      error: 'Failed to add job to queue',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add a job to the ROI distribution queue (admin only)
router.post('/roi-distribution', requireAdmin, async (req, res) => {
  try {
    const jobData: ROIDistributionJobData = req.body;
    
    // Basic validation
    if (!jobData.propertyId || !jobData.periodId || !jobData.totalAmount || !jobData.distributionDate) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        requiredFields: ['propertyId', 'periodId', 'totalAmount', 'distributionDate'] 
      });
    }
    
    // Add job to queue
    const job = await addJob(QueueName.ROI_DISTRIBUTION, jobData);
    
    res.status(201).json({ 
      success: true, 
      jobId: job.id,
      message: 'ROI distribution job added to queue' 
    });
  } catch (error) {
    logger.error('Failed to add ROI distribution job', { error });
    res.status(500).json({ 
      error: 'Failed to add job to queue',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add a job to the report generation queue
router.post('/report', async (req, res) => {
  try {
    const jobData: ReportJobData = req.body;
    
    // Basic validation
    if (!jobData.reportType || !jobData.format || !jobData.parameters) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        requiredFields: ['reportType', 'format', 'parameters'] 
      });
    }
    
    // Add job to queue
    const job = await addJob(QueueName.REPORT_GENERATION, jobData);
    
    res.status(201).json({ 
      success: true, 
      jobId: job.id,
      message: 'Report generation job added to queue' 
    });
  } catch (error) {
    logger.error('Failed to add report generation job', { error });
    res.status(500).json({ 
      error: 'Failed to add job to queue',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get stats for all queues (admin only)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await getAllQueueStats();
    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Failed to get queue stats', { error });
    res.status(500).json({ 
      error: 'Failed to get queue stats',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get stats for a specific queue (admin only)
router.get('/stats/:queueName', requireAdmin, async (req, res) => {
  try {
    const queueName = req.params.queueName as QueueName;
    
    // Check if queue name is valid
    if (!Object.values(QueueName).includes(queueName)) {
      return res.status(400).json({ 
        error: 'Invalid queue name',
        validQueues: Object.values(QueueName) 
      });
    }
    
    const stats = await getQueueStats(queueName);
    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Failed to get queue stats', { 
      queue: req.params.queueName,
      error 
    });
    res.status(500).json({ 
      error: 'Failed to get queue stats',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Clear a queue (admin only)
router.delete('/clear/:queueName', requireAdmin, async (req, res) => {
  try {
    const queueName = req.params.queueName as QueueName;
    
    // Check if queue name is valid
    if (!Object.values(QueueName).includes(queueName)) {
      return res.status(400).json({ 
        error: 'Invalid queue name',
        validQueues: Object.values(QueueName) 
      });
    }
    
    await clearQueue(queueName);
    res.json({ 
      success: true, 
      message: `Queue ${queueName} cleared successfully` 
    });
  } catch (error) {
    logger.error('Failed to clear queue', { 
      queue: req.params.queueName,
      error 
    });
    res.status(500).json({ 
      error: 'Failed to clear queue',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;