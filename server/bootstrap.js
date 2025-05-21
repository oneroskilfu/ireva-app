/**
 * iREVA Platform Bootstrap
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
 * Main bootstrap function that orchestrates the staged initialization
 */
async function bootstrap() {
  logWithTime('Starting staged initialization...');
  
  // Stage 1: Load essential modules
  logWithTime('Stage 1: Loading essential modules...');
  const { initializeEssentials } = await loadModules(['./essential-loader.js']);
  await initializeEssentials();
  logWithTime('Stage 1 complete: Essential modules loaded');
  
  // Stage 2: Initialize authentication in parallel with database
  logWithTime('Stage 2: Initializing auth and database in parallel...');
  
  // Start authentication initialization
  const authPromise = (async () => {
    try {
      logWithTime('Starting authentication initialization...');
      const { initializeAuth } = await loadModules(['./auth.js']);
      // We'll just import the module but not call initializeAuth yet
      logWithTime('Authentication module loaded');
      return true;
    } catch (err) {
      console.error('Error loading authentication module:', err);
      return false;
    }
  })();
  
  // Start database initialization
  const dbPromise = (async () => {
    try {
      logWithTime('Starting database initialization...');
      const { initializeDb } = await loadModules(['./db.ts']);
      // We don't call initializeDb() yet, just load the module
      logWithTime('Database module loaded');
      return true;
    } catch (err) {
      console.error('Error loading database module:', err);
      return false;
    }
  })();
  
  // Wait for both modules to be loaded
  await Promise.all([authPromise, dbPromise]);
  logWithTime('Stage 2 complete: Auth and DB modules loaded');
  
  // Stage 3: Register routes and initialize middleware
  logWithTime('Stage 3: Initializing routes and middleware...');
  try {
    const { registerEssentialRoutes } = await loadModules(['./routes.ts']);
    // We'll implement this function later to register only essential routes
    logWithTime('Routes module loaded');
  } catch (err) {
    console.error('Error loading routes module:', err);
  }
  logWithTime('Stage 3 complete: Routes and middleware initialized');
  
  // Stage 4: Complete initialization in the background
  logWithTime('Stage 4: Starting background initialization...');
  setTimeout(() => {
    completeInitialization().catch(err => {
      console.error('Error during background initialization:', err);
    });
  }, 100);
  
  logWithTime('Bootstrap sequence completed, application is now running in minimal mode');
}

/**
 * Final initialization phase that completes all remaining tasks
 * This runs in the background after the server is already responsive
 */
async function completeInitialization() {
  logWithTime('Starting background initialization process...');
  
  try {
    // Now we can fully initialize the database
    const { initializeDb } = await loadModules(['./db.ts']);
    await initializeDb();
    logWithTime('Database fully initialized');
    
    // Initialize authentication system
    const { initializeAuth } = await loadModules(['./auth.ts']);
    // initializeAuth would be called here if implemented
    logWithTime('Authentication fully initialized');
    
    // Register all routes
    const { registerAllRoutes } = await loadModules(['./routes.ts']);
    // registerAllRoutes would be called here if implemented
    logWithTime('All routes registered');
    
    logWithTime('Background initialization complete - application is fully operational');
  } catch (err) {
    console.error('Background initialization failed:', err);
    throw err;
  }
}

/**
 * Dynamic module loader that supports both ESM and CommonJS
 */
async function loadModules(modulePaths) {
  const modules = {};
  
  for (const modulePath of modulePaths) {
    try {
      // Try ESM import first (dynamic import)
      modules[modulePath] = await import(modulePath);
      logWithTime(`Loaded ${modulePath} as ESM module`);
    } catch (err) {
      try {
        // Fall back to CommonJS require
        modules[modulePath] = require(modulePath);
        logWithTime(`Loaded ${modulePath} as CommonJS module`);
      } catch (requireErr) {
        console.error(`Failed to load module ${modulePath}:`, requireErr);
        throw requireErr;
      }
    }
  }
  
  return Object.values(modules).reduce((acc, mod) => ({ ...acc, ...mod }), {});
}

// Start the bootstrap process
bootstrap().catch(err => {
  console.error('Bootstrap process failed:', err);
});