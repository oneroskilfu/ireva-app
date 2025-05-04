/**
 * Ultra-lightweight Express server
 * Designed to open port 5000 within Replit's 20-second timeout
 */
import express from 'express';
import { createServer } from 'http';

// Create express app with minimal middleware
const app = express();
app.use(express.json());

// Set up port
const port = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple root page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>iREVA Platform</title>
        <style>body{font-family:sans-serif;text-align:center;margin:40px;}</style>
      </head>
      <body>
        <h1>iREVA Platform</h1>
        <p>Server is starting...</p>
        <p>Current time: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
});

// Debug endpoint
app.post('/api/debug/create-admin', (req, res) => {
  res.status(200).json({
    message: 'Debug admin endpoint activated',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Start server immediately
try {
  server.listen(port, '0.0.0.0', () => {
    console.log(`Instant server running on port ${port}`);
    
    // Log server ready for Replit's port checker
    console.log(`Server is ready on port ${port}`);
  });
} catch (error) {
  console.error('Error starting server:', error);
}