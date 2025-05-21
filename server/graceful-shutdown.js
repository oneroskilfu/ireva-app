/**
 * Graceful Shutdown Manager
 * 
 * Handles application termination with:
 * - Proper cleanup of resources
 * - Request draining
 * - Database connection closing
 * - Process signal handling
 */

// Try to import logger
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback logger
  logger = {
    info: (msg, category = 'SHUTDOWN') => console.log(`[${category}] ${msg}`),
    warn: (msg, category = 'SHUTDOWN') => console.warn(`[${category}] ${msg}`),
    error: (msg, category = 'SHUTDOWN') => console.error(`[${category}] ${msg}`)
  };
}

// Track registered services and resources to clean up
const registeredServices = new Map();

// Track if shutdown is in progress
let isShuttingDown = false;

// Default timeout for graceful shutdown
const DEFAULT_SHUTDOWN_TIMEOUT = 30000; // 30 seconds

/**
 * Initialize graceful shutdown handling
 * @param {Object} options - Shutdown options
 * @returns {Object} - Shutdown controller
 */
function initializeGracefulShutdown(options = {}) {
  logger.info('Initializing graceful shutdown manager');
  
  // Merge options with defaults
  const shutdownOptions = {
    timeout: options.timeout || DEFAULT_SHUTDOWN_TIMEOUT,
    signals: options.signals || ['SIGINT', 'SIGTERM'],
    forceTimeout: options.forceTimeout || 10000, // 10 seconds after timeout to force exit
    exitProcess: options.exitProcess !== false // Default to true
  };
  
  // Register signal handlers
  for (const signal of shutdownOptions.signals) {
    process.on(signal, () => {
      handleShutdownSignal(signal, shutdownOptions);
    });
    
    logger.info(`Registered shutdown handler for ${signal}`);
  }
  
  // Register uncaught exception handler if enabled
  if (options.handleUncaughtExceptions !== false) {
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught exception: ${error.message}`, 'UNCAUGHT', {
        error,
        stack: error.stack
      });
      
      // Initiate shutdown after uncaught exception
      handleShutdownSignal('UNCAUGHT_EXCEPTION', shutdownOptions);
    });
    
    logger.info('Registered uncaught exception handler');
  }
  
  // Register unhandled rejection handler if enabled
  if (options.handleUnhandledRejections !== false) {
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.message : String(reason)}`, 'UNHANDLED', {
        reason: reason instanceof Error ? {
          message: reason.message,
          stack: reason.stack
        } : reason
      });
      
      // Optionally initiate shutdown (not default behavior)
      if (options.shutdownOnUnhandledRejection) {
        handleShutdownSignal('UNHANDLED_REJECTION', shutdownOptions);
      }
    });
    
    logger.info('Registered unhandled rejection handler');
  }
  
  // Return controller
  return {
    // Register a resource/service for cleanup
    register: (name, cleanupFn, priority = 10) => {
      registerService(name, cleanupFn, priority);
      return { name, unregister: () => unregisterService(name) };
    },
    
    // Unregister a service
    unregister: (name) => {
      unregisterService(name);
    },
    
    // Manually trigger shutdown
    shutdown: async (reason = 'manual') => {
      return handleShutdownSignal(reason, shutdownOptions);
    },
    
    // Check if shutdown is in progress
    isShuttingDown: () => isShuttingDown
  };
}

/**
 * Register a service for cleanup during shutdown
 * @param {string} name - Service name
 * @param {Function} cleanupFn - Cleanup function
 * @param {number} priority - Cleanup priority (higher runs later)
 */
function registerService(name, cleanupFn, priority = 10) {
  if (typeof cleanupFn !== 'function') {
    logger.warn(`Cannot register service ${name}: cleanup must be a function`);
    return;
  }
  
  registeredServices.set(name, { cleanupFn, priority });
  logger.info(`Registered service for graceful shutdown: ${name} (priority: ${priority})`);
}

/**
 * Unregister a service
 * @param {string} name - Service name to unregister
 */
function unregisterService(name) {
  if (registeredServices.has(name)) {
    registeredServices.delete(name);
    logger.info(`Unregistered service from graceful shutdown: ${name}`);
  }
}

/**
 * Handle shutdown signal
 * @param {string} signal - Signal that triggered shutdown
 * @param {Object} options - Shutdown options
 * @returns {Promise<void>} - Resolves when shutdown complete
 */
