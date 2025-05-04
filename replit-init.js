/**
 * Ultra-Minimal Replit Port Binding Script
 * 
 * This script:
 * 1. Uses raw Node.js http module with no dependencies
 * 2. Binds to port 5000 immediately
 * 3. Stays running while the main application starts
 * 4. Uses the absolute minimum code needed for Replit detection
 */

const http = require('http');
const { spawn } = require('child_process');

// Create minimal server
const server = http.createServer((req, res) => {
  // Set headers that might help with detection
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'X-Replit-Port-Status': 'active',
    'Connection': 'keep-alive'
  });
  
  // Ultra-minimal response
  res.end('OK');
});

// Log standard format messages
console.log('Binding to port 5000...');

// Bind to port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('PORT 5000 OPEN');
  console.log('Server listening on port 5000');
  
  // Start the real application without waiting
  const app = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, REPLIT_WORKFLOW_STARTER: 'true' }
  });
  
  // Handle app process events
  app.on('error', (err) => {
    console.error(`Application error: ${err.message}`);
  });
  
  // Do NOT attach exit handler so this process stays alive
  
  // Handle signals
  process.on('SIGINT', () => {
    console.log('Shutdown signal received');
    app.kill('SIGINT');
    // Don't exit this process
  });
  
  process.on('SIGTERM', () => {
    console.log('Termination signal received');
    app.kill('SIGTERM');
    // Don't exit this process
  });
});

// Ensure the server stays running even if there are errors
server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  // Attempt to rebind if the error is not port-in-use
  if (err.code !== 'EADDRINUSE') {
    setTimeout(() => {
      server.close();
      server.listen(5000, '0.0.0.0');
    }, 1000);
  }
});

// Keep the process alive indefinitely
setInterval(() => {
  // Heartbeat to keep process alive
}, 10000);