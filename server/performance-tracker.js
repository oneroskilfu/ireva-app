/**
 * Performance Tracking System
 * 
 * Provides detailed performance monitoring for the iREVA platform:
 * - Request timing and profiling
 * - Endpoint performance metrics
 * - Resource utilization tracking
 * - Performance alerts and thresholds
 */

// Import dependencies with fallbacks
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback logger
  logger = {
    info: (msg, category = 'PERF') => console.log(`[${category}] ${msg}`),
    debug: (msg, category = 'PERF') => console.debug(`[${category}] ${msg}`),
    warn: (msg, category = 'PERF') => console.warn(`[${category}] ${msg}`),
    error: (msg, category = 'PERF') => console.error(`[${category}] ${msg}`)
  };
}

// Default performance tracker options
const DEFAULT_OPTIONS = {
  enabled: true,
  logLevel: 'standard',            // 'none', 'minimal', 'standard', 'verbose'
  enableMiddleware: true,          // Register Express middleware
  sampleRate: 1.0,                 // Track 100% of requests by default
  slowRequestThreshold: 1000,      // Log warnings for requests slower than 1s
  resourceMonitoringEnabled: true, // Track system resources
  resourceCheckInterval: 60000,    // Check resources every minute
  retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours of data retention
  endpointThresholds: {            // Custom thresholds by endpoint (overrides global)
    '/api/heavy': 5000,            // 5s threshold for heavy endpoints
    '/api/light': 200              // 200ms threshold for light endpoints
  }
};

// Store performance metrics
const performanceMetrics = {
  requests: {
    total: 0,
    active: 0,
    completed: 0,
    failed: 0,
    totalDuration: 0
  },
  requestTimes: [],
  endpoints: {},
  slowRequests: [],
  resourceUsage: [],
  operationTimes: {},
  startTime: Date.now()
};

// Maximum number of slow requests to track
const MAX_SLOW_REQUESTS = 100;

// Maximum number of resource usage points to track
const MAX_RESOURCE_POINTS = 60;

// Current resource monitoring interval
let resourceMonitorInterval = null;

/**
 * Initialize performance tracking
 * @param {Object} app - Express app (optional, for middleware)
 * @param {Object} options - Performance tracking options
 * @returns {Object} - Performance tracker instance
 */
function initializePerformanceTracker(app, options = {}) {
  // Merge options with defaults
  const trackerOptions = { ...DEFAULT_OPTIONS, ...options };
  
  logger.info(`Initializing performance tracker (enabled: ${trackerOptions.enabled})`);
  
  // Reset all metrics
  resetMetrics();
  
  // Register Express middleware if provided and enabled
  if (app && trackerOptions.enableMiddleware) {
    registerPerformanceMiddleware(app, trackerOptions);
    logger.info('Performance middleware registered');
  }
  
  // Start resource monitoring if enabled
  if (trackerOptions.resourceMonitoringEnabled) {
    startResourceMonitoring(trackerOptions.resourceCheckInterval);
  }
  
  // Create performance tracker instance
  const tracker = {
    // Start tracking an operation
    startOperation: (name, context = {}) => {
      return startOperationTracking(name, context, trackerOptions);
    },
    
    // Track request explicitly (for non-Express apps)
    trackRequest: (req, duration, statusCode, route) => {
      return trackRequestPerformance({
        method: req.method,
        url: req.url,
        route: route || req.route?.path || 'unknown',
        statusCode,
        duration,
        contentLength: req.headers['content-length']
      }, trackerOptions);
    },
    
    // Get current performance metrics
    getMetrics: () => {
      return getPerformanceMetrics();
    },
    
    // Reset performance metrics
    resetMetrics: () => {
      resetMetrics();
      logger.info('Performance metrics reset');
    },
    
    // Register a custom endpoint threshold
    setEndpointThreshold: (endpoint, threshold) => {
      trackerOptions.endpointThresholds[endpoint] = threshold;
    },
    
    // Get slow requests
    getSlowRequests: () => {
      return [...performanceMetrics.slowRequests];
    },
    
    // Get endpoint metrics
    getEndpointMetrics: (endpoint) => {
      if (endpoint) {
        return performanceMetrics.endpoints[endpoint] || null;
      }
      return { ...performanceMetrics.endpoints };
    },
    
    // Get resource usage metrics
    getResourceMetrics: () => {
      return [...performanceMetrics.resourceUsage];
    }
  };
  
  return tracker;
}

/**
 * Register Express middleware for performance tracking
 * @param {Object} app - Express app
 * @param {Object} options - Tracker options
 */
