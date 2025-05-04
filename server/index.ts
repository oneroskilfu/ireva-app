// Optimized server startup for Replit with fast port binding
import express from "express";
import { createServer } from "http";
import { log } from "./vite";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("Starting iREVA application...");

// Create express app immediately with minimum configuration
const app = express();
app.use(express.json());

// Set up port
const port = process.env.PORT || 5000;

// Create HTTP server 
const server = createServer(app);

// Critical startup endpoints for Replit to detect the open port
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>iREVA Platform</title><style>body{font-family:Arial,sans-serif;text-align:center;margin:0;padding:20px;}</style></head><body><h1>iREVA Platform</h1><p>Loading application...</p></body></html>`);
});

// Load the admin routes and debug auth router
import adminRouter from './routes/admin';
import debugAuthRouter from './routes/debug-auth';

console.log("Attaching debug auth router");

// Add our routes to the main application
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

// Start server immediately - this must happen fast to meet Replit's 20-second limit
server.listen(Number(port), "0.0.0.0", () => {
  log(`iREVA server running on port ${port}`);
  console.log(`Server started successfully at ${new Date().toISOString()}`);
});
