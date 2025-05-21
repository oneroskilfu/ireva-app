/**
 * Cache Manager
 * 
 * Provides multi-level caching for the iREVA platform:
 * - In-memory cache for fastest access
 * - Tiered caching strategies
 * - Automatic cache invalidation
 * - Cache statistics and monitoring
 */

// Try to import logger
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback logger
  logger = {
    info: (msg, category = 'CACHE') => console.log(`[${category}] ${msg}`),
    debug: (msg, category = 'CACHE') => console.debug(`[${category}] ${msg}`),
    warn: (msg, category = 'CACHE') => console.warn(`[${category}] ${msg}`),
    error: (msg, category = 'CACHE') => console.error(`[${category}] ${msg}`)
  };
}

// Try to import config
let config;
try {
  config = require('./config').config;
} catch (err) {
  // Default cache config
  config = {
    cache: {
      enabled: true,
      ttl: 60 * 1000, // 1 minute in milliseconds
      checkPeriod: 120 * 1000, // 2 minutes in milliseconds
      maxSize: 1000 // Maximum number of items
    }
  };
}

// Define cache types
const CACHE_TYPE = {
  MEMORY: 'memory',
  SESSION: 'session',
  API: 'api',
  DATABASE: 'database',
  USER: 'user',
  STATIC: 'static'
};

// Collection of caches by type
const cacheMap = new Map();

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  invalidations: 0,
  lastCleanup: null,
  byType: {}
};

/**
 * Initialize cache manager
 * @param {Object} options - Cache options
 * @returns {Object} - Cache manager instance
 */
function initializeCacheManager(options = {}) {
  // Merge options with defaults
  const cacheOptions = {
    enabled: options.enabled !== false,
    checkStatInterval: options.checkStatInterval || 60000, // 1 minute
    logStats: options.logStats !== false,
    cleanupInterval: options.cleanupInterval || 300000 // 5 minutes
  };
  
  logger.info(`Initializing cache manager (enabled: ${cacheOptions.enabled})`);
  
  // Initialize stats for each cache type
  Object.values(CACHE_TYPE).forEach(type => {
    cacheStats.byType[type] = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
      itemCount: 0,
      sizeEstimate: 0
    };
  });
  
  // Start statistic logging if enabled
  if (cacheOptions.enabled && cacheOptions.logStats) {
    setInterval(() => {
      logCacheStatistics();
    }, cacheOptions.checkStatInterval);
  }
  
  // Start periodic cleanup
  if (cacheOptions.enabled) {
    setInterval(() => {
      cleanupAllCaches();
    }, cacheOptions.cleanupInterval);
  }
  
  // Create default caches for each type
  Object.values(CACHE_TYPE).forEach(type => {
    createCache(type, getDefaultOptionsForType(type));
  });
  
  // Return cache manager
  return {
    // Get a cache instance by type
    getCache: (type = CACHE_TYPE.MEMORY) => {
      return getCacheInstance(type);
    },
    
    // Create a custom cache
    createCache: (name, options) => {
      return createCache(name, options);
    },
    
    // Get cache statistics
    getStats: () => {
      return { ...cacheStats };
    },
    
    // Clear all caches
    clearAll: () => {
      return clearAllCaches();
    },
    
    // Cache types enum
    CACHE_TYPE
  };
}

/**
 * Get default options for a cache type
 * @param {string} type - Cache type
 * @returns {Object} - Default options
 */
