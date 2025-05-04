// Two-phase server startup optimized for Replit's 20-second timeout constraint
import express from "express";
import { createServer } from "http";
import { log, setupVite } from "./vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log(`[${new Date().toISOString()}] Starting iREVA application...`);

// PHASE 1: Create and start minimal server as quickly as possible
// This is critical to meet Replit's 20-second port binding requirement
const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;
const server = createServer(app);

// Essential endpoint for health checks
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple landing page for initial requests
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>iREVA Platform</title><style>body{font-family:Arial,sans-serif;text-align:center;margin:0;padding:20px;}</style></head><body><h1>iREVA Platform</h1><p>Loading application...</p></body></html>`);
});

// Start server IMMEDIATELY - before loading any other components
// This is the most critical part for Replit to detect the port binding
server.listen(Number(port), "0.0.0.0", async () => {
  log(`iREVA server bound to port ${port}`);
  console.log(`[${new Date().toISOString()}] Server port binding successful`);
  
  // PHASE 2: Now that the port is bound, load the rest of the application
  // Even if this takes longer than 20 seconds, Replit won't time out
  try {
    await loadFullApplication();
    console.log(`[${new Date().toISOString()}] Full application loaded successfully`);
  } catch (error) {
    console.error('Error loading full application:', error);
  }
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
