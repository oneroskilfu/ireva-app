/**
 * Health Check Routes
 * 
 * This module provides API routes for monitoring system health:
 * - GET /api/health - Get overall system health status
 * - GET /api/health/redis - Get Redis connection status
 * - GET /api/health/database - Get database connection status
 */

import { Router } from 'express';
import { healthCheck as redisHealthCheck } from '../redis';
import { checkSessionStoreHealth } from '../session';
import { pool } from '../db';

const router = Router();

// Overall health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealthy = await checkDatabaseHealth();
    
    // Check Redis connection
    const redisHealthy = await redisHealthCheck();
    
    // Check session store
    const sessionStoreHealthy = await checkSessionStoreHealth();
    
    // Determine overall health status
    const healthy = dbHealthy && redisHealthy && sessionStoreHealthy;
    
    // Return health status
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
        sessionStore: sessionStoreHealthy ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Failed to check system health',
    });
  }
});

// Redis health check endpoint
router.get('/health/redis', async (req, res) => {
  try {
    const healthy = await redisHealthCheck();
    
    res.status(healthy ? 200 : 503).json({
      service: 'redis',
      status: healthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Redis health check error:', error);
    res.status(500).json({
      service: 'redis',
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Failed to check Redis health',
    });
  }
});

// Database health check endpoint
router.get('/health/database', async (req, res) => {
  try {
    const healthy = await checkDatabaseHealth();
    
    res.status(healthy ? 200 : 503).json({
      service: 'database',
      status: healthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({
      service: 'database',
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Failed to check database health',
    });
  }
});

// Database health check helper
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default router;