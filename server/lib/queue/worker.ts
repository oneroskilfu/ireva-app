/**
 * Queue Worker
 * 
 * This module sets up job processors for all queues.
 * It includes concurrency control, error handling, and monitoring.
 */

import Bull from 'bull';
import os from 'os';
import { QueueName, getQueue } from './index';
import logger from '../logger';

// Import processors
import processEmailJob from './processors/email-processor';
import processROIDistributionJob from './processors/roi-processor';
import processReportJob from './processors/report-processor';

// Set default concurrency based on available CPUs
const DEFAULT_CONCURRENCY = Math.max(1, Math.min(os.cpus().length - 1, 4));

// Track processed queues
const processedQueues: Record<string, Bull.Queue> = {};

/**
 * Initialize job processors for all queues
 * @param concurrency Number of concurrent jobs per queue (optional)
 * @returns Object containing all initialized queues
 */
export function initializeWorkers(concurrency = DEFAULT_CONCURRENCY): Record<string, Bull.Queue> {
  logger.info('Initializing queue processors', { 
    concurrency,
    cpuCount: os.cpus().length
  });
  
  // Set up processors for each queue type
  setupProcessor(QueueName.EMAIL, processEmailJob, concurrency);
  setupProcessor(QueueName.ROI_DISTRIBUTION, processROIDistributionJob, Math.max(1, Math.floor(concurrency / 2)));
  setupProcessor(QueueName.REPORT_GENERATION, processReportJob, Math.max(1, Math.floor(concurrency / 2)));
  
  // Set up simpler processors for the remaining queues
  setupProcessor(QueueName.NOTIFICATION, simpleProcessor('notification'), concurrency);
  setupProcessor(QueueName.DATA_IMPORT, simpleProcessor('data-import'), 1);
  setupProcessor(QueueName.DATA_EXPORT, simpleProcessor('data-export'), 1);
  
  return processedQueues;
}

/**
 * Set up a processor for a specific queue
 * @param queueName Queue name
 * @param processor Job processor function
 * @param concurrency Number of concurrent jobs
 */
function setupProcessor(
  queueName: QueueName,
  processor: (job: Bull.Job) => Promise<any>,
  concurrency: number
): Bull.Queue {
  const queue = getQueue(queueName);
  
  // Configure queue settings
  queue.prefetch(concurrency);
  
  // Register the processor function
  queue.process(concurrency, processor);
  
  // Set up event handlers
  setupQueueEvents(queue, queueName);
  
  // Store reference to processed queue
  processedQueues[queueName] = queue;
  
  logger.info(`Processor for ${queueName} queue initialized`, { 
    queue: queueName,
    concurrency 
  });
  
  return queue;
}

/**
 * Set up event handlers for a queue
 * @param queue Bull queue
 * @param queueName Queue name for logging
 */
function setupQueueEvents(queue: Bull.Queue, queueName: QueueName): void {
  // Log when queue is ready
  queue.on('ready', () => {
    logger.info(`Queue ${queueName} is ready`, { queue: queueName });
  });
  
  // Log queue errors
  queue.on('error', (error: Error) => {
    logger.error(`Queue ${queueName} encountered an error`, { 
      queue: queueName,
      error: error?.message || String(error),
      stack: error?.stack
    });
  });
  
  // Log failed jobs
  queue.on('failed', (job: Bull.Job, error: Error) => {
    logger.error(`Job ${job?.id} in ${queueName} queue failed`, { 
      queue: queueName,
      jobId: job?.id,
      attemptsMade: job?.attemptsMade,
      error: error?.message || String(error),
      stack: error?.stack
    });
  });
  
  // Log completed jobs
  queue.on('completed', (job: Bull.Job) => {
    logger.debug(`Job ${job.id} in ${queueName} queue completed`, { 
      queue: queueName,
      jobId: job.id,
      processingTime: job.finishedOn! - job.processedOn!,
    });
  });
  
  // Log stalled jobs (those that have been locked for too long)
  queue.on('stalled', (jobId: string) => {
    logger.warn(`Job ${jobId} in ${queueName} queue stalled`, { 
      queue: queueName,
      jobId
    });
  });
  
  // Log active jobs
  queue.on('active', (job: Bull.Job) => {
    logger.debug(`Job ${job.id} in ${queueName} queue started processing`, { 
      queue: queueName,
      jobId: job.id
    });
  });
}

/**
 * Create a simple processor for less complex queue jobs
 * @param queueType Name of the queue for logging
 */
function simpleProcessor(queueType: string) {
  return async (job: Bull.Job): Promise<any> => {
    const { id, data } = job;
    
    logger.info(`Processing ${queueType} job ${id}`, { 
      jobId: id,
      queue: queueType,
      data 
    });
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Randomly fail to test error handling (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error(`Simulated error in ${queueType} processor`);
    }
    
    logger.info(`Completed ${queueType} job ${id}`, { 
      jobId: id,
      queue: queueType 
    });
    
    return { success: true, processedAt: new Date().toISOString() };
  };
}

/**
 * Close all queue connections gracefully
 * @returns Promise resolving when everything is closed
 */
export async function closeWorkers(): Promise<void> {
  logger.info('Closing all queue connections');
  
  const closePromises = Object.values(processedQueues).map(queue => queue.close());
  
  try {
    await Promise.all(closePromises);
    logger.info('All queue connections closed successfully');
  } catch (error) {
    logger.error('Error closing queue connections', { error });
    throw error;
  }
}

// Handle process termination - shut down gracefully
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing queues');
  await closeWorkers();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing queues');
  await closeWorkers();
  process.exit(0);
});

export default {
  initializeWorkers,
  closeWorkers,
  processedQueues,
};