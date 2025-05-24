/**
 * Replit Port Binding Diagnostic Tool
 * 
 * This script helps diagnose issues with Replit's port binding detection.
 * It creates a simple HTTP server on port 5000 and logs detailed information
 * about the port binding process, making requests to itself to validate the
 * server is responsive.
 */

import http from 'http';
import { setTimeout } from 'timers/promises';

// Configuration
const PORT = 5000;
const HOST = '0.0.0.0';
const DIAGNOSTIC_DURATION = 30000; // Run diagnostic for 30 seconds

// Timestamp logger
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

log('Starting Replit port binding diagnostic tool...');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  log(`Received request: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Replit Port Diagnostic</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2a52be; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>Replit Port Binding Diagnostic</h1>
        <p>This server is running a diagnostic test for Replit port binding detection.</p>
        <p>Current server time: ${timestamp}</p>
        <p>Listening on: ${HOST}:${PORT}</p>
        <p>Request received: ${req.method} ${req.url}</p>
        <p>Request headers:</p>
        <pre>${JSON.stringify(req.headers, null, 2)}</pre>
      </body>
    </html>
  `);
});

// Start the server
server.listen(PORT, HOST, async () => {
  log(`Diagnostic HTTP server is bound to ${HOST}:${PORT}`);
  
  // Log detailed information about the server
  log(`Server address info: ${JSON.stringify(server.address())}`);
  
  // Make a self-request to verify the server is working
  await setTimeout(1000); // Wait 1 second before self-test
  await makeRequest();
  
  // Make periodic self-tests
  const intervalId = setInterval(() => {
    makeRequest();
  }, 5000);
  
  // Stop after diagnostic duration
  setTimeout(() => {
    clearInterval(intervalId);
    log('Diagnostic complete. Keeping server running for observation.');
  }, DIAGNOSTIC_DURATION);
});

// Function to make a request to our own server
async function makeRequest() {
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/diagnostic-self-test',
    method: 'GET',
    timeout: 3000
  };
  
  log('Making self-test request...');
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      log(`Self-test response: HTTP ${res.statusCode}`);
      log(`Self-test response length: ${data.length} bytes`);
    });
  });
  
  req.on('error', (e) => {
    log(`Self-test request error: ${e.message}`);
  });
  
  req.on('timeout', () => {
    log('Self-test request timed out');
    req.destroy();
  });
  
  req.end();
}

// Handle server errors
server.on('error', (err) => {
  log(`Server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    log('Port 5000 is already in use. This may interfere with Replit port detection.');
  }
});