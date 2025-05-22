/**
 * Queue Controller
 * 
 * This controller handles API requests related to the job queue system.
 * It provides endpoints for managing jobs, viewing queue stats, and
 * triggering various background tasks.
 */

import { Request, Response } from 'express';
import queueService from '../services/queue-service';
import logger from '../lib/logger';
import { QueueName } from '../lib/queue';

/**
 * Send an email via the queue system
 * @param req HTTP request
 * @param res HTTP response
 */
export async function sendEmail(req: Request, res: Response): Promise<void> {
  try {
    const { to, subject, template, context, ...options } = req.body;
    
    // Validate required fields
    if (!to || !subject || !template || !context) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        requiredFields: ['to', 'subject', 'template', 'context']
      });
      return;
    }
    
    // Queue the email
    const jobId = await queueService.sendEmail(to, subject, template, context, options);
    
    res.status(202).json({
      success: true,
      message: 'Email queued successfully',
      jobId
    });
  } catch (error) {
    logger.error('Failed to queue email', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to queue email',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Schedule an ROI distribution via the queue system
 * @param req HTTP request
 * @param res HTTP response
 */
export async function scheduleROIDistribution(req: Request, res: Response): Promise<void> {
  try {
    const { propertyId, totalAmount, ...options } = req.body;
    
    // Validate required fields
    if (!propertyId || totalAmount === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        requiredFields: ['propertyId', 'totalAmount']
      });
      return;
    }
    
    // Add user ID from authentication
    const userId = req.user?.id || 0;
    
    // Queue the distribution
    const jobId = await queueService.scheduleROIDistribution(
      propertyId,
      totalAmount,
      { ...options, initiatedBy: userId }
    );
    
    res.status(202).json({
      success: true,
      message: 'ROI distribution queued successfully',
      jobId
    });
  } catch (error) {
    logger.error('Failed to queue ROI distribution', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to queue ROI distribution',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Generate a report via the queue system
 * @param req HTTP request
 * @param res HTTP response
 */
export async function generateReport(req: Request, res: Response): Promise<void> {
  try {
    const { reportType, format, parameters, ...options } = req.body;
    
    // Validate required fields
    if (!reportType || !format || !parameters) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        requiredFields: ['reportType', 'format', 'parameters']
      });
      return;
    }
    
    // Add user ID from authentication
    const userId = req.user?.id || 0;
    
    // Queue the report generation
    const jobId = await queueService.generateReport(
      reportType,
      format,
      parameters,
      { ...options, requestedBy: userId }
    );
    
    res.status(202).json({
      success: true,
      message: 'Report generation queued successfully',
      jobId
    });
  } catch (error) {
    logger.error('Failed to queue report generation', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to queue report generation',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get statistics for all job queues
 * @param req HTTP request
 * @param res HTTP response
 */
export async function getQueueStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await queueService.getQueueStatistics();
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Failed to get queue statistics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get queue statistics',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get statistics for a specific job queue
 * @param req HTTP request
 * @param res HTTP response
 */
export async function getQueueStatsByName(req: Request, res: Response): Promise<void> {
  try {
    const queueName = req.params.queueName as QueueName;
    
    // Validate queue name
    if (!Object.values(QueueName).includes(queueName)) {
      res.status(400).json({
        success: false,
        error: 'Invalid queue name',
        validQueueNames: Object.values(QueueName)
      });
      return;
    }
    
    const stats = await queueService.getQueueStatisticsByName(queueName);
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Failed to get queue statistics', { error, queueName: req.params.queueName });
    res.status(500).json({
      success: false,
      error: 'Failed to get queue statistics',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Clear all jobs from a specific queue
 * @param req HTTP request
 * @param res HTTP response
 */
export async function clearQueue(req: Request, res: Response): Promise<void> {
  try {
    const queueName = req.params.queueName as QueueName;
    
    // Validate queue name
    if (!Object.values(QueueName).includes(queueName)) {
      res.status(400).json({
        success: false,
        error: 'Invalid queue name',
        validQueueNames: Object.values(QueueName)
      });
      return;
    }
    
    const success = await queueService.clearQueueJobs(queueName);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: `Queue ${queueName} cleared successfully`
      });
    } else {
      res.status(500).json({
        success: false,
        error: `Failed to clear queue ${queueName}`
      });
    }
  } catch (error) {
    logger.error('Failed to clear queue', { error, queueName: req.params.queueName });
    res.status(500).json({
      success: false,
      error: 'Failed to clear queue',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export default {
  sendEmail,
  scheduleROIDistribution,
  generateReport,
  getQueueStats,
  getQueueStatsByName,
  clearQueue
};