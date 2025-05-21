/**
 * iREVA Platform Bootstrap (CommonJS version)
 * 
 * This module implements staged initialization for optimal performance.
 * It's designed to be loaded after the minimal server has bound to port 3000.
 */

// Startup timing measurement
const BOOTSTRAP_START = Date.now();

// Utility for logging with timestamps
function logWithTime(message) {
  const elapsed = Date.now() - BOOTSTRAP_START;
  console.log(`[BOOTSTRAP ${elapsed}ms] ${message}`);
}

/**
 * Dynamic module loader that supports both ESM and CommonJS
 * With specific handling for TypeScript files
 */
async function loadModules(modulePaths) {
  const modules = {};
  
  for (const modulePath of modulePaths) {
    try {
      // Handle TypeScript files specially - they're always ESM in our project
      if (modulePath.endsWith('.ts')) {
        logWithTime(`TypeScript file detected, skipping for now: ${modulePath}`);
        continue;
      }
      
      // For CommonJS files, use require directly
      if (modulePath.endsWith('.cjs')) {
        modules[modulePath] = require(modulePath);
        logWithTime(`Loaded ${modulePath} as CommonJS module`);
        continue;
      }
      
      // For .js files, try to guess based on error
      try {
        modules[modulePath] = require(modulePath);
        logWithTime(`Loaded ${modulePath} as CommonJS module`);
      } catch (err) {
        if (err.code === 'ERR_REQUIRE_ESM') {
          // This is an ESM module, skip it in this initial pass
          logWithTime(`ESM module detected, skipping for now: ${modulePath}`);
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error(`Failed to load module ${modulePath}:`, error);
      // Don't throw, just continue to the next module
    }
  }
  
  return modules;
}

/**
 * Main bootstrap function that orchestrates the initialization
 */
function bootstrap() {
  logWithTime('Starting CommonJS bootstrap initialization...');
  
  try {
    // Step 1: Load essential modules
    const modules = loadModules([
      './essential-loader.cjs',
      './middleware/auth-middleware.cjs',
      './session-manager.cjs',
      './bootstrap-routes.cjs'
    ]);
    
    // Step 2: Initialize Express if available
    try {
      const express = require('express');
      const app = express();
      
      // Step 3: Initialize session management
      if (modules['./session-manager.cjs'] && modules['./session-manager.cjs'].initializeSession) {
        logWithTime('Initializing session management...');
        modules['./session-manager.cjs'].initializeSession(app);
        logWithTime('Session management initialized');
      }
      
      // Step 4: Register bootstrap routes
      if (modules['./bootstrap-routes.cjs'] && modules['./bootstrap-routes.cjs'].registerBootstrapRoutes) {
        logWithTime('Registering bootstrap routes...');
        modules['./bootstrap-routes.cjs'].registerBootstrapRoutes(app);
        logWithTime('Bootstrap routes registered');
      }
      
      // Step 5: Start minimal Express server on a different port
      const BOOTSTRAP_PORT = process.env.BOOTSTRAP_PORT || 3001;
      app.listen(BOOTSTRAP_PORT, '0.0.0.0', () => {
        logWithTime(`Bootstrap Express server running on port ${BOOTSTRAP_PORT}`);
      });
    } catch (expressErr) {
      logWithTime('Express initialization skipped: ' + expressErr.message);
    }
    
    logWithTime('Bootstrap sequence completed, running in minimal mode');
    
    // Continue initialization in the background
    setTimeout(() => {
      logWithTime('Starting background initialization...');
      // Start more advanced initialization in the background
      try {
        require('./background-init.cjs');
      } catch (err) {
        logWithTime('Background initialization skipped: ' + err.message);
      }
    }, 100);
    
    return true;
  } catch (err) {
    console.error('Bootstrap process failed:', err);
    return false;
  }
}

// Start the bootstrap process
const success = bootstrap();
if (!success) {
  console.error('Bootstrap initialization failed');
}

// Export completed status for the main server
module.exports = {
  bootstrapCompleted: success
};