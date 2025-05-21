/**
 * Database Connection Monitor
 * 
 * Provides active monitoring of database connections with:
 * - Connection pool metrics
 * - Query tracking
 * - Automatic leak detection
 * - Performance analysis
 */

// Import dependencies with fallbacks
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback logger
  logger = {
    info: (msg, category = 'DB-MONITOR') => console.log(`[${category}] ${msg}`),
    debug: (msg, category = 'DB-MONITOR') => console.debug(`[${category}] ${msg}`),
    warn: (msg, category = 'DB-MONITOR') => console.warn(`[${category}] ${msg}`),
    error: (msg, category = 'DB-MONITOR') => console.error(`[${category}] ${msg}`)
  };
}

// Default monitor options
const DEFAULT_OPTIONS = {
  monitorInterval: 30000,        // 30 seconds between checks
  leakDetectionThreshold: 30000, // 30 seconds threshold for potential leaks
  logLevel: 'standard',          // 'none', 'minimal', 'standard', 'verbose'
  trackQueries: true,            // Track query metrics
  sampleSize: 100,               // Max queries to keep in history
  queryTimeThreshold: 500,       // Log warnings for queries slower than this (ms)
  healthEndpoint: true,          // Expose metrics on health endpoint
  autofix: {
    enabled: false,              // Auto-fix leaks by default is disabled
    maxLeakAge: 120000,          // Only fix leaks older than 2 minutes
    maxIdleConnections: 3        // Max idle connections to maintain
  }
};

// Connection pool metrics history
const metricsHistory = [];

// Maximum history points to keep
const MAX_HISTORY_POINTS = 60; // 30 minute history with default interval

// Query history for performance monitoring
const queryHistory = [];

// Active connection tracking for leak detection
const activeConnections = new Map();

// Running monitor interval reference
let monitorInterval = null;

/**
 * Initialize database connection monitoring
 * @param {Object} pool - Database connection pool
 * @param {Object} options - Monitoring options
 * @returns {Object} - Connection monitor instance
 */
function initializeConnectionMonitor(pool, options = {}) {
  // Make sure we have a valid pool
  if (!pool) {
    logger.error('No database pool provided for monitoring');
    return null;
  }
  
  // Validate pool interface
  const isValidPool = typeof pool.totalCount === 'function' ||
                     typeof pool.idleCount === 'function' ||
                     pool.options || 
                     pool.totalCount !== undefined ||
                     pool.idleCount !== undefined;
  
  if (!isValidPool) {
    logger.warn('Pool object may not be compatible with connection monitoring');
  }
  
  // Merge options with defaults
  const monitorOptions = { ...DEFAULT_OPTIONS, ...options };
  
  logger.info(`Initializing DB connection monitor (interval: ${monitorOptions.monitorInterval}ms)`);
  
  // Initialize monitoring
  const monitor = {
    // Start continuous monitoring
    start: () => startMonitoring(pool, monitorOptions),
    
    // Stop monitoring
    stop: () => stopMonitoring(),
    
    // Get current metrics
    getMetrics: () => getCurrentMetrics(pool),
    
    // Get historical metrics
    getMetricsHistory: () => [...metricsHistory],
    
    // Get query history
    getQueryHistory: () => [...queryHistory],
    
    // Run a single check immediately
    check: () => checkPoolStatus(pool, monitorOptions),
    
    // Reset metrics history
    resetHistory: () => {
      metricsHistory.length = 0;
      logger.info('Connection metrics history reset');
    },
    
    // Track a query execution
    trackQuery: (query, duration, success = true) => {
      if (monitorOptions.trackQueries) {
        trackQueryExecution(query, duration, success, monitorOptions);
      }
    },
    
    // Register a new active connection
    registerConnection: (id, context = {}) => {
      if (monitorOptions.leakDetectionThreshold > 0) {
        registerActiveConnection(id, context);
      }
    },
    
    // Release a tracked connection
    releaseConnection: (id) => {
      if (monitorOptions.leakDetectionThreshold > 0) {
        releaseActiveConnection(id);
      }
    }
  };
  
  // Start monitoring if interval is positive
  if (monitorOptions.monitorInterval > 0) {
    monitor.start();
  } else {
    // Run initial check
    monitor.check();
  }
  
  return monitor;
}

/**
 * Start continuous monitoring
 * @param {Object} pool - Database connection pool
 * @param {Object} options - Monitoring options
 */
function startMonitoring(pool, options) {
  // Stop any existing monitoring
  stopMonitoring();
  
  // Run initial check
  checkPoolStatus(pool, options);
  
  // Start interval for regular checks
  monitorInterval = setInterval(() => {
    checkPoolStatus(pool, options);
  }, options.monitorInterval);
  
  logger.info(`Connection monitoring started, interval: ${options.monitorInterval}ms`);
  
  return true;
}

/**
 * Stop continuous monitoring
 */
function stopMonitoring() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    logger.info('Connection monitoring stopped');
    return true;
  }
  
  return false;
}

