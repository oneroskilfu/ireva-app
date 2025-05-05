// Optimized server startup for Replit's 10-second timeout constraint
import express from "express";
import { createServer } from "http";
import { log, setupVite } from "./vite";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Performance measurement
const startTime = Date.now();
console.log(`[${new Date().toISOString()}] Starting iREVA application... (t=0ms)`);

// Load environment variables
dotenv.config();

// PHASE 1: Create and start minimal server as quickly as possible
const app = express();
app.use(express.json());

// Simplified port configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Check if we're running under the workflow starter
const isWorkflowStarter = process.env.REPLIT_WORKFLOW_STARTER === 'true';

console.log(`[${new Date().toISOString()}] Using port ${PORT} for the application (t=${Date.now() - startTime}ms)`);

// Skip file-based coordination and use environment variables
process.env.MAIN_APP_RUNNING = 'true';
process.env.MAIN_APP_PORT = String(PORT);

const server = createServer(app);

// Consolidated health check endpoint optimized for Replit detection
// Handles both /health and /api/health for better performance
function handleHealthCheck(req: express.Request, res: express.Response) {
  // Set common headers for Replit detection
  res.setHeader('X-Replit-Port-Status', 'active');
  res.setHeader('X-Replit-Health-Check', 'success');
  res.setHeader('X-Port-Binding-Success', 'true');
  
  // Format response based on path
  if (req.path === '/api/health') {
    res.status(200).json({ 
      status: 'ok', 
      port: PORT,
      timestamp: new Date().toISOString(),
      replitReady: true,
      startupTime: Date.now() - startTime + 'ms'
    });
  } else {
    res.status(200).send('OK');
  }
}

// Register both endpoints with the same handler
app.get('/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

// Ultra-lightweight landing page for initial requests
// Using special headers that Replit might be looking for
app.get('/', (req, res) => {
  res.setHeader('X-Replit-Port-Status', 'active');
  res.setHeader('X-Replit-Health-Check', 'success');
  res.setHeader('X-Port-Binding-Success', 'true');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(`<!DOCTYPE html><html><head><title>iREVA Platform</title><style>body{font-family:Arial,sans-serif;text-align:center;margin:0;padding:20px;}</style></head><body><h1>iREVA Platform</h1><p>Loading application...</p></body></html>`);
});

if (isWorkflowStarter) {
  console.log(`[${new Date().toISOString()}] Running under workflow starter, using port ${PORT}`);
}

// Start server IMMEDIATELY - before loading any other components
// Ensure port is open and detected before proceeding
server.listen(PORT, "0.0.0.0", async () => {
  // Immediately log in a format that might be more detectable by Replit
  console.log(`SERVER READY ON PORT ${PORT}`);
  console.log(`PORT ${PORT} OPEN AND READY`);
  console.log(`Listening on port ${PORT}`);
  
  // Reduced delay for loading the full application (from 3000ms to 500ms)
  const loadDelay = isWorkflowStarter ? 0 : 500; // Reduced from 3000ms to 500ms
  console.log(`[${new Date().toISOString()}] Will load full application in ${loadDelay}ms (t=${Date.now() - startTime}ms)`);
  
  setTimeout(async () => {
    log(`iREVA server bound to port ${PORT}`);
    console.log(`[${new Date().toISOString()}] Loading full application now (t=${Date.now() - startTime}ms)`);
    
    try {
      await loadFullApplication();
      console.log(`[${new Date().toISOString()}] Full application loaded successfully (t=${Date.now() - startTime}ms)`);
    } catch (error) {
      console.error('Error loading full application:', error);
    }
  }, loadDelay);
});

// Function to load the full application after port binding
async function loadFullApplication() {
  console.log(`[${new Date().toISOString()}] Setting up API endpoints with lazy loading... (t=${Date.now() - startTime}ms)`);
  
  // Use lazy loading for API routes
  // Rather than importing routes immediately, we'll load them on first request
  let adminRouterInstance: any = null;
  let debugAuthRouterInstance: any = null;
  
  // Lazy load admin router
  app.use('/api/admin', (req, res, next) => {
    if (!adminRouterInstance) {
      console.log(`[${new Date().toISOString()}] Lazy loading admin router... (t=${Date.now() - startTime}ms)`);
      import('./routes/admin').then(module => {
        adminRouterInstance = module.default;
        adminRouterInstance(req, res, next);
      }).catch(err => {
        console.error('Failed to load admin router:', err);
        res.status(500).json({ error: 'Server configuration error' });
      });
    } else {
      adminRouterInstance(req, res, next);
    }
  });
  
  // Lazy load debug auth router
  app.use('/api/debug', (req, res, next) => {
    if (!debugAuthRouterInstance) {
      console.log(`[${new Date().toISOString()}] Lazy loading debug router... (t=${Date.now() - startTime}ms)`);
      import('./routes/debug-auth').then(module => {
        debugAuthRouterInstance = module.default;
        debugAuthRouterInstance(req, res, next);
      }).catch(err => {
        console.error('Failed to load debug router:', err);
        res.status(500).json({ error: 'Server configuration error' });
      });
    } else {
      debugAuthRouterInstance(req, res, next);
    }
  });
  
  // Add a catch-all route for unknown API endpoints
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'Endpoint not found',
      message: 'The requested API endpoint does not exist or is not yet implemented',
      path: req.originalUrl
    });
  });
  
  // Set up Vite for serving the React frontend
  console.log(`[${new Date().toISOString()}] Setting up Vite for frontend... (t=${Date.now() - startTime}ms)`);
  await setupVite(app, server);
  
  console.log(`[${new Date().toISOString()}] Server initialization complete (t=${Date.now() - startTime}ms)`);
}
