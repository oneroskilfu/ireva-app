/**
 * Temporal Worker for iREVA
 * 
 * This file sets up the Temporal worker that executes the workflows and activities.
 */
import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import path from 'path';

// Worker factory function
export async function runTemporalWorker() {
  try {
    // Initialize worker
    const worker = await Worker.create({
      workflowsPath: path.join(__dirname, './workflows.js'),
      activities,
      taskQueue: 'ireva-financial-tasks'
    });

    // Log worker startup
    console.log('Temporal worker connecting...');
    
    // Start worker
    await worker.run();
    
    return worker;
  } catch (error) {
    console.error('Failed to start Temporal worker:', error);
    throw error;
  }
}