function getDefaultOptionsForType(type) {
  const baseOptions = {
    ttl: config.cache?.ttl || 60 * 1000, // 1 minute default
    maxSize: config.cache?.maxSize || 1000,
    checkPeriod: config.cache?.checkPeriod || 120 * 1000
  };
  
  // Customize options based on cache type
  switch (type) {
    case CACHE_TYPE.MEMORY:
      return baseOptions;
      
    case CACHE_TYPE.SESSION:
      return { 
        ...baseOptions,
        ttl: 30 * 60 * 1000 // 30 minutes
      };
      
    case CACHE_TYPE.API:
      return { 
        ...baseOptions,
        ttl: 5 * 60 * 1000 // 5 minutes
      };
      
    case CACHE_TYPE.DATABASE:
      return { 
        ...baseOptions,
        ttl: 2 * 60 * 1000 // 2 minutes
      };
      
    case CACHE_TYPE.USER:
      return { 
        ...baseOptions,
        ttl: 15 * 60 * 1000 // 15 minutes
      };
      
    case CACHE_TYPE.STATIC:
      return { 
        ...baseOptions,
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      };
    
    default:
      return baseOptions;
  }
}

/**
 * Create a new cache
 * @param {string} name - Cache name
 * @param {Object} options - Cache options
 * @returns {Object} - Cache instance
 */
function createCache(name, options = {}) {
  // Check if cache already exists
  if (cacheMap.has(name)) {
    return getCacheInstance(name);
  }
  
  // Merge with default options
  const cacheOptions = {
    ttl: options.ttl || 60 * 1000, // Default 1 minute
    maxSize: options.maxSize || 1000, // Default max 1000 items
    checkPeriod: options.checkPeriod || 120 * 1000, // Default check every 2 minutes
    namespace: options.namespace || name
  };
  
  // Create cache store (using Map for simplicity, could be replaced with more robust solution)
  const store = new Map();
  
  // Create metadata store for expiration times
  const metadata = new Map();
  
  // Create cache instance
  const cache = {
    // Get an item from the cache
    get: (key) => {
      const fullKey = `${cacheOptions.namespace}:${key}`;
      
      // Check if key exists and isn't expired
      if (store.has(fullKey)) {
        const meta = metadata.get(fullKey);
        
        // Check if item has expired
        if (meta.expires && meta.expires < Date.now()) {
          // Item expired, remove it
          store.delete(fullKey);
          metadata.delete(fullKey);
          
          // Track miss
          cacheStats.misses++;
          cacheStats.byType[name]?.misses++;
          
          return undefined;
        }
        
        // Item found and valid, return it
        meta.hits++;
        meta.lastAccessed = Date.now();
        
        // Track hit
        cacheStats.hits++;
        cacheStats.byType[name]?.hits++;
        
        return store.get(fullKey);
      }
      
      // Key not found
      cacheStats.misses++;
      cacheStats.byType[name]?.misses++;
      
      return undefined;
    },
    
    // Set an item in the cache
    set: (key, value, customTtl) => {
      const fullKey = `${cacheOptions.namespace}:${key}`;
      const now = Date.now();
      const ttl = customTtl || cacheOptions.ttl;
      
      // Check cache size limit
      if (!store.has(fullKey) && store.size >= cacheOptions.maxSize) {
        evictCacheItem(store, metadata, name);
      }
      
      // Store value
      store.set(fullKey, value);
      
      // Store metadata
      metadata.set(fullKey, {
        created: now,
        expires: ttl === 0 ? 0 : now + ttl, // 0 means no expiration
        lastAccessed: now,
        hits: 0,
        size: estimateSize(value)
      });
      
      // Track set
      cacheStats.sets++;
      cacheStats.byType[name]?.sets++;
      cacheStats.byType[name].itemCount = store.size;
      cacheStats.byType[name].sizeEstimate += estimateSize(value);
      
      return value;
    },
    
    // Check if key exists in cache
    has: (key) => {
      const fullKey = `${cacheOptions.namespace}:${key}`;
      
      // Check if key exists and isn't expired
      if (store.has(fullKey)) {
        const meta = metadata.get(fullKey);
        
        // Check if item has expired
        if (meta.expires && meta.expires < Date.now()) {
          // Item expired
          return false;
        }
        
        return true;
      }
      
      return false;
    },
    
    // Delete item from cache
    delete: (key) => {
      const fullKey = `${cacheOptions.namespace}:${key}`;
      
      // Check if key exists
      if (store.has(fullKey)) {
        const meta = metadata.get(fullKey);
        const itemSize = meta.size || 0;
        
        // Remove the item
        store.delete(fullKey);
        metadata.delete(fullKey);
        
        // Track item count and size
        cacheStats.byType[name].itemCount = store.size;
        cacheStats.byType[name].sizeEstimate -= itemSize;
        
        // Track invalidation
        cacheStats.invalidations++;
        cacheStats.byType[name]?.invalidations++;
        
        return true;
      }
      
      return false;
    },
    
    // Clear all items from this cache
    clear: () => {
      const itemCount = store.size;
      
      // Clear the stores
      store.clear();
      metadata.clear();
      
      // Update stats
      cacheStats.invalidations += itemCount;
      cacheStats.byType[name].invalidations += itemCount;
      cacheStats.byType[name].itemCount = 0;
      cacheStats.byType[name].sizeEstimate = 0;
      
      logger.info(`Cache ${name} cleared (${itemCount} items)`);
      
      return itemCount;
    },
    
    // Get cache stats
    stats: () => {
      return {
        name,
        size: store.size,
        options: { ...cacheOptions },
        hits: cacheStats.byType[name]?.hits || 0,
        misses: cacheStats.byType[name]?.misses || 0,
        sets: cacheStats.byType[name]?.sets || 0,
        invalidations: cacheStats.byType[name]?.invalidations || 0,
        sizeEstimate: cacheStats.byType[name]?.sizeEstimate || 0
      };
    },
    
    // Cleanup expired items
    cleanup: () => {
      return cleanupCache(store, metadata, name, cacheOptions);
    },
    
    // Cache options
    options: cacheOptions
  };
  
  // Store cache in map
  cacheMap.set(name, { cache, store, metadata });
  
  logger.info(`Cache created: ${name}, TTL: ${cacheOptions.ttl}ms, Max Size: ${cacheOptions.maxSize} items`);
  
  return cache;
}

