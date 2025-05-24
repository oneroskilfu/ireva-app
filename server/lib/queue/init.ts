/**
 * Queue System Initialization
 * 
 * This module handles initializing the queue system, including queues and workers.
 * It provides a single entry point for starting and stopping the entire queue system.
 */

import logger from '../logger';
import { initializeQueues, closeQueues } from './index';
import { initializeWorkers, closeWorkers } from './worker';

let initialized = false;
let shutdownInProgress = false;

/**
 * Initialize the entire queue system
 * @param options Configuration options
 * @returns Promise resolving when queues and workers are initialized
 */
export async function initializeQueueSystem(options: {
  workerConcurrency?: number;
  startWorkers?: boolean;
} = {}): Promise<void> {
  if (initialized) {
    logger.info('Queue system already initialized');
    return;
  }
  
  const { workerConcurrency = 2, startWorkers = true } = options;
  
  try {
    logger.info('Initializing queue system', { startWorkers, workerConcurrency });
    
    // Initialize all queues first
    const queues = initializeQueues();
    logger.info('Queues initialized', { queueCount: Object.keys(queues).length });
    
    // Initialize workers if requested
    if (startWorkers) {
      const workers = initializeWorkers(workerConcurrency);
      logger.info('Queue workers initialized', { workerCount: Object.keys(workers).length });
    }
    
    initialized = true;
    logger.info('Queue system initialization complete');
  } catch (error) {
    logger.error('Failed to initialize queue system', { error });
    throw error;
  }
}

/**
 * Gracefully shut down the queue system
 * @returns Promise resolving when everything is closed
 */
export async function shutdownQueueSystem(): Promise<void> {
  if (!initialized) {
    logger.info('Queue system not initialized, nothing to shut down');
    return;
  }
  
  if (shutdownInProgress) {
    logger.info('Queue system shutdown already in progress');
    return;
  }
  
  shutdownInProgress = true;
  
  try {
    logger.info('Shutting down queue system');
    
    // Close workers first to stop processing new jobs
    await closeWorkers();
    
    // Then close queue connections
    await closeQueues();
    
    initialized = false;
    shutdownInProgress = false;
    logger.info('Queue system shutdown complete');
  } catch (error) {
    logger.error('Error during queue system shutdown', { error });
    shutdownInProgress = false;
    throw error;
  }
}

// Handle process termination - shut down gracefully
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down queue system');
  await shutdownQueueSystem();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down queue system');
  await shutdownQueueSystem();
  process.exit(0);
});

export default {
  initializeQueueSystem,
  shutdownQueueSystem,
};