/**
 * Ultra-minimal HTTP server for Replit that binds immediately to port 5000
 * and responds to basic HTTP requests. This is even simpler than our
 * Express server to ensure the fastest possible port binding.
 */

const http = require('http');
const { spawn } = require('child_process');
const port = 5000;

// Create a minimal HTTP server
const server = http.createServer((req, res) => {
  // Check if request is a health check
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    }));
    return;
  }

  // Default response
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('iREVA application is starting...\n');
});

// Bind to port immediately
console.log(`Starting minimal HTTP server at ${new Date().toISOString()}`);
server.listen(port, '0.0.0.0', () => {
  console.log(`HTTP server bound to port ${port} at ${new Date().toISOString()}`);
  
  // Start the actual application in the background
  console.log('Starting the full iREVA application...');
  const appProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    detached: true
  });
  
  // Log any errors starting the child process
  appProcess.on('error', (err) => {
    console.error('Failed to start application:', err);
  });
});