async function handleShutdownSignal(signal, options) {
  // Prevent multiple shutdown processes
  if (isShuttingDown) {
    logger.info(`Shutdown already in progress, ignoring signal: ${signal}`);
    return;
  }
  
  isShuttingDown = true;
  const shutdownStart = Date.now();
  
  logger.info(`Starting graceful shutdown (signal: ${signal})`);
  
  // Create a timeout promise
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      logger.warn(`Graceful shutdown timeout (${options.timeout}ms) exceeded`);
      resolve(false);
    }, options.timeout);
  });
  
  // Create a force exit promise
  let forceExitTimeout;
  if (options.exitProcess) {
    forceExitTimeout = setTimeout(() => {
      logger.error(`Forcing process exit after ${options.timeout + options.forceTimeout}ms`);
      process.exit(1);
    }, options.timeout + options.forceTimeout);
  }
  
  try {
    // Sort services by priority (higher priority = later cleanup)
    const sortedServices = Array.from(registeredServices.entries())
      .sort((a, b) => a[1].priority - b[1].priority);
    
    // Cleanup all services
    const cleanupPromise = executeCleanup(sortedServices, signal);
    
    // Race the cleanup against timeout
    const result = await Promise.race([cleanupPromise, timeoutPromise]);
    
    // Clear force exit timeout if cleanup completed
    if (result !== false && forceExitTimeout) {
      clearTimeout(forceExitTimeout);
    }
    
    const shutdownDuration = Date.now() - shutdownStart;
    logger.info(`Graceful shutdown completed in ${shutdownDuration}ms`);
    
    // Exit process if configured
    if (options.exitProcess) {
      logger.info('Exiting process');
      process.exit(0);
    }
  } catch (error) {
    logger.error(`Error during graceful shutdown: ${error.message}`, {
      error,
      stack: error.stack
    });
    
    // Exit with error code
    if (options.exitProcess) {
      process.exit(1);
    }
  }
}

/**
 * Execute cleanup for all registered services
 * @param {Array} sortedServices - Sorted services array
 * @param {string} signal - Signal that triggered shutdown
 * @returns {Promise<boolean>} - Resolves when all services cleaned up
 */
async function executeCleanup(sortedServices, signal) {
  const totalServices = sortedServices.length;
  logger.info(`Executing cleanup for ${totalServices} services`);
  
  for (const [name, { cleanupFn }] of sortedServices) {
    try {
      logger.info(`Cleaning up service: ${name}`);
      const startTime = Date.now();
      
      // Execute cleanup function
      await Promise.resolve(cleanupFn(signal));
      
      const duration = Date.now() - startTime;
      logger.info(`Cleanup completed for ${name} in ${duration}ms`);
    } catch (error) {
      logger.error(`Error cleaning up service ${name}: ${error.message}`, {
        error,
        stack: error.stack
      });
      // Continue cleanup despite errors
    }
  }
  
  return true;
}

/**
 * Helper to create cleanup functions for common resources
 */
const cleanupHelpers = {
  /**
   * Create cleanup function for HTTP server
   * @param {Object} server - HTTP server
   * @param {Object} options - Cleanup options
   * @returns {Function} - Cleanup function
   */
  createHttpServerCleanup: (server, options = {}) => {
    return async () => {
      return new Promise((resolve) => {
        server.close(() => {
          logger.info(`HTTP server closed`);
          resolve();
        });
        
        // Set connection timeout
        const timeout = options.timeout || 5000;
        setTimeout(() => {
          logger.warn(`HTTP server close timed out after ${timeout}ms`);
          resolve();
        }, timeout);
      });
    };
  },
  
  /**
   * Create cleanup function for database connection
   * @param {Object} db - Database connection or pool
   * @param {Object} options - Cleanup options
   * @returns {Function} - Cleanup function
   */
  createDatabaseCleanup: (db, options = {}) => {
    return async () => {
      // Determine what type of database object we have
      if (!db) {
        logger.warn('No database object provided for cleanup');
        return;
      }
      
      // Handle different database types
      try {
        if (typeof db.end === 'function') {
          // PostgreSQL Pool
          await db.end();
          logger.info('Database pool ended');
        } else if (typeof db.destroy === 'function') {
          // Knex/Objection
          await db.destroy();
          logger.info('Database connection destroyed');
        } else if (typeof db.close === 'function') {
          // MongoDB/Mongoose
          await db.close();
          logger.info('Database connection closed');
        } else if (db.pool && typeof db.pool.end === 'function') {
          // Object with pool property
          await db.pool.end();
          logger.info('Database pool ended');
        } else {
          logger.warn('Unknown database type, unable to clean up');
        }
      } catch (error) {
        logger.error(`Database cleanup error: ${error.message}`);
        throw error;
      }
    };
  },
  
  /**
   * Create cleanup function for Express app
   * @param {Object} app - Express app
   * @param {Object} server - HTTP server
   * @returns {Function} - Cleanup function
   */
  createExpressCleanup: (app, server) => {
    return async () => {
      // Stop accepting new requests
      if (app && app.disable) {
        app.disable('trust proxy');
        app.disable('x-powered-by');
        
        // Middleware to reject new requests
        app.use((req, res, next) => {
          res.status(503).json({
            error: 'Service Unavailable',
            message: 'Server is shutting down'
          });
        });
        
        logger.info('Express app is no longer accepting new requests');
      }
      
      // Close server if provided
      if (server) {
        await cleanupHelpers.createHttpServerCleanup(server)();
      }
    };
  }
};

// Export functions and helpers
module.exports = {
  initializeGracefulShutdown,
  registerService,
  unregisterService,
  cleanupHelpers
};

// Support dual module usage
if (typeof exports !== 'undefined') {
  exports.initializeGracefulShutdown = initializeGracefulShutdown;
  exports.registerService = registerService;
  exports.unregisterService = unregisterService;
  exports.cleanupHelpers = cleanupHelpers;
}