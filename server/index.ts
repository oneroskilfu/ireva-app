import 'dotenv/config'; // Loads .env before anything else
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { initializeDb, db } from "./db";
import { initializeAuth } from "./auth";
import { setupVite } from "./vite";
import { setupStaticServing } from "./static-serve";

// Determine startup mode for optimization
const useStaging = process.env.STAGED_LOADING === 'true';
const useMinimalMode = process.env.MINIMAL_STARTUP === 'true';
const startTime = Date.now();

// Log with timestamp for performance tracking
const logWithTime = (message: string) => {
  const elapsed = Date.now() - startTime;
  console.log(`[${elapsed}ms] ${message}`);
};

if (useMinimalMode) {
  logWithTime('Starting server with ultra-minimal mode...');
} else {
  logWithTime('Starting server with' + (useStaging ? ' staged loading...' : 'out staged loading...'));
}

// Create Express application
const app = express();

// Apply essential middleware immediately
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Register all routes
registerRoutes(app);

let server: any;

// Choose initialization approach based on environment flags
if (useMinimalMode) {
  // Ultra-minimal startup: Start server instantly and defer everything else
  const PORT = process.env.PORT || 5000;
  server = createServer(app);
  
  // Skip any pre-initialization and bind port immediately
  server.listen(PORT, '0.0.0.0', async () => {
    logWithTime(`Server is running on port ${PORT} - Ultra-minimal mode active`);
    
    // Fast-track: Skip all delays and initialize core services with max parallelism
    logWithTime('Fast-initializing core services...');
    
    try {
      // Initialize auth and database in parallel with Promise.all for maximum speed
      await Promise.all([
        // Auth initialization
        (async () => {
          try {
            logWithTime('Fast-starting auth...');
            initializeAuth(app);
            logWithTime('Auth ready');
            return true;
          } catch (err) {
            console.error('Auth init error:', err);
            return false;
          }
        })(),
        
        // Database initialization - only at runtime, never during build
        (async () => {
          try {
            logWithTime('Fast-starting database...');
            // Only initialize if not in build phase
            if (process.env.RENDER !== 'true' || process.env.DATABASE_URL) {
              await initializeDb();
              logWithTime('Database ready');
            } else {
              logWithTime('Skipping database init during build phase');
            }
            return true;
          } catch (err) {
            console.error('Database init error:', err);
            return false;
          }
        })()
      ]);
      
      // Skip routes registration if already done or database unavailable
      if (process.env.DATABASE_URL || process.env.NODE_ENV === 'production') {
        registerRoutes(app);
        logWithTime('Routes registered');
      } else {
        logWithTime('Routes skipped - database unavailable');
      }
      
      // In production, serve static files; in development, use Vite
      if (process.env.NODE_ENV === 'production') {
        setupStaticServing(app);
        logWithTime('Production static serving enabled - StaticHome ready');
        logWithTime('Ultra-minimal initialization complete');
      } else {
        // Setup Vite to serve React frontend with StaticHome
        setupVite(app, server).then(() => {
          logWithTime('Frontend setup complete - StaticHome ready');
          logWithTime('Ultra-minimal initialization complete');
        }).catch(err => {
          console.error('Frontend setup error:', err);
          logWithTime('Ultra-minimal initialization complete (frontend setup failed)');
        });
      }
    } catch (err) {
      logWithTime('ERROR: Ultra-minimal initialization failed');
      console.error(err);
    }
  });
} else if (useStaging) {
  // Staged approach: Start server immediately, then initialize features progressively
  const PORT = process.env.PORT || 5000;
  server = createServer(app);
  
  server.listen(PORT, '0.0.0.0', async () => {
    logWithTime(`Server is running on port ${PORT} - Stage 1 complete`);
    
    // Stage 2: Initialize authentication and database in parallel
    logWithTime('Initializing core services in parallel...');
    
    // Start both processes simultaneously 
    const authPromise = (async () => {
      try {
        logWithTime('Starting authentication setup...');
        initializeAuth(app);
        logWithTime('Authentication initialized');
        return true;
      } catch (err) {
        console.error('Error during authentication initialization:', err);
        return false;
      }
    })();
    
    const dbPromise = (async () => {
      try {
        logWithTime('Starting database initialization...');
        await initializeDb();
        logWithTime('Database initialized');
        return true;
      } catch (err) {
        console.error('Error during database initialization:', err);
        return false;
      }
    })();
    
    // Wait for both to complete
    const [authSuccess, dbSuccess] = await Promise.all([authPromise, dbPromise]);
    
    // Only register authenticated routes if both auth and db initialized successfully
    if (authSuccess && dbSuccess) {
      registerRoutes(app);
      logWithTime('Routes registered');
      
      // Setup Vite to serve React frontend with StaticHome
      await setupVite(app, server);
      logWithTime('Frontend setup complete - StaticHome ready');
    } else {
      logWithTime('WARNING: Some services failed to initialize properly');
    }
  });
} else {
  // Optimized approach: Port binding first, then background initialization
  logWithTime('Using optimized port-first initialization approach');
  
  // Initialize auth immediately
  initializeAuth(app);
  
  // Register all routes
  server = registerRoutes(app);
  
  // Start server FIRST for fastest port binding
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', (err: any) => {
    if (err) {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} busy, trying alternate ports...`);
        // Try ports 5001, 5002, etc.
        tryAlternatePort(server, parseInt(PORT.toString()) + 1);
      } else {
        console.error('Server startup error:', err);
        process.exit(1);
      }
    } else {
      logWithTime(`Server ready on port ${PORT}`);
      
      // Initialize services in background after port is bound
      initializeServices().catch(err => {
        console.warn('Background service initialization failed:', err.message);
      });
    }
  });
}

// Try alternate ports if main port is busy
function tryAlternatePort(server: any, port: number) {
  if (port > 5010) {
    console.error('Unable to find available port');
    process.exit(1);
  }
  
  server.listen(port, '0.0.0.0', (err: any) => {
    if (err) {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} also busy, trying ${port + 1}...`);
        tryAlternatePort(server, port + 1);
      } else {
        console.error('Server startup error:', err);
        process.exit(1);
      }
    } else {
      logWithTime(`Server ready on alternate port ${port}`);
      
      // Initialize services in background after port is bound
      initializeServices().catch(err => {
        console.warn('Background service initialization failed:', err.message);
      });
    }
  });
}

// Background service initialization (non-blocking)
async function initializeServices() {
  try {
    // Setup Vite in background
    if (server) {
      await setupVite(app, server);
      logWithTime('Frontend setup complete - StaticHome ready');
    }
    
    // Initialize database last (optional for basic functionality)
    await initializeDb();
    logWithTime('Database initialized');
  } catch (error: any) {
    console.warn('Service initialization completed with warnings:', error.message);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logWithTime('Shutting down gracefully...');
  
  // Close the server
  server.close(() => {
    logWithTime('Server closed');
    
    // Close database connection if initialized
    if (db.client && typeof db.client.release === 'function') {
      db.client.release();
    }
    
    process.exit(0);
  });
});

// Also handle SIGINT for local development
process.on('SIGINT', async () => {
  logWithTime('SIGINT received, shutting down...');
  
  // Close the server
  server.close(() => {
    logWithTime('Server closed');
    
    // Close database connection if initialized
    if (db.client && typeof db.client.release === 'function') {
      db.client.release();
    }
    
    process.exit(0);
  });
});