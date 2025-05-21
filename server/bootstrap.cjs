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
    // Load minimal modules for now
    const modules = loadModules([
      './essential-loader.js',
      './middleware/auth-middleware.js'
    ]);
    
    logWithTime('Bootstrap sequence completed, running in minimal mode');
    
    // Continue initialization in the background
    setTimeout(() => {
      logWithTime('Starting background initialization...');
      // Nothing to do in background for now
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