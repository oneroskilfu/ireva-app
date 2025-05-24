/**
 * Queue System
 * 
 * This module provides a robust job queue system using Bull and Redis.
 * It supports retries, delays, priority, and concurrency control.
 * Includes monitoring, error handling, and dead-letter queues.
 */

import Bull, { Queue, QueueOptions, JobOptions } from 'bull';
import os from 'os';
import logger from '../logger';

// Queue names
export enum QueueName {
  EMAIL = 'email',
  ROI_DISTRIBUTION = 'roi-distribution',
  REPORT_GENERATION = 'report-generation',
  NOTIFICATION = 'notification',
  DATA_IMPORT = 'data-import',
  DATA_EXPORT = 'data-export',
}

// Queue registry - holds all created queues
const queues: Record<string, Queue> = {};

// Default Bull queue options
const defaultQueueOptions: QueueOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    // If using Sentinel
    ...(process.env.REDIS_MODE === 'sentinel' && process.env.REDIS_SENTINEL_URLS && {
      sentinels: process.env.REDIS_SENTINEL_URLS.split(',').map(url => {
        const parsedUrl = new URL(url);
        return {
          host: parsedUrl.hostname,
          port: parseInt(parsedUrl.port, 10),
        };
      }),
      name: process.env.REDIS_SENTINEL_NAME || 'mymaster',
    }),
  },
  // Prefix all queue keys
  prefix: process.env.QUEUE_PREFIX || 'ireva:queue:',
  // Enable stack traces to debug failed jobs
  stackTraceLimit: 10,
  // Default settings for all queues
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5 seconds initial delay
    },
    removeOnComplete: 100, // Keep the last 100 completed jobs
    removeOnFail: 200,     // Keep the last 200 failed jobs
  },
};

/**
 * Create or get a Bull queue
 * @param name Queue name
 * @param options Queue-specific options (optional)
 * @returns Bull queue instance
 */
export function getQueue(name: QueueName, options?: QueueOptions): Queue {
  // Return existing queue if already created
  if (queues[name]) {
    return queues[name];
  }

  // Create new queue with merged options
  const queueOptions = { ...defaultQueueOptions, ...options };
  const queue = new Bull(name, queueOptions);

  // Set up error handling
  queue.on('error', (error) => {
    logger.error(`Queue ${name} error`, { error, queue: name });
  });

  // Log when jobs complete
  queue.on('completed', (job, result) => {
    logger.debug(`Job ${job.id} completed in queue ${name}`, { 
      jobId: job.id,
      queue: name,
      result: typeof result === 'object' ? result : { data: result },
    });
  });

  // Log when jobs fail
  queue.on('failed', (job, error) => {
    logger.error(`Job ${job.id} failed in queue ${name}`, { 
      jobId: job?.id,
      queue: name,
      attemptsMade: job?.attemptsMade || 0,
      error: error?.message || String(error),
      stack: error?.stack,
    });
  });

  // Store queue in registry
  queues[name] = queue;
  
  logger.info(`Queue ${name} created`, { queue: name });
  return queue;
}

/**
 * Initialize all queues and return them
 * @returns Object containing all initialized queues
 */
export function initializeQueues() {
  // Initialize all queues in the QueueName enum
  Object.values(QueueName).forEach(name => {
    getQueue(name as QueueName);
  });

  return queues;
}

/**
 * Add a job to a queue
 * @param queueName Queue name
 * @param data Job data
 * @param options Job options
 * @returns Promise resolving to the created job
 */
export async function addJob(
  queueName: QueueName, 
  data: any,
  options?: JobOptions
): Promise<Bull.Job> {
  const queue = getQueue(queueName);
  
  try {
    // Log job creation attempt
    logger.debug(`Adding job to ${queueName} queue`, { 
      queue: queueName,
      data,
      options 
    });
    
    // Add job to queue
    const job = await queue.add(data, options);
    
    // Log job creation success
    logger.info(`Job ${job.id} added to ${queueName} queue`, { 
      jobId: job.id,
      queue: queueName 
    });
    
    return job;
  } catch (error) {
    // Log job creation failure
    logger.error(`Failed to add job to ${queueName} queue`, { 
      queue: queueName,
      data,
      options,
      error 
    });
    
    throw error;
  }
}

/**
 * Clear all jobs from a queue (use cautiously!)
 * @param queueName Queue name
 * @returns Promise resolving when queue is emptied
 */
export async function clearQueue(queueName: QueueName): Promise<void> {
  const queue = getQueue(queueName);
  
  logger.warn(`Clearing all jobs from ${queueName} queue`, { queue: queueName });
  
  try {
    await queue.empty();
    logger.info(`Queue ${queueName} cleared successfully`, { queue: queueName });
  } catch (error) {
    logger.error(`Failed to clear queue ${queueName}`, { queue: queueName, error });
    throw error;
  }
}

/**
 * Get queue statistics
 * @param queueName Queue name
 * @returns Promise resolving to queue stats
 */
export async function getQueueStats(queueName: QueueName) {
  const queue = getQueue(queueName);
  
  try {
    const [
      jobCounts,
      completedCount,
      failedCount,
      delayedCount,
      activeCount,
      waitingCount,
      pausedCount
    ] = await Promise.all([
      queue.getJobCounts(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getActiveCount(),
      queue.getWaitingCount(),
      queue.getPausedCount()
    ]);
    
    return {
      name: queueName,
      counts: jobCounts,
      completed: completedCount,
      failed: failedCount,
      delayed: delayedCount,
      active: activeCount,
      waiting: waitingCount,
      paused: pausedCount,
    };
  } catch (error) {
    logger.error(`Failed to get stats for queue ${queueName}`, { queue: queueName, error });
    throw error;
  }
}

/**
 * Get stats for all registered queues
 * @returns Promise resolving to stats for all queues
 */
export async function getAllQueueStats() {
  try {
    const stats = await Promise.all(
      Object.keys(queues).map(queueName => 
        getQueueStats(queueName as QueueName)
      )
    );
    
    return stats;
  } catch (error) {
    logger.error('Failed to get stats for all queues', { error });
    throw error;
  }
}

/**
 * Close all queue connections
 * @returns Promise resolving when all queues are closed
 */
export async function closeQueues(): Promise<void> {
  const closePromises = Object.values(queues).map(queue => queue.close());
  
  try {
    await Promise.all(closePromises);
    logger.info('All queues closed successfully');
  } catch (error) {
    logger.error('Error closing queues', { error });
    throw error;
  }
}

// Handle process termination - close queues gracefully
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing queues');
  await closeQueues();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing queues');
  await closeQueues();
  process.exit(0);
});

export default {
  getQueue,
  initializeQueues,
  addJob,
  clearQueue,
  getQueueStats,
  getAllQueueStats,
  closeQueues,
  QueueName,
};