function registerPerformanceMiddleware(app, options) {
  app.use((req, res, next) => {
    // Skip tracking based on sample rate
    if (Math.random() > options.sampleRate) {
      return next();
    }
    
    // Record request start time
    const startTime = Date.now();
    
    // Track active request
    performanceMetrics.requests.active++;
    performanceMetrics.requests.total++;
    
    // Track response
    const originalEnd = res.end;
    
    res.end = function() {
      // Calculate duration
      const duration = Date.now() - startTime;
      
      // Get route if available
      const route = req.route?.path || req.path || 'unknown';
      
      // Track completed request
      performanceMetrics.requests.active--;
      
      if (res.statusCode >= 400) {
        performanceMetrics.requests.failed++;
      } else {
        performanceMetrics.requests.completed++;
      }
      
      performanceMetrics.requests.totalDuration += duration;
      
      // Track request performance
      trackRequestPerformance({
        method: req.method,
        url: req.originalUrl || req.url,
        route,
        statusCode: res.statusCode,
        duration,
        contentLength: res.getHeader('content-length')
      }, options);
      
      // Call original end method
      return originalEnd.apply(this, arguments);
    };
    
    next();
  });
}

/**
 * Track request performance metrics
 * @param {Object} reqInfo - Request information
 * @param {Object} options - Tracker options
 */
function trackRequestPerformance(reqInfo, options) {
  // Extract request info
  const { method, url, route, statusCode, duration, contentLength } = reqInfo;
  
  // Create endpoint key for grouping
  const endpoint = route !== 'unknown' ? route : url.split('?')[0];
  
  // Initialize endpoint metrics if needed
  if (!performanceMetrics.endpoints[endpoint]) {
    performanceMetrics.endpoints[endpoint] = {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      successCount: 0,
      errorCount: 0,
      statusCodes: {},
      methods: {}
    };
  }
  
  // Update endpoint metrics
  const endpointMetrics = performanceMetrics.endpoints[endpoint];
  endpointMetrics.count++;
  endpointMetrics.totalDuration += duration;
  endpointMetrics.averageDuration = endpointMetrics.totalDuration / endpointMetrics.count;
  endpointMetrics.minDuration = Math.min(endpointMetrics.minDuration, duration);
  endpointMetrics.maxDuration = Math.max(endpointMetrics.maxDuration, duration);
  
  // Track status codes
  const statusCategory = Math.floor(statusCode / 100) * 100;
  endpointMetrics.statusCodes[statusCode] = (endpointMetrics.statusCodes[statusCode] || 0) + 1;
  
  // Track success/error counts
  if (statusCode < 400) {
    endpointMetrics.successCount++;
  } else {
    endpointMetrics.errorCount++;
  }
  
  // Track HTTP methods
  endpointMetrics.methods[method] = (endpointMetrics.methods[method] || 0) + 1;
  
  // Add to request times array for percentile calculations
  performanceMetrics.requestTimes.push(duration);
  
  // Limit the size of request times array (keep most recent)
  if (performanceMetrics.requestTimes.length > 1000) {
    performanceMetrics.requestTimes.shift();
  }
  
  // Check for slow requests
  const threshold = options.endpointThresholds[endpoint] || options.slowRequestThreshold;
  
  if (duration > threshold) {
    // Log slow request
    if (options.logLevel !== 'none') {
      logger.warn(`Slow request: ${method} ${endpoint} (${duration}ms, threshold: ${threshold}ms)`);
    }
    
    // Add to slow requests list
    performanceMetrics.slowRequests.unshift({
      timestamp: Date.now(),
      method,
      endpoint,
      duration,
      statusCode,
      threshold
    });
    
    // Limit the size of slow requests list
    if (performanceMetrics.slowRequests.length > MAX_SLOW_REQUESTS) {
      performanceMetrics.slowRequests.pop();
    }
  }
  
  // Detailed logging if enabled
  if (options.logLevel === 'verbose') {
    logger.debug(`Request: ${method} ${endpoint} completed in ${duration}ms (status: ${statusCode})`);
  }
}

/**
 * Start tracking an operation for performance
 * @param {string} name - Operation name
 * @param {Object} context - Operation context
 * @param {Object} options - Tracker options
 * @returns {Object} - Operation tracker
 */
