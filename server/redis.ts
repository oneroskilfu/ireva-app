/**
 * Redis Configuration
 * 
 * This file sets up Redis for caching and session storage.
 * It supports Sentinel for high availability and automatic failover.
 */

import { createClient, RedisClientType } from 'redis';

// Environment variables with production defaults
const REDIS_MODE = process.env.REDIS_MODE || 'standalone'; // 'standalone', 'sentinel', or 'cluster'
const REDIS_URL = process.env.REDIS_URL; // Will be set via environment variables in production
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_SENTINEL_NAME = process.env.REDIS_SENTINEL_NAME || 'mymaster';
const REDIS_SENTINEL_URLS = (process.env.REDIS_SENTINEL_URLS || '')
  .split(',')
  .filter(url => url.trim() !== '');
const REDIS_KEY_PREFIX = process.env.REDIS_KEY_PREFIX || 'ireva:';

// Connection options for different Redis modes
const connectionOptions = () => {
  // Basic connection options shared by all modes
  const options: any = {
    socket: {
      reconnectStrategy: (retries: number) => {
        // Limit retries to prevent endless reconnection spam
        if (retries > 3) {
          console.log('Redis connection failed after 3 retries, giving up for graceful degradation');
          return false; // Stop retrying
        }
        // Exponential backoff with max delay of 5 seconds for faster startup
        return Math.min(retries * 500, 5000);
      },
      connectTimeout: 5000, // Reduced timeout for faster startup
    }
  };
  
  // Add password if provided
  if (REDIS_PASSWORD) {
    options.password = REDIS_PASSWORD;
  }
  
  // Configure based on selected mode
  switch (REDIS_MODE) {
    case 'sentinel':
      if (REDIS_SENTINEL_URLS.length === 0) {
        console.warn('Sentinel mode selected but no sentinel URLs provided. Falling back to standalone.');
        return { ...options, url: REDIS_URL };
      }
      
      return {
        ...options,
        sentinel: {
          name: REDIS_SENTINEL_NAME,
          sentinels: REDIS_SENTINEL_URLS.map(url => {
            const parsedUrl = new URL(url);
            return {
              host: parsedUrl.hostname,
              port: parseInt(parsedUrl.port || '26379', 10)
            };
          }),
          password: REDIS_PASSWORD
        }
      };
      
    case 'cluster':
      console.warn('Redis Cluster mode not fully implemented, falling back to standalone');
      return { ...options, url: REDIS_URL };
      
    case 'standalone':
    default:
      return { ...options, url: REDIS_URL };
  }
};

// Create Redis client with appropriate options
const redisClient: RedisClientType = createClient(connectionOptions());

// Handle connection events
redisClient.on('connect', () => {
  console.log(`Redis client connected in ${REDIS_MODE} mode`);
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

// Enhanced graceful fallback for production deployment
let redisConnected = false;
const REDIS_GRACEFUL_FALLBACK = process.env.REDIS_GRACEFUL_FALLBACK === 'true';

// Only attempt Redis connection if URL is provided
const initializeRedis = async () => {
  if (!REDIS_URL) {
    console.log('No REDIS_URL provided, using memory sessions for session storage');
    redisConnected = false;
    return;
  }

  try {
    if (REDIS_GRACEFUL_FALLBACK) {
      // In production, attempt connection but don't fail if Redis unavailable
      const connectPromise = redisClient.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      redisConnected = true;
      console.log('Redis connection established successfully with external provider');
    } else {
      await redisClient.connect();
      redisConnected = true;
      console.log('Redis connection established successfully');
    }
  } catch (err) {
    console.log('Redis connection failed, using memory sessions for graceful degradation:', err.message);
    redisConnected = false;
  }
};

// Initialize Redis connection
initializeRedis();

// Cache utility functions
export const getCache = async (key: string): Promise<string | null> => {
  if (!redisConnected) return null;
  
  try {
    const prefixedKey = `${REDIS_KEY_PREFIX}${key}`;
    return await redisClient.get(prefixedKey);
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
  if (!redisConnected) return false;
  
  try {
    const prefixedKey = `${REDIS_KEY_PREFIX}${key}`;
    if (expirationInSeconds) {
      await redisClient.set(prefixedKey, value, { EX: expirationInSeconds });
    } else {
      await redisClient.set(prefixedKey, value);
    }
    return true;
  } catch (err) {
    console.error('Redis set error:', err);
    return false;
  }
};

export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    const prefixedKey = `${REDIS_KEY_PREFIX}${key}`;
    await redisClient.del(prefixedKey);
    return true;
  } catch (err) {
    console.error('Redis delete error:', err);
    return false;
  }
};

/**
 * Delete keys matching a pattern using Redis SCAN
 * This is useful for cache invalidation of related items
 */
export const deleteCacheByPattern = async (pattern: string): Promise<number> => {
  try {
    const prefixedPattern = `${REDIS_KEY_PREFIX}${pattern}`;
    let cursor = 0;
    let deletedCount = 0;
    
    // SCAN approach is more efficient than KEYS for production systems
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: prefixedPattern,
        COUNT: 100
      });
      
      cursor = reply.cursor;
      
      if (reply.keys.length > 0) {
        await redisClient.del(reply.keys);
        deletedCount += reply.keys.length;
      }
    } while (cursor !== 0);
    
    return deletedCount;
  } catch (err) {
    console.error('Redis pattern delete error:', err);
    return 0;
  }
};

/**
 * Set multiple cache entries in a single operation
 */
export const setCacheMulti = async (
  entries: Array<{ key: string; value: string; expiration?: number }>
): Promise<boolean> => {
  try {
    // Use multi/exec for atomic operations
    const multi = redisClient.multi();
    
    for (const entry of entries) {
      const prefixedKey = `${REDIS_KEY_PREFIX}${entry.key}`;
      if (entry.expiration) {
        multi.set(prefixedKey, entry.value, { EX: entry.expiration });
      } else {
        multi.set(prefixedKey, entry.value);
      }
    }
    
    await multi.exec();
    return true;
  } catch (err) {
    console.error('Redis multi set error:', err);
    return false;
  }
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (err) {
    console.error('Redis health check failed:', err);
    return false;
  }
};

// Export Redis client for other modules to use
export default redisClient;