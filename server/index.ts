// Two-phase server startup optimized for Replit's 20-second timeout constraint
import express from "express";
import { createServer } from "http";
import { log, setupVite } from "./vite";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import net from "net";

// Load environment variables
dotenv.config();

console.log(`[${new Date().toISOString()}] Starting iREVA application...`);

// PHASE 1: Create and start minimal server as quickly as possible
// This is critical to meet Replit's 20-second port binding requirement
const app = express();
app.use(express.json());

// File used for coordination with the minimal server
const coordinationFile = path.join(process.cwd(), 'port-status.json');

// Check if port 5000 is already bound by testing a connection
async function checkPortBound(portToCheck: number): Promise<boolean> {
  return new Promise((resolve) => {
    const testSocket = new net.Socket();
    
    // Set a short timeout
    testSocket.setTimeout(500);
    
    testSocket.on('connect', () => {
      testSocket.destroy();
      resolve(true);  // Port is in use
    });
    
    testSocket.on('timeout', () => {
      testSocket.destroy();
      resolve(false);  // Connection timed out
    });
    
    testSocket.on('error', () => {
      testSocket.destroy();
      resolve(false);  // Error occurred, port likely not in use
    });
    
    testSocket.connect(portToCheck, 'localhost');
  });
}

// Check for minimal server running
let isMinimalServerRunning = false;
try {
  // 1. Check for environment variable set by replit-init.js
  if (process.env.MINIMAL_SERVER_ACTIVE === 'true') {
    isMinimalServerRunning = true;
  } 
  // 2. Check for coordination file
  else if (fs.existsSync(coordinationFile)) {
    try {
      const status = JSON.parse(fs.readFileSync(coordinationFile, 'utf8'));
      isMinimalServerRunning = status.minimalServerActive === true;
    } catch (err) {
      // File exists but isn't valid JSON or doesn't have the expected field
    }
  }
  console.log(`[${new Date().toISOString()}] Detected minimal server status: ${isMinimalServerRunning}`);
} catch (error) {
  console.log(`[${new Date().toISOString()}] Failed to check minimal server status: ${error}`);
}

// Check if we're running under the Replit workflow starter
const isWorkflowStarter = process.env.REPLIT_WORKFLOW_STARTER === 'true';

// Import centralized port configuration
import { MINIMAL_SERVER_PORT, MAIN_APP_PORT } from './config/ports';
const DEFAULT_PORT = MINIMAL_SERVER_PORT;
const ALTERNATE_PORT = MAIN_APP_PORT;

// Check if the minimal server is running from env vars or the coordination file
// If it is, we assume port 5000 is already in use
let port5000Bound = false;

if (isMinimalServerRunning || isWorkflowStarter || process.env.PORT_5000_IN_USE === 'true') {
  port5000Bound = true;
  console.log(`[${new Date().toISOString()}] Port ${DEFAULT_PORT} assumed to be in use due to minimal server or environment indicators`);
} else {
  // Since we can't use top-level await, we'll use a sync check that's less reliable but works
  try {
    const testSocket = new net.Socket();
    let isConnected = false;
    
    // Use a sync approach to test port
    testSocket.connect(DEFAULT_PORT, 'localhost');
    
    testSocket.on('connect', () => {
      isConnected = true;
      port5000Bound = true;
      testSocket.destroy();
      console.log(`[${new Date().toISOString()}] Port ${DEFAULT_PORT} confirmed to be in use via socket check`);
    });
    
    testSocket.on('error', () => {
      testSocket.destroy();
      // We don't set port5000Bound to false here since this callback happens async
    });
    
    // We don't wait for the callbacks since they're async
    // Instead, we'll use fallback detection as a safety net
  } catch (error) {
    console.log(`[${new Date().toISOString()}] Error during port check: ${error}`);
  }
}

// Use a different port if port 5000 is already bound
const port = port5000Bound ? ALTERNATE_PORT : (process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT);

console.log(`[${new Date().toISOString()}] Using port ${port} for the main application`);

// Write our status to the coordination file for other processes
try {
  // Read existing file content if it exists
  let fileContent = {};
  if (fs.existsSync(coordinationFile)) {
    try {
      fileContent = JSON.parse(fs.readFileSync(coordinationFile, 'utf8'));
    } catch (err) {
      // Invalid JSON, start with empty object
      fileContent = {};
    }
  }

  // Update with our main app status, preserving other fields
  fileContent = {
    ...fileContent,
    mainApp: {
      running: true,
      port: port,
      startTime: new Date().toISOString()
    }
  };
  
  fs.writeFileSync(coordinationFile, JSON.stringify(fileContent, null, 2));
} catch (error) {
  console.log(`[${new Date().toISOString()}] Failed to write coordination file: ${error}`);
}

const server = createServer(app);

// Enhanced health check endpoints specifically designed for Replit detection
// Root-level health check for easier detection
app.get('/health', (req, res) => {
  res.setHeader('X-Replit-Port-Status', 'active');
  res.setHeader('X-Replit-Health-Check', 'success');
  res.status(200).send('OK');
});

// Essential endpoint for health checks
app.get('/api/health', (req, res) => {
  res.setHeader('X-Replit-Port-Status', 'active');
  res.setHeader('X-Replit-Health-Check', 'success');
  res.status(200).json({ 
    status: 'ok', 
    port: port,
    timestamp: new Date().toISOString(),
    replitReady: true
  });
});

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

// Log if we're running under workflow starter
if (isWorkflowStarter) {
  console.log(`[${new Date().toISOString()}] Running under workflow starter, using port ${port}`);
}

// Start server IMMEDIATELY - before loading any other components
// Ensure port is open and detected before proceeding
server.listen(Number(port), "0.0.0.0", async () => {
  // Immediately log in a format that might be more detectable by Replit
  console.log(`SERVER READY ON PORT ${port}`);
  console.log(`PORT ${port} OPEN AND READY`);
  console.log(`Listening on port ${port}`);
  
  // Delay loading the full application to ensure port detection
  setTimeout(async () => {
    log(`iREVA server bound to port ${port}`);
    console.log(`[${new Date().toISOString()}] Server port binding successful`);
    
    try {
      await loadFullApplication();
      console.log(`[${new Date().toISOString()}] Full application loaded successfully`);
    } catch (error) {
      console.error('Error loading full application:', error);
    }
  }, isWorkflowStarter ? 0 : 3000); // Only delay if not running under workflow starter
});

// Function to load the full application after port binding
async function loadFullApplication() {
  // Import and set up API routes
  const adminRouter = (await import('./routes/admin')).default;
  const debugAuthRouter = (await import('./routes/debug-auth')).default;
  
  console.log(`[${new Date().toISOString()}] Attaching API routers...`);
  
  // Add routes to the application
  app.use('/api/admin', adminRouter);
  app.use('/api/debug', debugAuthRouter);
  
  // Add a catch-all route for unknown API endpoints
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'Endpoint not found',
      message: 'The requested API endpoint does not exist or is not yet implemented',
      path: req.originalUrl
    });
  });
  
  // Set up Vite for serving the React frontend
  console.log(`[${new Date().toISOString()}] Setting up Vite for frontend...`);
  await setupVite(app, server);
  
  console.log(`[${new Date().toISOString()}] Server initialization complete`);
}
