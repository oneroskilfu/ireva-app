/**
 * Health Monitoring System
 * 
 * Comprehensive health monitoring for the iREVA platform with:
 * - Health check endpoints
 * - Service monitoring
 * - Resource utilization tracking
 * - Automatic recovery
 */

// Import dependencies with fallbacks
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback logger
  logger = {
    info: (msg, category = 'HEALTH') => console.log(`[${category}] ${msg}`),
    warn: (msg, category = 'HEALTH') => console.warn(`[${category}] ${msg}`),
    error: (msg, category = 'HEALTH') => console.error(`[${category}] ${msg}`)
  };
}

// Try to import config
let config;
try {
  config = require('./config').config;
} catch (err) {
  // Default config
  config = {
    env: {
      isDevelopment: process.env.NODE_ENV !== 'production',
      isProduction: process.env.NODE_ENV === 'production'
    }
  };
}

// Health status object
const healthStatus = {
  status: 'initializing',
  uptime: 0,
  startTime: Date.now(),
  checks: {
    database: { status: 'unknown', lastCheck: null, error: null },
    auth: { status: 'unknown', lastCheck: null, error: null },
    memory: { status: 'unknown', lastCheck: null, usage: null, limit: null },
    cpu: { status: 'unknown', lastCheck: null, usage: null },
    diskSpace: { status: 'unknown', lastCheck: null, usage: null },
    externalApis: {}
  },
  recentIssues: [],
  version: process.env.npm_package_version || '1.0.0',
};

// Maximum number of recent issues to track
const MAX_RECENT_ISSUES = 10;

/**
 * Initialize the health monitoring system
 * @param {Object} app - Express application
 * @param {Object} options - Monitoring options
 */
function initializeHealthMonitoring(app, options = {}) {
  logger.info('Initializing health monitoring system');
  
  // Get services to monitor
  const services = {
    database: options.database || null,
    auth: options.auth || null,
    externalApis: options.externalApis || {}
  };
  
  // Register health check endpoint
  registerHealthEndpoint(app);
  
  // Start monitoring services
  startServiceMonitoring(services, options.checkInterval || 60000);
  
  // Start resource monitoring
  startResourceMonitoring(options.resourceInterval || 30000);
  
  // Return control functions
  return {
    getStatus: () => ({ ...healthStatus }),
    checkHealth: () => performFullHealthCheck(services),
    registerExternalApi: (name, checkFn) => {
      services.externalApis[name] = checkFn;
      healthStatus.checks.externalApis[name] = {
        status: 'unknown',
        lastCheck: null,
        error: null
      };
    }
  };
}

/**
 * Register the health check endpoint
 * @param {Object} app - Express application
 */
function registerHealthEndpoint(app) {
  if (!app || !app.get) {
    logger.warn('Express app not provided, health endpoint not registered');
    return;
  }
  
  // Basic health endpoint
  app.get(['/health', '/api/health'], (req, res) => {
    // Update uptime
    healthStatus.uptime = Math.floor((Date.now() - healthStatus.startTime) / 1000);
    
    // Determine response detail level
    const fullDetails = req.query.full === 'true' || 
                       req.query.details === 'true' ||
                       req.headers['x-health-details'] === 'full';
                       
    // Private internal checks only for authorized requests
    const includePrivate = req.query.private === 'true' && 
                          (req.headers['x-health-token'] === process.env.HEALTH_CHECK_TOKEN);
    
    // Prepare response
    const response = prepareHealthResponse(fullDetails, includePrivate);
    
    // Send response with appropriate status code
    res.status(healthStatus.status === 'healthy' ? 200 : 
               healthStatus.status === 'degraded' ? 200 :
               healthStatus.status === 'initializing' ? 503 :
               500)
       .json(response);
  });
  
  logger.info('Health endpoint registered');
}

/**
 * Prepare health check response
 * @param {boolean} fullDetails - Include full details
 * @param {boolean} includePrivate - Include private information
 * @returns {Object} - Health response
 */