/**
 * Check current pool status
 * @param {Object} pool - Database connection pool
 * @param {Object} options - Monitoring options
 * @returns {Object} - Current metrics
 */
function checkPoolStatus(pool, options) {
  // Get current metrics
  const metrics = getCurrentMetrics(pool);
  
  // Store metrics in history
  metricsHistory.unshift({
    timestamp: Date.now(),
    ...metrics
  });
  
  // Limit history size
  if (metricsHistory.length > MAX_HISTORY_POINTS) {
    metricsHistory.length = MAX_HISTORY_POINTS;
  }
  
  // Log metrics based on log level
  logPoolMetrics(metrics, options.logLevel);
  
  // Check for connection leaks
  if (options.leakDetectionThreshold > 0) {
    checkForConnectionLeaks(options);
  }
  
  // Auto-fix issues if enabled
  if (options.autofix && options.autofix.enabled) {
    autofixPoolIssues(pool, metrics, options.autofix);
  }
  
  return metrics;
}

/**
 * Get current connection pool metrics
 * @param {Object} pool - Database connection pool
 * @returns {Object} - Current metrics
 */
function getCurrentMetrics(pool) {
  const metrics = {
    total: 0,
    active: 0,
    idle: 0,
    waiting: 0,
    maxConnections: 0,
    utilizationRate: 0,
    status: 'unknown'
  };
  
  try {
    // Handle different pool interfaces
    if (typeof pool.totalCount === 'function') {
      // Pg pool
      metrics.total = pool.totalCount();
      metrics.idle = pool.idleCount();
      metrics.active = metrics.total - metrics.idle;
      metrics.waiting = pool.waitingCount ? pool.waitingCount() : 0;
      metrics.maxConnections = pool.options ? pool.options.max : 10;
    } else if (pool.pool && typeof pool.pool.totalCount === 'function') {
      // Wrapped pg pool
      metrics.total = pool.pool.totalCount();
      metrics.idle = pool.pool.idleCount();
      metrics.active = metrics.total - metrics.idle;
      metrics.waiting = pool.pool.waitingCount ? pool.pool.waitingCount() : 0;
      metrics.maxConnections = pool.pool.options ? pool.pool.options.max : 10;
    } else if (pool.totalCount !== undefined) {
      // Direct properties
      metrics.total = pool.totalCount || 0;
      metrics.idle = pool.idleCount || 0;
      metrics.active = metrics.total - metrics.idle;
      metrics.waiting = pool.waitingCount || 0;
      metrics.maxConnections = pool.options ? pool.options.max : 10;
    } else if (pool._clients && Array.isArray(pool._clients)) {
      // Direct access to internal clients array (not recommended but fallback)
      metrics.total = pool._clients.length;
      metrics.idle = pool._clients.filter(c => !c._activeQuery).length;
      metrics.active = metrics.total - metrics.idle;
      metrics.waiting = pool._pendingQueue ? pool._pendingQueue.length : 0;
      metrics.maxConnections = pool.options ? pool.options.max : 10;
    } else {
      // Generic object with stats
      metrics.total = pool.total || 0;
      metrics.idle = pool.idle || 0;
      metrics.active = pool.active || metrics.total - metrics.idle;
      metrics.waiting = pool.waiting || 0;
      metrics.maxConnections = pool.max || 10;
    }
    
    // Calculate utilization rate
    metrics.utilizationRate = metrics.maxConnections > 0 
      ? Math.round((metrics.total / metrics.maxConnections) * 100) 
      : 0;
    
    // Determine status
    if (metrics.waiting > 0) {
      metrics.status = 'waiting';
    } else if (metrics.utilizationRate > 90) {
      metrics.status = 'high';
    } else if (metrics.utilizationRate > 70) {
      metrics.status = 'medium';
    } else {
      metrics.status = 'healthy';
    }
  } catch (error) {
    logger.error(`Error getting pool metrics: ${error.message}`);
    metrics.error = error.message;
  }
  
  return metrics;
}

/**
 * Log pool metrics based on log level
 * @param {Object} metrics - Pool metrics
 * @param {string} logLevel - Log level
 */
function logPoolMetrics(metrics, logLevel) {
  if (logLevel === 'none') {
    return;
  }
  
  if (logLevel === 'minimal') {
    logger.info(`DB Pool: ${metrics.active}/${metrics.total} active, ${metrics.idle} idle, ${metrics.waiting} waiting`);
    return;
  }
  
  if (logLevel === 'standard' || logLevel === 'verbose') {
    logger.info(`DB Pool: ${metrics.status}, ${metrics.active}/${metrics.total} active, ${metrics.utilizationRate}% utilization, ${metrics.waiting} waiting`);
  }
  
  if (logLevel === 'verbose') {
    logger.debug(`DB Pool details: max=${metrics.maxConnections}, active=${metrics.active}, idle=${metrics.idle}, total=${metrics.total}, waiting=${metrics.waiting}`);
  }
}