/**
 * Get a cache instance by name
 * @param {string} name - Cache name
 * @returns {Object} - Cache instance
 */
function getCacheInstance(name) {
  // Check if cache exists
  if (!cacheMap.has(name)) {
    // Create cache with default options
    return createCache(name);
  }
  
  // Return existing cache
  return cacheMap.get(name).cache;
}

/**
 * Clean up expired items in a cache
 * @param {Map} store - Cache store
 * @param {Map} metadata - Cache metadata
 * @param {string} name - Cache name
 * @param {Object} options - Cache options
 * @returns {number} - Number of items removed
 */
function cleanupCache(store, metadata, name, options) {
  const now = Date.now();
  let removed = 0;
  
  // Find all expired keys
  const expiredKeys = [];
  for (const [key, meta] of metadata.entries()) {
    if (meta.expires && meta.expires < now) {
      expiredKeys.push(key);
    }
  }
  
  // Remove expired items
  for (const key of expiredKeys) {
    // Get item size before removing
    const meta = metadata.get(key);
    const itemSize = meta.size || 0;
    
    // Delete the item
    store.delete(key);
    metadata.delete(key);
    
    // Track size changes
    cacheStats.byType[name].sizeEstimate -= itemSize;
    
    removed++;
  }
  
  // Update item count
  cacheStats.byType[name].itemCount = store.size;
  
  // Log cleanup if items were removed
  if (removed > 0) {
    logger.debug(`Cache ${name} cleanup: removed ${removed} expired items, remaining: ${store.size}`);
  }
  
  return removed;
}

/**
 * Evict a cache item based on LRU policy
 * @param {Map} store - Cache store
 * @param {Map} metadata - Cache metadata
 * @param {string} name - Cache name
 * @returns {boolean} - Whether an item was evicted
 */
