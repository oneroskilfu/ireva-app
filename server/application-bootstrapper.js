/**
 * Application Bootstrapper
 * 
 * Centralized initialization of the iREVA platform with:
 * - Staged startup sequence
 * - Performance optimization
 * - Health monitoring
 * - Graceful shutdown
 */

// Import environment setup
const setupEnv = require('./setup-env.cjs');

// Utility for consistent logging
function logWithTime(message) {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[1].slice(0, -1);
  console.log(`[${timestamp}] [BOOT] ${message}`);
}

// Timestamp when boot process started
const BOOT_START_TIME = Date.now();

/**
 * Bootstrap the application with optimized startup sequence
 * @param {Object} app - Express application
 * @param {Object} options - Bootstrap options
 * @returns {Promise<Object>} - Application components
 */
async function bootstrapApplication(app, options = {}) {
  logWithTime(`Starting iREVA platform bootstrap...`);
  
  // Setup environment variables
  setupEnv.setupEnvironment();
  
  // Load logger as early as possible
  let logger;
  try {
    logger = require('./logger.cjs');
    logger.info('Logger initialized', 'BOOT');
  } catch (error) {
    logWithTime(`Error initializing logger: ${error.message}`);
  }
  
  // Load configuration
  let config;
  try {
    config = require('./config').config;
    if (logger) logger.info('Configuration loaded', 'BOOT');
  } catch (error) {
    if (logger) logger.error(`Error loading configuration: ${error.message}`, 'BOOT');
    config = { env: { isDevelopment: process.env.NODE_ENV !== 'production' } };
  }
  
  // Phase 1: Essential services (immediate startup)
  const { db, healthMonitor, performanceTracker, gracefulShutdown } = 
    await initializeEssentialServices(app, config, logger);
  
  // Phase 2: Core services (can run in parallel)
  initializeCoreServices(app, config, logger, db)
    .then(services => {
      if (logger) logger.info('Core services initialized', 'BOOT');
    })
    .catch(error => {
      if (logger) logger.error(`Error initializing core services: ${error.message}`, 'BOOT');
    });
  
  // Phase 3: Background services (non-critical)
  setTimeout(() => {
    initializeBackgroundServices(app, config, logger, db)
      .then(services => {
        if (logger) logger.info('Background services initialized', 'BOOT');
      })
      .catch(error => {
        if (logger) logger.error(`Error initializing background services: ${error.message}`, 'BOOT');
      });
  }, 500);
  
  // Return application components
  return {
    db,
    healthMonitor,
    performanceTracker,
    gracefulShutdown,
    config
  };
}

/**
 * Initialize essential services required for immediate startup
 * @param {Object} app - Express application
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 * @returns {Promise<Object>} - Essential services
 */
async function initializeEssentialServices(app, config, logger) {
  // Create performance tracker
  let performanceTracker;
  try {
    const performanceModule = require('./performance-tracker');
    performanceTracker = performanceModule.initializePerformanceTracker(app, {
      enabled: true,
      sampleRate: config.env.isDevelopment ? 1.0 : 0.1, // 100% in dev, 10% in prod
      logLevel: config.env.isDevelopment ? 'standard' : 'minimal'
    });
    if (logger) logger.info('Performance tracker initialized', 'BOOT');
  } catch (error) {
    if (logger) logger.error(`Error initializing performance tracker: ${error.message}`, 'BOOT');
    performanceTracker = null;
  }
  
  // Start tracking essential services initialization
  const perfOp = performanceTracker ? 
    performanceTracker.startOperation('essential-services-init') : null;
  
  if (perfOp) perfOp.checkpoint('health-monitor-init');
  
  // Initialize health monitoring
  let healthMonitor;
  try {
    const healthMonitorModule = require('./health-monitor');
    healthMonitor = healthMonitorModule.initializeHealthMonitoring(app, {
      checkInterval: config.env.isDevelopment ? 30000 : 60000 // 30s in dev, 60s in prod
    });
    if (logger) logger.info('Health monitor initialized', 'BOOT');
  } catch (error) {
    if (logger) logger.error(`Error initializing health monitoring: ${error.message}`, 'BOOT');
    healthMonitor = null;
  }
  
  if (perfOp) perfOp.checkpoint('db-init');
  
  // Initialize database with deferred connection
  let db;
  try {
    db = require('./db');
    // Don't call initializeDb() yet - we want it to initialize lazily
    if (logger) logger.info('Database module loaded (lazy initialization)', 'BOOT');
  } catch (error) {
    if (logger) logger.error(`Error loading database module: ${error.message}`, 'BOOT');
    db = null;
  }
  
  if (perfOp) perfOp.checkpoint('shutdown-handler-init');
  
  // Initialize graceful shutdown handler
  let gracefulShutdown;
  try {
    const shutdownModule = require('./graceful-shutdown');
    gracefulShutdown = shutdownModule.initializeGracefulShutdown({
      timeout: 30000, // 30s timeout for graceful shutdown
      forceTimeout: 10000, // 10s additional before force exit
      handleUncaughtExceptions: true
    });
    
    // Register database for cleanup
    if (db && gracefulShutdown) {
      gracefulShutdown.register(
        'database', 
        shutdownModule.cleanupHelpers.createDatabaseCleanup(db),
        20 // Priority - higher numbers run later
      );
    }
    
    // Register Express app for cleanup
    if (app && gracefulShutdown) {
      gracefulShutdown.register(
        'express', 
        shutdownModule.cleanupHelpers.createExpressCleanup(app),
        10 // Priority - lower numbers run earlier
      );
    }
    
    if (logger) logger.info('Graceful shutdown handler initialized', 'BOOT');
  } catch (error) {
    if (logger) logger.error(`Error initializing graceful shutdown: ${error.message}`, 'BOOT');
    gracefulShutdown = null;
  }
  
  // End performance tracking
  if (perfOp) {
    perfOp.end({
      healthMonitorAvailable: !!healthMonitor,
      dbAvailable: !!db,
      gracefulShutdownAvailable: !!gracefulShutdown
    });
  }
  
  // Calculate essential services init time
  const essentialInitTime = Date.now() - BOOT_START_TIME;
  if (logger) logger.info(`Essential services initialized in ${essentialInitTime}ms`, 'BOOT');
  
  return { db, healthMonitor, performanceTracker, gracefulShutdown };
}