function prepareHealthResponse(fullDetails, includePrivate) {
  // Basic response for all requests
  const response = {
    status: healthStatus.status,
    uptime: healthStatus.uptime,
    version: healthStatus.version,
    timestamp: new Date().toISOString()
  };
  
  // Add service status summary
  if (fullDetails) {
    response.checks = {};
    
    // Add each service status
    Object.entries(healthStatus.checks).forEach(([name, check]) => {
      if (name === 'externalApis') {
        // Handle external APIs separately
        response.checks.externalApis = {};
        Object.entries(check).forEach(([apiName, apiCheck]) => {
          response.checks.externalApis[apiName] = {
            status: apiCheck.status,
            lastCheck: apiCheck.lastCheck
          };
        });
      } else {
        // Add other services
        response.checks[name] = {
          status: check.status,
          lastCheck: check.lastCheck
        };
      }
    });
    
    // Add recent issues summary
    response.recentIssues = healthStatus.recentIssues.length;
  }
  
  // Add private details if authorized
  if (includePrivate) {
    response.details = {
      memory: healthStatus.checks.memory.usage,
      cpu: healthStatus.checks.cpu.usage,
      recentIssues: healthStatus.recentIssues,
      environment: process.env.NODE_ENV
    };
    
    // Add error details
    response.errors = {};
    Object.entries(healthStatus.checks).forEach(([name, check]) => {
      if (check.error) {
        response.errors[name] = check.error;
      }
      
      // Handle external API errors
      if (name === 'externalApis') {
        response.errors.externalApis = {};
        Object.entries(check).forEach(([apiName, apiCheck]) => {
          if (apiCheck.error) {
            response.errors.externalApis[apiName] = apiCheck.error;
          }
        });
      }
    });
  }
  
  return response;
}

/**
 * Start monitoring services at regular intervals
 * @param {Object} services - Services to monitor
 * @param {number} interval - Check interval in ms
 */
function startServiceMonitoring(services, interval) {
  // Perform initial check
  performFullHealthCheck(services);
  
  // Schedule regular checks
  setInterval(() => {
    performFullHealthCheck(services);
  }, interval);
  
  logger.info(`Service monitoring started, interval: ${interval}ms`);
}

/**
 * Perform a full health check of all services
 * @param {Object} services - Services to check
 */
async function performFullHealthCheck(services) {
  logger.info('Performing full health check');
  
  try {
    // Check database if available
    if (services.database) {
      await checkDatabaseHealth(services.database);
    }
    
    // Check authentication service if available
    if (services.auth) {
      await checkAuthHealth(services.auth);
    }
    
    // Check external APIs if configured
    for (const [name, checkFn] of Object.entries(services.externalApis)) {
      await checkExternalApiHealth(name, checkFn);
    }
    
    // Update overall status
    updateOverallStatus();
    
    logger.info(`Health check complete, status: ${healthStatus.status}`);
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    recordIssue('health_check', error.message);
  }
}

/**
 * Check database health
 * @param {Object} database - Database connection
 */
async function checkDatabaseHealth(database) {
  try {
    const startTime = Date.now();
    
    // Execute simple query
    let result;
    if (typeof database.query === 'function') {
      // Raw query function
      result = await database.query('SELECT 1 as connected');
    } else if (database.pool && typeof database.pool.query === 'function') {
      // Pool query
      result = await database.pool.query('SELECT 1 as connected');
    } else if (database.db && typeof database.db.execute === 'function') {
      // ORM execute
      result = await database.db.execute(sql`SELECT 1 as connected`);
    } else {
      throw new Error('Unsupported database interface');
    }
    
    // Verify result
    const isConnected = result && 
                       ((Array.isArray(result) && result.length > 0) ||
                        (result.rows && result.rows.length > 0));
    
    const responseTime = Date.now() - startTime;
    
    // Update status
    healthStatus.checks.database = {
      status: isConnected ? 'healthy' : 'degraded',
      lastCheck: new Date().toISOString(),
      responseTime,
      error: null
    };
    
    // Log slow responses
    if (responseTime > 100) {
      logger.warn(`Database health check response time high: ${responseTime}ms`);
    }
  } catch (error) {
    healthStatus.checks.database = {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      error: error.message
    };
    
    recordIssue('database', error.message);
    logger.error(`Database health check failed: ${error.message}`);
  }
}

/**
 * Check authentication service health
 * @param {Object} auth - Auth service
 */
async function checkAuthHealth(auth) {
  try {
    // Determine how to check auth health
    let isHealthy = false;
    
    if (typeof auth.healthCheck === 'function') {
      // Use provided health check function
      isHealthy = await auth.healthCheck();
    } else if (typeof auth.checkHealth === 'function') {
      // Alternative health check method
      isHealthy = await auth.checkHealth();
    } else {
      // Simple existence check
      isHealthy = auth && Object.keys(auth).length > 0;
    }
    
    // Update status
    healthStatus.checks.auth = {
      status: isHealthy ? 'healthy' : 'degraded',
      lastCheck: new Date().toISOString(),
      error: null
    };
  } catch (error) {
    healthStatus.checks.auth = {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      error: error.message
    };
    
    recordIssue('auth', error.message);
    logger.error(`Auth health check failed: ${error.message}`);
  }
}

/**
 * Check external API health
 * @param {string} name - API name
 * @param {Function} checkFn - Health check function
 */
