/**
 * API Caching Middleware
 * 
 * This middleware provides Redis-based caching for API responses,
 * improving performance for frequently accessed data.
 */

import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
}

/**
 * Generates a cache key based on the request
 */
const generateCacheKey = (req: Request, keyPrefix: string = 'api'): string => {
  // Include tenant ID in cache key if present to ensure tenant isolation
  const tenantPrefix = req.tenant ? `tenant:${req.tenant.id}:` : '';
  
  // Build cache key from method, path, and query params
  const queryString = Object.keys(req.query).length 
    ? JSON.stringify(req.query) 
    : '';
  
  return `${keyPrefix}:${tenantPrefix}${req.method}:${req.originalUrl}:${queryString}`;
};

/**
 * Middleware to cache API responses
 * @param options Cache options including TTL and key prefix
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, keyPrefix = 'api:cache' } = options;
  
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests or authenticated requests if needed
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key
    const cacheKey = generateCacheKey(req, keyPrefix);
    
    try {
      // Check if response is in cache
      const cachedResponse = await getCache(cacheKey);
      
      if (cachedResponse) {
        // Parse the cached response
        const { statusCode, data, headers = {} } = JSON.parse(cachedResponse);
        
        // Set headers from cached response
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value as string);
        });
        
        // Set additional cache header
        res.setHeader('X-Cache', 'HIT');
        
        // Send cached response
        return res.status(statusCode).json(data);
      }
      
      // Cache miss, continue to actual handler
      res.setHeader('X-Cache', 'MISS');
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to intercept and cache the response
      res.json = function(data) {
        // Skip caching for error responses
        if (res.statusCode >= 400) {
          return originalJson.call(this, data);
        }
        
        // Prepare response for caching
        const responseToCache = {
          statusCode: res.statusCode,
          data,
          headers: {
            'Content-Type': res.getHeader('Content-Type'),
          },
        };
        
        // Cache the response
        setCache(cacheKey, JSON.stringify(responseToCache), ttl)
          .catch(err => console.error('Failed to cache response:', err));
        
        // Call original method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Middleware to invalidate cache for specific patterns
 * @param patterns Array of cache key patterns to invalidate
 */
export const invalidateCache = (patterns: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original end method
    const originalEnd = res.end;
    
    // Override end method to invalidate cache after successful operations
    res.end = function(...args) {
      // Only invalidate on successful mutations
      if (req.method !== 'GET' && res.statusCode >= 200 && res.statusCode < 300) {
        // Include tenant specific patterns if tenant context exists
        const tenantPatterns = req.tenant
          ? patterns.map(pattern => `*tenant:${req.tenant.id}:*${pattern}*`)
          : patterns.map(pattern => `*${pattern}*`);
        
        // Perform cache invalidation in background
        Promise.all(tenantPatterns.map(pattern => {
          // This would require a Redis SCAN command implementation
          // For simplicity, we'll assume there's a deleteByPattern function
          // which would need to be implemented in the redis.ts file
          console.log(`Invalidating cache pattern: ${pattern}`);
          // import { deleteByPattern } from '../redis';
          // return deleteByPattern(pattern);
        }))
        .catch(err => console.error('Failed to invalidate cache:', err));
      }
      
      // Call original method
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

export default cacheMiddleware;