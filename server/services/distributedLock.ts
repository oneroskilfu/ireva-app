/**
 * Distributed Lock Service
 * 
 * This service provides distributed locking capabilities for critical financial operations
 * to prevent race conditions and ensure data consistency across multiple server instances.
 */

import { getRedisClient } from './redisCache';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Default lock settings
const DEFAULT_LOCK_TTL = 30000; // 30 seconds
const DEFAULT_RETRY_DELAY = 200; // 200 ms
const DEFAULT_RETRY_COUNT = 25; // 5 seconds total retry time
const LOCK_EXTENSION_INTERVAL = 10000; // 10 seconds

// Track active locks for cleanup
interface ActiveLock {
  resource: string;
  token: string;
  expireAt: number;
  extensionInterval?: NodeJS.Timeout;
}

const activeLocks = new Map<string, ActiveLock>();

/**
 * Initialize lock tracking tables
 */
export async function initializeDistributedLocks() {
  // Create lock_history table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lock_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      resource_key VARCHAR(200) NOT NULL,
      lock_token VARCHAR(100) NOT NULL,
      acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      released_at TIMESTAMP WITH TIME ZONE,
      timeout_ms INTEGER NOT NULL,
      owner_id VARCHAR(100),
      success BOOLEAN
    )
  `);
  
  console.log('Distributed lock system initialized');
  
  // Setup periodic cleanup of stale locks
  setInterval(cleanupStaleLocks, 60000); // Run every minute
}

/**
 * Acquire a distributed lock
 */
export async function acquireLock(
  resource: string,
  options: {
    ttl?: number;
    retryCount?: number;
    retryDelay?: number;
    ownerId?: string;
  } = {}
): Promise<string | null> {
  const {
    ttl = DEFAULT_LOCK_TTL,
    retryCount = DEFAULT_RETRY_COUNT,
    retryDelay = DEFAULT_RETRY_DELAY,
    ownerId
  } = options;
  
  const redis = getRedisClient();
  const lockToken = uuidv4();
  const lockKey = `lock:${resource}`;
  
  // Try to acquire the lock
  for (let i = 0; i <= retryCount; i++) {
    try {
      // Use SET NX (only set if not exists) with expiry
      const result = await redis.set(
        lockKey,
        lockToken,
        'PX', // Set expiry in milliseconds
        ttl,
        'NX' // Only set if not exists
      );
      
      if (result === 'OK') {
        // Lock acquired successfully
        
        // Record the lock acquisition in history
        await recordLockAcquisition(resource, lockToken, ttl, ownerId, true);
        
        // Track the active lock for cleanup
        const activelock: ActiveLock = {
          resource,
          token: lockToken,
          expireAt: Date.now() + ttl
        };
        
        // Setup automatic lock extension if ttl > extension interval
        if (ttl > LOCK_EXTENSION_INTERVAL) {
          activelock.extensionInterval = setInterval(
            () => extendLock(resource, lockToken, ttl),
            LOCK_EXTENSION_INTERVAL
          );
        }
        
        activeLocks.set(lockKey, activelock);
        
        return lockToken;
      }
      
      // Lock not acquired, retry after delay if attempts remain
      if (i < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      console.error(`Error acquiring lock for ${resource}:`, error);
      
      // Last attempt failed
      if (i === retryCount) {
        await recordLockAcquisition(resource, lockToken, ttl, ownerId, false);
        return null;
      }
    }
  }
  
  // All attempts failed
  await recordLockAcquisition(resource, lockToken, ttl, ownerId, false);
  return null;
}

/**
 * Release a distributed lock
 */
export async function releaseLock(
  resource: string,
  lockToken: string
): Promise<boolean> {
  const redis = getRedisClient();
  const lockKey = `lock:${resource}`;
  
  try {
    // Only release if the lock token matches (using Lua script for atomicity)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await redis.eval(script, 1, lockKey, lockToken);
    
    // Clean up active lock tracking
    const activeLock = activeLocks.get(lockKey);
    if (activeLock && activeLock.extensionInterval) {
      clearInterval(activeLock.extensionInterval);
    }
    activeLocks.delete(lockKey);
    
    // Record lock release
    await recordLockRelease(resource, lockToken);
    
    return result === 1;
  } catch (error) {
    console.error(`Error releasing lock for ${resource}:`, error);
    return false;
  }
}

/**
 * Extend an existing lock's TTL
 */
async function extendLock(
  resource: string, 
  lockToken: string,
  ttl: number
): Promise<boolean> {
  const redis = getRedisClient();
  const lockKey = `lock:${resource}`;
  
  try {
    // Only extend if the lock token matches (using Lua script for atomicity)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("pexpire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    
    const result = await redis.eval(script, 1, lockKey, lockToken, ttl);
    
    // Update the expiry tracking
    if (result === 1) {
      const activeLock = activeLocks.get(lockKey);
      if (activeLock) {
        activeLock.expireAt = Date.now() + ttl;
      }
    }
    
    return result === 1;
  } catch (error) {
    console.error(`Error extending lock for ${resource}:`, error);
    return false;
  }
}

/**
 * Clean up stale locks
 */
async function cleanupStaleLocks() {
  const now = Date.now();
  
  for (const [lockKey, lock] of activeLocks.entries()) {
    if (lock.expireAt < now) {
      try {
        // Clear any extension interval
        if (lock.extensionInterval) {
          clearInterval(lock.extensionInterval);
        }
        
        // Remove from tracking
        activeLocks.delete(lockKey);
        
        // Record forced release
        await recordLockRelease(lock.resource, lock.token);
      } catch (error) {
        console.error(`Error cleaning up stale lock ${lockKey}:`, error);
      }
    }
  }
}

/**
 * Record lock acquisition in history
 */
async function recordLockAcquisition(
  resource: string,
  lockToken: string,
  ttl: number,
  ownerId?: string,
  success: boolean = true
) {
  try {
    await db.execute(sql`
      INSERT INTO lock_history (
        resource_key, lock_token, timeout_ms, owner_id, success
      ) VALUES (
        ${resource}, ${lockToken}, ${ttl}, ${ownerId || null}, ${success}
      )
    `);
  } catch (error) {
    console.error('Failed to record lock acquisition:', error);
  }
}

/**
 * Record lock release in history
 */
async function recordLockRelease(resource: string, lockToken: string) {
  try {
    await db.execute(sql`
      UPDATE lock_history
      SET released_at = NOW()
      WHERE resource_key = ${resource} AND lock_token = ${lockToken} AND released_at IS NULL
    `);
  } catch (error) {
    console.error('Failed to record lock release:', error);
  }
}

/**
 * Execute a critical operation with a distributed lock
 */
export async function withLock<T>(
  resource: string,
  operation: () => Promise<T>,
  options: {
    ttl?: number;
    retryCount?: number;
    retryDelay?: number;
    ownerId?: string;
    fallback?: () => Promise<T>;
  } = {}
): Promise<T> {
  const lockToken = await acquireLock(resource, options);
  
  if (!lockToken) {
    if (options.fallback) {
      return options.fallback();
    }
    throw new Error(`Failed to acquire lock for resource: ${resource}`);
  }
  
  try {
    return await operation();
  } finally {
    await releaseLock(resource, lockToken);
  }
}

/**
 * Example for financial operations
 */
export async function processFinancialTransaction(
  userId: string,
  transactionId: string,
  operation: () => Promise<any>
) {
  return withLock(
    `user:${userId}:transaction`,
    operation,
    {
      ttl: 60000, // 1 minute
      ownerId: `transaction:${transactionId}`,
      fallback: async () => {
        throw new Error('Transaction in progress, please try again later');
      }
    }
  );
}

/**
 * Example for investment operations
 */
export async function processInvestment(
  userId: string,
  propertyId: string,
  operation: () => Promise<any>
) {
  return withLock(
    `property:${propertyId}:invest`,
    operation,
    {
      ttl: 120000, // 2 minutes
      ownerId: `user:${userId}`,
      fallback: async () => {
        throw new Error('Another investment is in progress for this property');
      }
    }
  );
}