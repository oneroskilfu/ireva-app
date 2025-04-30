/**
 * Redis Cache Service
 * 
 * This service provides real-time market data caching using Redis,
 * supporting high-performance data access for portfolios, property 
 * valuations, and market analytics.
 */

import Redis from 'ioredis';
import { getSocketIo } from '../socketio';

// Redis client
let redisClient: Redis | null = null;

// Default TTL values in seconds
const DEFAULT_TTL = 3600; // 1 hour
const MARKET_DATA_TTL = 300; // 5 minutes
const USER_DATA_TTL = 1800; // 30 minutes

/**
 * Initialize Redis connection
 */
export function initializeRedis() {
  try {
    // Use Redis URL from environment or fallback to localhost
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    redisClient.on('connect', () => {
      console.log('Redis connection established');
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    
    // Fallback to a mock implementation if Redis is unavailable
    return createMockRedisClient();
  }
}

/**
 * Get Redis client (initialize if needed)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = initializeRedis();
  }
  
  return redisClient;
}

/**
 * Create a mock Redis client for environments without Redis
 */
function createMockRedisClient() {
  console.warn('Using mock Redis client');
  
  const mockStorage = new Map<string, string>();
  const mockExpiry = new Map<string, number>();
  
  // Create a simple mock client
  const mockClient = {
    set: async (key: string, value: string, ...args: any[]): Promise<any> => {
      mockStorage.set(key, value);
      
      // Handle expiry if EX or PX is provided
      if (args.length >= 2) {
        if (args[0] === 'EX') {
          const expiryTime = Date.now() + (args[1] * 1000);
          mockExpiry.set(key, expiryTime);
        } else if (args[0] === 'PX') {
          const expiryTime = Date.now() + args[1];
          mockExpiry.set(key, expiryTime);
        }
      }
      
      return 'OK';
    },
    
    get: async (key: string): Promise<string | null> => {
      // Check if expired
      const expiry = mockExpiry.get(key);
      if (expiry && expiry < Date.now()) {
        mockStorage.delete(key);
        mockExpiry.delete(key);
        return null;
      }
      
      return mockStorage.get(key) || null;
    },
    
    del: async (key: string | string[]): Promise<number> => {
      const keys = Array.isArray(key) ? key : [key];
      let deleted = 0;
      
      for (const k of keys) {
        if (mockStorage.has(k)) {
          mockStorage.delete(k);
          mockExpiry.delete(k);
          deleted++;
        }
      }
      
      return deleted;
    },
    
    hset: async (key: string, field: string, value: string): Promise<number> => {
      const hashData = JSON.parse(mockStorage.get(key) || '{}');
      hashData[field] = value;
      mockStorage.set(key, JSON.stringify(hashData));
      return 1;
    },
    
    hget: async (key: string, field: string): Promise<string | null> => {
      // Check if expired
      const expiry = mockExpiry.get(key);
      if (expiry && expiry < Date.now()) {
        mockStorage.delete(key);
        mockExpiry.delete(key);
        return null;
      }
      
      const hashData = JSON.parse(mockStorage.get(key) || '{}');
      return hashData[field] || null;
    },
    
    hgetall: async (key: string): Promise<Record<string, string>> => {
      // Check if expired
      const expiry = mockExpiry.get(key);
      if (expiry && expiry < Date.now()) {
        mockStorage.delete(key);
        mockExpiry.delete(key);
        return {};
      }
      
      return JSON.parse(mockStorage.get(key) || '{}');
    },
    
    expire: async (key: string, seconds: number): Promise<number> => {
      if (mockStorage.has(key)) {
        mockExpiry.set(key, Date.now() + (seconds * 1000));
        return 1;
      }
      return 0;
    },
    
    // Add more mock methods as needed
    
    on: (event: string, callback: Function) => {
      if (event === 'connect') {
        setTimeout(() => callback(), 0);
      }
      return mockClient;
    }
  } as unknown as Redis;
  
  return mockClient;
}

/**
 * Set a value in the cache
 */
export async function setCacheValue(
  key: string, 
  value: any, 
  ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
  try {
    const redis = getRedisClient();
    const serializedValue = typeof value === 'object' 
      ? JSON.stringify(value) 
      : String(value);
    
    await redis.set(key, serializedValue, 'EX', ttlSeconds);
  } catch (error) {
    console.error(`Redis cache set error for key ${key}:`, error);
  }
}

/**
 * Get a value from the cache
 */
export async function getCacheValue<T = any>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const value = await redis.get(key);
    
    if (!value) {
      return null;
    }
    
    try {
      // Try to parse as JSON
      return JSON.parse(value) as T;
    } catch {
      // Return as is if not JSON
      return value as unknown as T;
    }
  } catch (error) {
    console.error(`Redis cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Remove a value from the cache
 */
export async function removeCacheValue(key: string): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.del(key);
  } catch (error) {
    console.error(`Redis cache remove error for key ${key}:`, error);
  }
}

/**
 * Cache market data
 */
export async function cacheMarketData(
  region: string,
  propertyType: string,
  data: any
): Promise<void> {
  const key = `market:${region}:${propertyType}`;
  await setCacheValue(key, data, MARKET_DATA_TTL);
  
  // Also cache in a collection
  try {
    const redis = getRedisClient();
    await redis.hset('market_data', `${region}:${propertyType}`, JSON.stringify(data));
  } catch (error) {
    console.error('Redis hset error for market data:', error);
  }
}

/**
 * Get cached market data
 */
export async function getCachedMarketData(
  region: string,
  propertyType: string
): Promise<any | null> {
  const key = `market:${region}:${propertyType}`;
  return getCacheValue(key);
}

/**
 * Cache property valuation
 */
export async function cachePropertyValuation(
  propertyId: string,
  valuationData: any
): Promise<void> {
  const key = `valuation:${propertyId}`;
  await setCacheValue(key, valuationData, MARKET_DATA_TTL);
  
  // Notify subscribers about the update
  const io = getSocketIo();
  if (io) {
    io.to(`property:${propertyId}`).emit('valuation-updated', {
      propertyId,
      valuation: valuationData,
      timestamp: new Date()
    });
  }
}

/**
 * Get cached property valuation
 */
export async function getCachedPropertyValuation(
  propertyId: string
): Promise<any | null> {
  const key = `valuation:${propertyId}`;
  return getCacheValue(key);
}

/**
 * Cache user portfolio data
 */
export async function cacheUserPortfolio(
  userId: string,
  portfolioData: any
): Promise<void> {
  const key = `portfolio:${userId}`;
  await setCacheValue(key, portfolioData, USER_DATA_TTL);
}

/**
 * Get cached user portfolio data
 */
export async function getCachedUserPortfolio(
  userId: string
): Promise<any | null> {
  const key = `portfolio:${userId}`;
  return getCacheValue(key);
}

/**
 * Cache with automatic fallback to database
 */
export async function cachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL
): Promise<T> {
  // Try to get from cache
  const cachedData = await getCacheValue<T>(cacheKey);
  
  if (cachedData !== null) {
    return cachedData;
  }
  
  // If not in cache, fetch from database
  const data = await fetchFn();
  
  // Cache the result
  await setCacheValue(cacheKey, data, ttlSeconds);
  
  return data;
}

/**
 * Cache invalidation by pattern (using scan for production Redis)
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedisClient();
    
    // In a mock Redis implementation, we do a simple match
    if (!(redis instanceof Redis)) {
      const mockRedis = redis as any;
      const keys = Array.from(mockRedis.mockStorage.keys())
        .filter(key => key.includes(pattern));
      
      if (keys.length > 0) {
        await redis.del(keys);
      }
      return;
    }
    
    // For a real Redis instance, use scan
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor, 
        'MATCH', 
        pattern, 
        'COUNT', 
        '100'
      );
      
      cursor = nextCursor;
      
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    console.error(`Redis cache invalidation error for pattern ${pattern}:`, error);
  }
}