/**
 * Track a query execution
 * @param {string} query - Query text or identifier
 * @param {number} duration - Query duration in ms
 * @param {boolean} success - Whether query was successful
 * @param {Object} options - Monitor options
 */
function trackQueryExecution(query, duration, success, options) {
  // Only keep query text up to 100 characters
  const queryText = typeof query === 'string' 
    ? query.substring(0, 100) 
    : 'Unknown query';
  
  const queryInfo = {
    query: queryText,
    duration,
    timestamp: Date.now(),
    success
  };
  
  // Add to history
  queryHistory.unshift(queryInfo);
  
  // Limit history size
  if (queryHistory.length > options.sampleSize) {
    queryHistory.pop();
  }
  
  // Log slow queries
  if (duration > options.queryTimeThreshold) {
    logger.warn(`Slow query detected (${duration}ms): ${queryText.substring(0, 50)}...`);
  }
}

/**
 * Register an active database connection
 * @param {string} id - Connection ID
 * @param {Object} context - Connection context
 */
function registerActiveConnection(id, context = {}) {
  activeConnections.set(id, {
    id,
    startTime: Date.now(),
    context
  });
}

/**
 * Release a tracked connection
 * @param {string} id - Connection ID
 */
function releaseActiveConnection(id) {
  activeConnections.delete(id);
}

/**
 * Check for potential connection leaks
 * @param {Object} options - Monitor options
 */
function checkForConnectionLeaks(options) {
  const now = Date.now();
  const leakThreshold = options.leakDetectionThreshold;
  let potentialLeaks = 0;
  
  // Check each active connection
  for (const [id, connection] of activeConnections.entries()) {
    const connectionAge = now - connection.startTime;
    
    if (connectionAge > leakThreshold) {
      potentialLeaks++;
      
      // Log details of potential leak
      const context = connection.context || {};
      logger.warn(`Potential connection leak detected (${id}): Age=${Math.round(connectionAge / 1000)}s, Context=${JSON.stringify(context)}`);
    }
  }
  
  if (potentialLeaks > 0) {
    logger.warn(`Found ${potentialLeaks} potential connection leaks`);
  }
}

/**
 * Attempt to automatically fix pool issues
 * @param {Object} pool - Database connection pool
 * @param {Object} metrics - Current metrics
 * @param {Object} options - Autofix options
 */
function autofixPoolIssues(pool, metrics, options) {
  // Check for connection leaks to auto-release
  const now = Date.now();
  let fixedLeaks = 0;
  
  // Only proceed if we have more than the max desired idle connections
  if (metrics.idle > options.maxIdleConnections) {
    // Find very old connections that might be leaks
    for (const [id, connection] of activeConnections.entries()) {
      const connectionAge = now - connection.startTime;
      
      if (connectionAge > options.maxLeakAge) {
        // Attempt to force release the connection
        try {
          releaseActiveConnection(id);
          fixedLeaks++;
        } catch (error) {
          logger.error(`Failed to auto-release leaked connection ${id}: ${error.message}`);
        }
      }
    }
    
    if (fixedLeaks > 0) {
      logger.info(`Auto-fixed ${fixedLeaks} leaked connections`);
    }
  }
}

/**
 * Get connection monitor health metrics for health checks
 * @returns {Object} - Health metrics
 */
function getHealthMetrics() {
  // Current metrics - latest in history or empty
  const current = metricsHistory.length > 0 ? metricsHistory[0] : {
    status: 'unknown',
    active: 0,
    total: 0,
    idle: 0,
    waiting: 0,
    utilizationRate: 0
  };
  
  // Last 5 minutes of history
  const recentHistory = metricsHistory.slice(0, 10);
  
  // Calculate averages from recent history
  const avgUtilization = recentHistory.length > 0
    ? Math.round(recentHistory.reduce((sum, m) => sum + m.utilizationRate, 0) / recentHistory.length)
    : 0;
  
  const avgActive = recentHistory.length > 0
    ? Math.round(recentHistory.reduce((sum, m) => sum + m.active, 0) / recentHistory.length)
    : 0;
  
  // Determine health status
  let healthStatus = 'healthy';
  
  if (current.waiting > 0) {
    healthStatus = 'warning';
  }
  
  if (current.status === 'high' && avgUtilization > 90) {
    healthStatus = 'critical';
  }
  
  // Count potential leaks
  const potentialLeaks = activeConnections.size;
  
  return {
    status: healthStatus,
    current: {
      active: current.active,
      idle: current.idle,
      total: current.total,
      waiting: current.waiting,
      utilizationRate: current.utilizationRate
    },
    average: {
      utilizationRate: avgUtilization,
      active: avgActive
    },
    activeConnections: activeConnections.size,
    potentialLeaks
  };
}

// Export functions
module.exports = {
  initializeConnectionMonitor,
  getHealthMetrics
};

// Support dual module usage
if (typeof exports !== 'undefined') {
  exports.initializeConnectionMonitor = initializeConnectionMonitor;
  exports.getHealthMetrics = getHealthMetrics;
}