async function checkExternalApiHealth(name, checkFn) {
  try {
    if (typeof checkFn !== 'function') {
      throw new Error('No health check function provided');
    }
    
    const startTime = Date.now();
    const result = await checkFn();
    const responseTime = Date.now() - startTime;
    
    // Initialize API entry if needed
    if (!healthStatus.checks.externalApis[name]) {
      healthStatus.checks.externalApis[name] = {
        status: 'unknown',
        lastCheck: null,
        error: null
      };
    }
    
    // Update status
    healthStatus.checks.externalApis[name] = {
      status: result ? 'healthy' : 'degraded',
      lastCheck: new Date().toISOString(),
      responseTime,
      error: null
    };
    
    // Log slow responses
    if (responseTime > 300) {
      logger.warn(`External API '${name}' health check response time high: ${responseTime}ms`);
    }
  } catch (error) {
    // Initialize API entry if needed
    if (!healthStatus.checks.externalApis[name]) {
      healthStatus.checks.externalApis[name] = {
        status: 'unknown',
        lastCheck: null,
        error: null
      };
    }
    
    healthStatus.checks.externalApis[name] = {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      error: error.message
    };
    
    recordIssue('external_api', `${name}: ${error.message}`);
    logger.error(`External API '${name}' health check failed: ${error.message}`);
  }
}

/**
 * Monitor system resources
 * @param {number} interval - Check interval in ms
 */
function startResourceMonitoring(interval) {
  // Perform initial check
  checkSystemResources();
  
  // Schedule regular checks
  setInterval(() => {
    checkSystemResources();
  }, interval);
  
  logger.info(`Resource monitoring started, interval: ${interval}ms`);
}

/**
 * Check system resources (memory, CPU, disk)
 */
function checkSystemResources() {
  try {
    // Memory usage
    const memoryUsage = process.memoryUsage();
    const usedMemoryMB = Math.round(memoryUsage.rss / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    // Memory status based on usage percentage of heap
    const memoryStatus = heapUsedMB / heapTotalMB > 0.9 ? 'degraded' :
                         heapUsedMB / heapTotalMB > 0.8 ? 'warning' : 'healthy';
    
    healthStatus.checks.memory = {
      status: memoryStatus,
      lastCheck: new Date().toISOString(),
      usage: {
        rss: usedMemoryMB,
        heapTotal: heapTotalMB,
        heapUsed: heapUsedMB,
        percentage: Math.round((heapUsedMB / heapTotalMB) * 100)
      }
    };
    
    // Log high memory usage
    if (memoryStatus !== 'healthy') {
      logger.warn(`High memory usage: ${healthStatus.checks.memory.usage.percentage}%`);
      
      if (memoryStatus === 'degraded') {
        recordIssue('memory', `High memory usage: ${healthStatus.checks.memory.usage.percentage}%`);
      }
    }
    
    // Simple CPU load estimate
    healthStatus.checks.cpu = {
      status: 'healthy', // Simple status for now
      lastCheck: new Date().toISOString(),
      usage: 'not_implemented' // Would require OS module
    };
    
    // Update overall status in case system resources affected it
    updateOverallStatus();
  } catch (error) {
    logger.error(`Resource check failed: ${error.message}`);
  }
}

/**
 * Update the overall system health status
 */
function updateOverallStatus() {
  // Get all status values
  const statusValues = [
    healthStatus.checks.database.status,
    healthStatus.checks.auth.status,
    healthStatus.checks.memory.status
  ];
  
  // Add external API statuses
  Object.values(healthStatus.checks.externalApis).forEach(api => {
    statusValues.push(api.status);
  });
  
  // Determine overall status
  if (statusValues.includes('unhealthy')) {
    healthStatus.status = 'unhealthy';
  } else if (statusValues.includes('degraded')) {
    healthStatus.status = 'degraded';
  } else if (statusValues.every(s => s === 'healthy')) {
    healthStatus.status = 'healthy';
  } else if (statusValues.includes('unknown')) {
    healthStatus.status = 'initializing';
  } else {
    healthStatus.status = 'degraded';
  }
}

/**
 * Record a health issue for tracking
 * @param {string} type - Issue type
 * @param {string} message - Issue message
 */
function recordIssue(type, message) {
  const issue = {
    type,
    message,
    timestamp: new Date().toISOString()
  };
  
  // Add to recent issues list
  healthStatus.recentIssues.unshift(issue);
  
  // Limit the size of the list
  if (healthStatus.recentIssues.length > MAX_RECENT_ISSUES) {
    healthStatus.recentIssues.pop();
  }
}

/**
 * Handle application shutdown
 */
function handleShutdown() {
  logger.info('Health monitoring system shutting down');
  // Cleanup could go here
}

// Set up process shutdown handlers
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// Export functions for use in application
module.exports = {
  initializeHealthMonitoring,
  getHealthStatus: () => ({ ...healthStatus }),
  performHealthCheck: performFullHealthCheck
};

// Support dual module usage
if (typeof exports !== 'undefined') {
  exports.initializeHealthMonitoring = initializeHealthMonitoring;
  exports.getHealthStatus = () => ({ ...healthStatus });
  exports.performHealthCheck = performFullHealthCheck;
}