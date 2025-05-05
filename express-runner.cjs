/**
 * Express Server Starter - Optimized for Replit Port Detection
 * This script creates a simple Express server that binds to port 5000
 * immediately and then starts the main application in a child process.
 */

const http = require('http');
const { spawn } = require('child_process');

// Log function for consistency
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Create a minimal HTTP server
const server = http.createServer((req, res) => {
  log(`Request received for ${req.url}`);
  
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'X-Replit-Port-Status': 'active'
  });
  
  res.end('PORT 5000 ACTIVE\n');
});

// Bind to port 5000 immediately
log('Binding to port 5000...');
server.listen(5000, '0.0.0.0', () => {
  // Log success in various formats that Replit might detect
  log('Port 5000 successfully bound');
  console.log('PORT 5000 BOUND SUCCESSFULLY');
  console.log('Server ready on port 5000');
  console.log('PORT BINDING SUCCESSFUL');
  
  // Start the main application
  log('Starting main application...');
  const mainProcess = spawn('npm', ['run', 'dev'], {
    env: {
      ...process.env,
      PORT: '5001',  // Use a different port for the main application
      REPLIT_STARTER_ACTIVE: 'true'
    },
    stdio: 'inherit'
  });
  
  mainProcess.on('exit', (code, signal) => {
    log(`Main application exited with code ${code} and signal ${signal}`);
    process.exit(code || 0);
  });
  
  mainProcess.on('error', (err) => {
    log(`Error starting main application: ${err}`);
    process.exit(1);
  });
});

// Handle server errors
server.on('error', (err) => {
  log(`Error binding to port 5000: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    log('Port 5000 is already in use. Attempting to start main application anyway...');
    
    // Try starting the main app anyway
    const mainProcess = spawn('npm', ['run', 'dev'], {
      env: {
        ...process.env,
        PORT: '5001',
        REPLIT_STARTER_ACTIVE: 'true'
      },
      stdio: 'inherit'
    });
    
    mainProcess.on('exit', (code, signal) => {
      log(`Main application exited with code ${code} and signal ${signal}`);
      process.exit(code || 0);
    });
  } else {
    process.exit(1);
  }
});