/**
 * Initialize core services needed for basic application functionality
 * @param {Object} app - Express application
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 * @param {Object} db - Database instance
 * @returns {Promise<Object>} - Core services
 */
async function initializeCoreServices(app, config, logger, db) {
  // Initialize auth system
  let auth;
  try {
    const authModule = require('./auth');
    if (logger) logger.info('Auth module loaded', 'BOOT');
    auth = authModule;
  } catch (error) {
    if (logger) logger.error(`Error loading auth module: ${error.message}`, 'BOOT');
    auth = null;
  }
  
  // Initialize caching
  let cacheManager;
  try {
    const cacheModule = require('./cache-manager');
    cacheManager = cacheModule.initializeCacheManager({
      enabled: true
    });
    if (logger) logger.info('Cache manager initialized', 'BOOT');
  } catch (error) {
    if (logger) logger.error(`Error initializing cache manager: ${error.message}`, 'BOOT');
    cacheManager = null;
  }
  
  // Initialize routes
  try {
    // If routes.ts exists and is accessible, use it
    if (app) {
      const routesModule = require('./routes');
      if (typeof routesModule.registerEssentialRoutes === 'function') {
        routesModule.registerEssentialRoutes(app);
        if (logger) logger.info('Essential routes registered', 'BOOT');
      } else if (typeof routesModule.registerRoutes === 'function') {
        routesModule.registerRoutes(app);
        if (logger) logger.info('Routes registered', 'BOOT');
      }
    }
  } catch (error) {
    if (logger) logger.error(`Error registering routes: ${error.message}`, 'BOOT');
  }
  
  // Initialize database monitoring
  let connectionMonitor;
  try {
    if (db && db.pool) {
      const monitorModule = require('./connection-monitor');
      connectionMonitor = monitorModule.initializeConnectionMonitor(db.pool, {
        monitorInterval: 60000, // 1 minute interval
        logLevel: config.env.isDevelopment ? 'standard' : 'minimal'
      });
      if (logger) logger.info('Database connection monitor initialized', 'BOOT');
    }
  } catch (error) {
    if (logger) logger.error(`Error initializing connection monitor: ${error.message}`, 'BOOT');
    connectionMonitor = null;
  }
  
  // Calculate core services init time
  const coreInitTime = Date.now() - BOOT_START_TIME;
  if (logger) logger.info(`Core services initialized in ${coreInitTime}ms`, 'BOOT');
  
  return { auth, cacheManager, connectionMonitor };
}

/**
 * Initialize background services that aren't critical for startup
 * @param {Object} app - Express application
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 * @param {Object} db - Database instance
 * @returns {Promise<Object>} - Background services
 */
async function initializeBackgroundServices(app, config, logger, db) {
  // Initialize circuit breakers
  let circuitBreakers;
  try {
    circuitBreakers = require('./circuit-breaker');
    if (logger) logger.info('Circuit breaker module loaded', 'BOOT');
  } catch (error) {
    if (logger) logger.error(`Error loading circuit breaker module: ${error.message}`, 'BOOT');
    circuitBreakers = null;
  }
  
  // Initialize retry handler
  let retryHandler;
  try {
    retryHandler = require('./retry-handler');
    if (logger) logger.info('Retry handler module loaded', 'BOOT');
  } catch (error) {
    if (logger) logger.error(`Error loading retry handler module: ${error.message}`, 'BOOT');
    retryHandler = null;
  }
  
  // Initialize database if not already initialized
  if (db && typeof db.initializeDb === 'function') {
    try {
      await db.initializeDb();
      if (logger) logger.info('Database fully initialized', 'BOOT');
    } catch (error) {
      if (logger) logger.error(`Error initializing database: ${error.message}`, 'BOOT');
    }
  }
  
  // Calculate background services init time
  const backgroundInitTime = Date.now() - BOOT_START_TIME;
  if (logger) logger.info(`Background services initialized in ${backgroundInitTime}ms`, 'BOOT');
  
  return { circuitBreakers, retryHandler };
}

// If this module is run directly, execute bootstrap
if (require.main === module) {
  // Create Express app if not provided
  const express = require('express');
  const app = express();
  
  // Bootstrap application
  bootstrapApplication(app)
    .then(components => {
      logWithTime('Application bootstrapped successfully');
      
      // Start Express server
      const port = process.env.PORT || 5000;
      const server = app.listen(port, '0.0.0.0', () => {
        logWithTime(`Express server listening on port ${port}`);
      });
      
      // Register server for graceful shutdown
      if (components.gracefulShutdown) {
        const shutdownModule = require('./graceful-shutdown');
        components.gracefulShutdown.register(
          'server',
          shutdownModule.cleanupHelpers.createHttpServerCleanup(server),
          30 // Highest priority - shut down last
        );
      }
    })
    .catch(error => {
      logWithTime(`Error bootstrapping application: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  bootstrapApplication
};