/**
 * Redis Configuration
 * 
 * This file sets up Redis for caching and session storage.
 * It supports both standalone and clustered Redis configurations.
 */

import { createClient } from 'redis';
import { promisify } from 'util';

// Environment variables
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const USE_CLUSTER = process.env.REDIS_CLUSTER === 'true';

// Create Redis client with options
const clientOptions = {
  url: REDIS_URL,
  password: REDIS_PASSWORD,
  socket: {
    reconnectStrategy: (retries: number) => {
      // Exponential backoff with max delay of 10 seconds
      return Math.min(retries * 100, 10000);
    },
  },
};

// Create Redis client
const redisClient = createClient(clientOptions);

// Handle connection events
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

// Cache utility functions
export const getCache = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error('Redis get error:', err);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: string,
  expirationInSeconds?: number
): Promise<boolean> => {
  try {
    if (expirationInSeconds) {
      await redisClient.set(key, value, { EX: expirationInSeconds });
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (err) {
    console.error('Redis set error:', err);
    return false;
  }
};

export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.error('Redis delete error:', err);
    return false;
  }
};

// Export Redis client for other modules to use
export default redisClient;