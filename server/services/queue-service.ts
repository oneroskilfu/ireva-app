/**
 * Queue Service
 * 
 * This service provides a high-level API for working with the job queue system.
 * It abstracts away the details of queue management and provides business-focused methods.
 */

import { QueueName, addJob, getQueueStats, getAllQueueStats, clearQueue } from '../lib/queue';
import { initializeQueueSystem, shutdownQueueSystem } from '../lib/queue/init';
import { EmailJobData } from '../lib/queue/processors/email-processor';
import { ROIDistributionJobData } from '../lib/queue/processors/roi-processor';
import { ReportJobData, ReportType, ReportFormat } from '../lib/queue/processors/report-processor';
import logger from '../lib/logger';

/**
 * Initialize the queue system with default settings
 */
export async function initializeQueues(): Promise<void> {
  await initializeQueueSystem({
    workerConcurrency: 2, // Default concurrency
    startWorkers: true    // Start workers immediately
  });
  
  logger.info('Queue system initialized through queue service');
}

/**
 * Send an email through the queue system
 * @param to Recipient email(s)
 * @param subject Email subject
 * @param template Template name to use
 * @param context Data to pass to the template
 * @param options Additional email options
 * @returns Job ID of the queued email
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  template: string,
  context: Record<string, any>,
  options: Partial<EmailJobData> = {}
): Promise<string> {
  try {
    const jobData: EmailJobData = {
      to,
      subject,
      template,
      context,
      ...options
    };
    
    const job = await addJob(QueueName.EMAIL, jobData);
    logger.info(`Email queued for sending`, { to, subject, template, jobId: job.id });
    
    return job.id as string;
  } catch (error) {
    logger.error(`Failed to queue email`, { 
      to, 
      subject, 
      template,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Schedule an ROI distribution to investors
 * @param propertyId Property ID
 * @param totalAmount Total amount to distribute
 * @param options Additional distribution options
 * @returns Job ID of the queued distribution
 */
export async function scheduleROIDistribution(
  propertyId: number,
  totalAmount: number,
  options: Partial<ROIDistributionJobData>
): Promise<string> {
  try {
    const jobData: ROIDistributionJobData = {
      propertyId,
      periodId: options.periodId || Date.now(),
      distributionDate: options.distributionDate || new Date().toISOString().split('T')[0],
      totalAmount,
      calculationMethod: options.calculationMethod || 'pro-rata',
      initiatedBy: options.initiatedBy || 0,
      ...options
    };
    
    const job = await addJob(QueueName.ROI_DISTRIBUTION, jobData);
    logger.info(`ROI distribution queued`, { propertyId, totalAmount, jobId: job.id });
    
    return job.id as string;
  } catch (error) {
    logger.error(`Failed to queue ROI distribution`, { 
      propertyId, 
      totalAmount,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Generate a report asynchronously
 * @param reportType Type of report to generate
 * @param format Output format
 * @param parameters Report parameters
 * @param options Additional report options
 * @returns Job ID of the queued report
 */
export async function generateReport(
  reportType: ReportType,
  format: ReportFormat,
  parameters: Record<string, any>,
  options: Partial<ReportJobData> = {}
): Promise<string> {
  try {
    const jobData: ReportJobData = {
      reportType,
      format,
      parameters,
      requestedBy: options.requestedBy || 0,
      notifyOnComplete: options.notifyOnComplete !== undefined ? options.notifyOnComplete : true,
      ...options
    };
    
    const job = await addJob(QueueName.REPORT_GENERATION, jobData);
    logger.info(`Report generation queued`, { reportType, format, jobId: job.id });
    
    return job.id as string;
  } catch (error) {
    logger.error(`Failed to queue report generation`, { 
      reportType, 
      format,
      parameters,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Get statistics for all job queues
 * @returns Statistics for all queues
 */
export async function getQueueStatistics() {
  return await getAllQueueStats();
}

/**
 * Get statistics for a specific job queue
 * @param queueName Name of the queue
 * @returns Statistics for the specified queue
 */
export async function getQueueStatisticsByName(queueName: QueueName) {
  return await getQueueStats(queueName);
}

/**
 * Clear all jobs from a specific queue
 * @param queueName Name of the queue to clear
 * @returns Success indicator
 */
export async function clearQueueJobs(queueName: QueueName): Promise<boolean> {
  try {
    await clearQueue(queueName);
    logger.info(`Queue ${queueName} cleared successfully`);
    return true;
  } catch (error) {
    logger.error(`Failed to clear queue ${queueName}`, { 
      queueName,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Shutdown the queue system gracefully
 * @returns Promise that resolves when shutdown is complete
 */
export async function shutdownQueues(): Promise<void> {
  await shutdownQueueSystem();
  logger.info('Queue system shut down through queue service');
}

export default {
  initializeQueues,
  sendEmail,
  scheduleROIDistribution,
  generateReport,
  getQueueStatistics,
  getQueueStatisticsByName,
  clearQueueJobs,
  shutdownQueues,
  QueueName,
};