function startOperationTracking(name, context = {}, options) {
  const startTime = Date.now();
  
  // Initialize operation metrics if needed
  if (!performanceMetrics.operationTimes[name]) {
    performanceMetrics.operationTimes[name] = {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      checkpoints: {}
    };
  }
  
  // Track checkpoints
  const checkpoints = [];
  
  // Create operation tracker
  return {
    // Add a checkpoint
    checkpoint: (checkpointName) => {
      const elapsed = Date.now() - startTime;
      const previousTime = checkpoints.length > 0 ? checkpoints[checkpoints.length - 1].time : 0;
      
      // Create checkpoint
      const checkpoint = {
        name: checkpointName,
        time: elapsed,
        delta: elapsed - previousTime
      };
      
      // Add to checkpoints array
      checkpoints.push(checkpoint);
      
      // Track in metrics if in verbose mode
      if (options.logLevel === 'verbose') {
        // Initialize checkpoint metrics if needed
        if (!performanceMetrics.operationTimes[name].checkpoints[checkpointName]) {
          performanceMetrics.operationTimes[name].checkpoints[checkpointName] = {
            count: 0,
            totalTime: 0,
            averageTime: 0
          };
        }
        
        const checkpointMetrics = performanceMetrics.operationTimes[name].checkpoints[checkpointName];
        checkpointMetrics.count++;
        checkpointMetrics.totalTime += checkpoint.delta;
        checkpointMetrics.averageTime = checkpointMetrics.totalTime / checkpointMetrics.count;
      }
      
      // Log checkpoint if in verbose mode
      if (options.logLevel === 'verbose') {
        logger.debug(`${name} - Checkpoint ${checkpointName}: ${elapsed}ms (delta: ${checkpoint.delta}ms)`);
      }
      
      return checkpoint;
    },
    
    // End operation tracking
    end: (additionalContext = {}) => {
      const duration = Date.now() - startTime;
      const opMetrics = performanceMetrics.operationTimes[name];
      
      // Update operation metrics
      opMetrics.count++;
      opMetrics.totalDuration += duration;
      opMetrics.averageDuration = opMetrics.totalDuration / opMetrics.count;
      opMetrics.minDuration = Math.min(opMetrics.minDuration, duration);
      opMetrics.maxDuration = Math.max(opMetrics.maxDuration, duration);
      
      // Log operation completion
      if (options.logLevel === 'standard' || options.logLevel === 'verbose') {
        logger.debug(`Operation ${name} completed in ${duration}ms`);
      }
      
      // Return operation data
      return {
        name,
        duration,
        checkpoints,
        context: { ...context, ...additionalContext }
      };
    }
  };
}

/**
 * Start monitoring system resources
 * @param {number} interval - Check interval in ms
 */
function startResourceMonitoring(interval) {
  // Clear any existing interval
  if (resourceMonitorInterval) {
    clearInterval(resourceMonitorInterval);
  }
  
  // Initial check
  checkSystemResources();
  
  // Set up interval
  resourceMonitorInterval = setInterval(() => {
    checkSystemResources();
  }, interval);
  
  logger.info(`Resource monitoring started (interval: ${interval}ms)`);
}

/**
 * Check and record system resources
 */
function checkSystemResources() {
  try {
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Get resource metrics
    const metrics = {
      timestamp: Date.now(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round((memoryUsage.external || 0) / 1024 / 1024), // MB
        heapUtilization: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100) // Percentage
      },
      cpu: {
        // We can't get accurate CPU usage in pure Node.js
        // This would require additional modules or child process calls
        usage: 'unavailable'
      },
      load: {
        activeRequests: performanceMetrics.requests.active,
        requestRate: calculateRequestRate()
      }
    };
    
    // Add to resource usage array
    performanceMetrics.resourceUsage.unshift(metrics);
    
    // Limit the size of resource usage array
    if (performanceMetrics.resourceUsage.length > MAX_RESOURCE_POINTS) {
      performanceMetrics.resourceUsage.pop();
    }
    
    // Check for high memory usage
    if (metrics.memory.heapUtilization > 85) {
      logger.warn(`High memory utilization: ${metrics.memory.heapUtilization}%, ${metrics.memory.heapUsed}/${metrics.memory.heapTotal} MB`);
    }
  } catch (error) {
    logger.error(`Error checking system resources: ${error.message}`);
  }
}

/**
 * Calculate current request rate (requests per second)
 * @returns {number} - Requests per second
 */
function calculateRequestRate() {
  // If we have less than 2 resource points, we can't calculate rate
  if (performanceMetrics.resourceUsage.length < 2) {
    return 0;
  }
  
  // Get previous point
  const current = performanceMetrics.requests.total;
  const previous = performanceMetrics.previousTotal || 0;
  
  // Calculate time difference in seconds
  const timeDiff = (performanceMetrics.resourceUsage[0].timestamp - 
                    performanceMetrics.resourceUsage[1].timestamp) / 1000;
  
  // Calculate rate
  const rate = timeDiff > 0 ? (current - previous) / timeDiff : 0;
  
  // Store current total for next calculation
  performanceMetrics.previousTotal = current;
  
  return Math.round(rate * 100) / 100; // Round to 2 decimal places
}

