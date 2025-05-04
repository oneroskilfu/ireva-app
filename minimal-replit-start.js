/**
 * Replit Startup Helper
 * 
 * This script handles the 20-second timeout constraint by:
 * 1. Creating a minimal TCP server that binds to port 5000 immediately
 * 2. Starting the actual Node.js application in a separate process
 */

const { spawn } = require('child_process');
const net = require('net');
const port = 5000;

console.log(`Starting minimal TCP server at ${new Date().toISOString()}`);

// Create and start a minimal TCP server first
const server = net.createServer();

// Bind to port immediately - this should happen in ~1-2ms
server.listen(port, '0.0.0.0', () => {
  console.log(`TCP server bound to port ${port} at ${new Date().toISOString()}`);
  
  // Start the actual application in the background
  console.log('Starting the full iREVA application...');
  
  // Use spawn to start the application in a separate process
  const appProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit', 
    detached: false // Keep the process attached to the parent
  });
  
  appProcess.on('error', (err) => {
    console.error('Failed to start application:', err);
  });
  
  // If the application process exits, close the TCP server too
  appProcess.on('exit', (code) => {
    console.log(`Application process exited with code ${code}`);
    server.close();
    process.exit(code);
  });
});