function evictCacheItem(store, metadata, name) {
  // If cache is empty, nothing to evict
  if (store.size === 0) {
    return false;
  }
  
  // Find the least recently used item
  let oldestKey = null;
  let oldestAccess = Date.now();
  
  for (const [key, meta] of metadata.entries()) {
    if (meta.lastAccessed < oldestAccess) {
      oldestAccess = meta.lastAccessed;
      oldestKey = key;
    }
  }
  
  // If we found an item to evict
  if (oldestKey) {
    // Get item size before removing
    const meta = metadata.get(oldestKey);
    const itemSize = meta.size || 0;
    
    // Delete the item
    store.delete(oldestKey);
    metadata.delete(oldestKey);
    
    // Update stats
    cacheStats.byType[name].itemCount = store.size;
    cacheStats.byType[name].sizeEstimate -= itemSize;
    
    return true;
  }
  
  return false;
}

/**
 * Cleanup all caches
 * @returns {number} - Total number of items removed
 */
function cleanupAllCaches() {
  let totalRemoved = 0;
  
  // Cleanup each cache
  for (const [name, { cache }] of cacheMap.entries()) {
    const removed = cache.cleanup();
    totalRemoved += removed;
  }
  
  // Update last cleanup time
  cacheStats.lastCleanup = new Date().toISOString();
  
  // Log cleanup if items were removed
  if (totalRemoved > 0) {
    logger.info(`Cache cleanup complete: removed ${totalRemoved} expired items across all caches`);
  }
  
  return totalRemoved;
}

/**
 * Clear all caches
 * @returns {number} - Total number of items cleared
 */
function clearAllCaches() {
  let totalCleared = 0;
  
  // Clear each cache
  for (const [name, { cache }] of cacheMap.entries()) {
    const cleared = cache.clear();
    totalCleared += cleared;
  }
  
  logger.info(`All caches cleared: ${totalCleared} total items removed`);
  
  return totalCleared;
}

/**
 * Log cache statistics
 */
function logCacheStatistics() {
  const totalItems = Object.values(cacheStats.byType).reduce((sum, stats) => sum + stats.itemCount, 0);
  const hitRate = (cacheStats.hits + cacheStats.misses) > 0 
    ? Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100) 
    : 0;
  
  logger.info(`Cache stats: ${totalItems} items, Hit rate: ${hitRate}%, Hits: ${cacheStats.hits}, Misses: ${cacheStats.misses}`);
  
  // Log detailed stats for each cache type with activity
  for (const [type, stats] of Object.entries(cacheStats.byType)) {
    if (stats.hits > 0 || stats.misses > 0 || stats.sets > 0) {
      const cacheHitRate = (stats.hits + stats.misses) > 0
        ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100)
        : 0;
      
      logger.debug(`Cache ${type}: ${stats.itemCount} items, Hit rate: ${cacheHitRate}%, Hits: ${stats.hits}, Misses: ${stats.misses}, Sets: ${stats.sets}`);
    }
  }
}

/**
 * Estimate the size of a value in bytes (approximate)
 * @param {any} value - Value to estimate size of
 * @returns {number} - Estimated size in bytes
 */
function estimateSize(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  
  const type = typeof value;
  
  if (type === 'boolean') {
    return 4;
  }
  
  if (type === 'number') {
    return 8;
  }
  
  if (type === 'string') {
    return value.length * 2; // Unicode chars are 2 bytes
  }
  
  if (type === 'object') {
    // Handle arrays
    if (Array.isArray(value)) {
      return value.reduce((size, item) => size + estimateSize(item), 0);
    }
    
    // Handle dates
    if (value instanceof Date) {
      return 8;
    }
    
    // Handle objects
    let size = 0;
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        size += key.length * 2; // Key size
        size += estimateSize(value[key]); // Value size
      }
    }
    return size;
  }
  
  // Default for other types
  return 8;
}

// Export functions
module.exports = {
  initializeCacheManager,
  CACHE_TYPE
};

// Support dual module usage
if (typeof exports !== 'undefined') {
  exports.initializeCacheManager = initializeCacheManager;
  exports.CACHE_TYPE = CACHE_TYPE;
}