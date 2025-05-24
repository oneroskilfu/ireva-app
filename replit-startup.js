/**
 * Replit Startup Optimizer
 * 
 * This script creates a simple HTTP server that binds to port 5000 immediately,
 * then starts the actual application. The server responds to all requests with
 * a 200 status and basic HTML, ensuring Replit can detect it as soon as possible.
 * 
 * Key features:
 * - Uses raw HTTP module (no Express) for fastest possible startup
 * - Binds to 0.0.0.0:5000 with minimal overhead
 * - Logs timestamps to help debug Replit's port detection
 * - Starts the real application as a child process
 */

import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Log with timestamps for debugging
function logWithTime(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

logWithTime('REPLIT STARTUP: Creating minimal HTTP server...');

// Create a simple HTTP server that responds to all requests
const server = http.createServer((req, res) => {
  // Respond with a simple HTML page to all requests
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>iREVA Platform Starting</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
          h1 { color: #2a52be; }
        </style>
        <meta http-equiv="refresh" content="3">
      </head>
      <body>
        <h1>iREVA Platform is Starting</h1>
        <p>Please wait while the application initializes...</p>
        <p><small>This page will refresh automatically</small></p>
      </body>
    </html>
  `);
  
  // Log incoming requests to help debug Replit's port detection
  logWithTime(`Received request: ${req.method} ${req.url}`);
});

// Listen on port 5000 with 0.0.0.0 to be accessible outside container
server.listen(5000, '0.0.0.0', () => {
  logWithTime('REPLIT STARTUP: HTTP server bound to port 5000');
  
  // Now start the actual application
  logWithTime('REPLIT STARTUP: Starting main application...');
  
  const appProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: false
  });
  
  appProcess.on('error', (err) => {
    logWithTime(`REPLIT STARTUP ERROR: Failed to start application: ${err}`);
  });
  
  // The minimal server will continue running alongside the main app
  logWithTime('REPLIT STARTUP: Minimal HTTP server will remain active');
});

// Handle server errors
server.on('error', (err) => {
  logWithTime(`REPLIT STARTUP ERROR: HTTP server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    logWithTime('REPLIT STARTUP ERROR: Port 5000 is already in use');
    logWithTime('REPLIT STARTUP: Attempting to start main application anyway...');
    
    // Try to start the application even if the port is in use
    const appProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: false
    });
  }
});