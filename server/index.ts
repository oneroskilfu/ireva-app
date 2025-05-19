import express from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes, registerEssentialRoutes, registerAuthenticatedRoutes } from "./routes";
import { storage } from "./storage";
import { initializeDb, db } from "./db";
import { initializeAuth } from "./auth";

// Determine if we should use staged loading for faster startup
const useStaging = process.env.STAGED_LOADING === 'true';
const startTime = Date.now();

// Log with timestamp for performance tracking
const logWithTime = (message: string) => {
  const elapsed = Date.now() - startTime;
  console.log(`[${elapsed}ms] ${message}`);
};

logWithTime('Starting server with' + (useStaging ? ' staged loading...' : 'out staged loading...'));

// Create Express application
const app = express();

// Apply essential middleware immediately
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Register essential routes that don't depend on auth/db
registerEssentialRoutes(app);

let server: any;

// Use different initialization approaches based on staging flag
if (useStaging) {
  // Staged approach: Start server immediately, then initialize features progressively
  
  // Start server immediately to bind the port
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
      registerAuthenticatedRoutes(app);
      logWithTime('All routes registered - Server fully initialized');
    } else {
      logWithTime('WARNING: Some services failed to initialize properly');
    }
  });
} else {
  // Traditional approach: Initialize everything before starting the server
  logWithTime('Using traditional initialization approach');
  
  // Initialize auth
  initializeAuth(app);
  
  // Register all routes
  server = registerRoutes(app);
  
  // Initialize database
  initializeDb().then(() => {
    logWithTime('Database initialized');
  }).catch(err => {
    console.error('Error initializing database:', err);
  });
  
  // Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    logWithTime(`Server is running on port ${PORT}`);
  });
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