/**
 * Get current performance metrics
 * @returns {Object} - Performance metrics
 */
function getPerformanceMetrics() {
  // Calculate overall average response time
  const avgResponseTime = performanceMetrics.requests.completed > 0
    ? Math.round(performanceMetrics.requests.totalDuration / performanceMetrics.requests.completed)
    : 0;
  
  // Calculate uptime
  const uptime = Math.round((Date.now() - performanceMetrics.startTime) / 1000);
  
  // Calculate percentiles if we have enough data
  const percentiles = calculatePercentiles();
  
  // Get top 5 slowest endpoints
  const slowestEndpoints = Object.entries(performanceMetrics.endpoints)
    .sort((a, b) => b[1].averageDuration - a[1].averageDuration)
    .slice(0, 5)
    .map(([endpoint, metrics]) => ({
      endpoint,
      averageDuration: Math.round(metrics.averageDuration),
      count: metrics.count
    }));
  
  // Get top 5 most used endpoints
  const mostUsedEndpoints = Object.entries(performanceMetrics.endpoints)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([endpoint, metrics]) => ({
      endpoint,
      count: metrics.count,
      averageDuration: Math.round(metrics.averageDuration)
    }));
  
  // Recent resource usage
  const recentResourceUsage = performanceMetrics.resourceUsage.length > 0
    ? performanceMetrics.resourceUsage[0]
    : null;
  
  // Return formatted metrics
  return {
    summary: {
      totalRequests: performanceMetrics.requests.total,
      completedRequests: performanceMetrics.requests.completed,
      failedRequests: performanceMetrics.requests.failed,
      activeRequests: performanceMetrics.requests.active,
      avgResponseTime,
      uptime,
      startTime: new Date(performanceMetrics.startTime).toISOString()
    },
    percentiles,
    slowestEndpoints,
    mostUsedEndpoints,
    slowRequests: performanceMetrics.slowRequests.length,
    resources: recentResourceUsage
      ? {
          memory: recentResourceUsage.memory,
          requestRate: recentResourceUsage.load.requestRate
        }
      : null
  };
}

/**
 * Calculate response time percentiles
 * @returns {Object} - Percentile values
 */
function calculatePercentiles() {
  // If we don't have enough data, return empty percentiles
  if (performanceMetrics.requestTimes.length < 5) {
    return {
      p50: 0,
      p90: 0,
      p95: 0,
      p99: 0
    };
  }
  
  // Sort request times
  const sorted = [...performanceMetrics.requestTimes].sort((a, b) => a - b);
  
  // Calculate percentiles
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p90: sorted[Math.floor(sorted.length * 0.9)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

/**
 * Reset all performance metrics
 */
function resetMetrics() {
  performanceMetrics.requests = {
    total: 0,
    active: 0,
    completed: 0,
    failed: 0,
    totalDuration: 0
  };
  performanceMetrics.requestTimes = [];
  performanceMetrics.endpoints = {};
  performanceMetrics.slowRequests = [];
  performanceMetrics.operationTimes = {};
  performanceMetrics.startTime = Date.now();
  // Keep resource usage history
}

/**
 * Get performance metrics for health checks
 * @returns {Object} - Health-related performance metrics
 */
function getHealthMetrics() {
  const metrics = getPerformanceMetrics();
  
  // Determine health status
  let status = 'healthy';
  let issues = [];
  
  // Check for memory issues
  if (metrics.resources && metrics.resources.memory.heapUtilization > 85) {
    status = 'warning';
    issues.push('high_memory_usage');
  }
  
  // Check for slow response times
  if (metrics.percentiles.p95 > 1000) {
    status = status === 'healthy' ? 'warning' : status;
    issues.push('slow_response_times');
  }
  
  // Check for error rate
  const errorRate = metrics.summary.failedRequests / 
                   (metrics.summary.completedRequests + metrics.summary.failedRequests) * 100;
  
  if (errorRate > 10) {
    status = 'critical';
    issues.push('high_error_rate');
  }
  
  return {
    status,
    issues,
    metrics: {
      requestRate: metrics.resources ? metrics.resources.requestRate : 0,
      responseTime: metrics.percentiles.p95,
      errorRate: Math.round(errorRate * 100) / 100,
      memory: metrics.resources ? metrics.resources.memory.heapUtilization : 0
    }
  };
}

// Export functions
module.exports = {
  initializePerformanceTracker,
  getHealthMetrics
};

// Support dual module usage
if (typeof exports !== 'undefined') {
  exports.initializePerformanceTracker = initializePerformanceTracker;
  exports.getHealthMetrics = getHealthMetrics;
}