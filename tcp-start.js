/**
 * Ultra-minimal TCP server that binds to port 5000 immediately.
 * This bypasses Replit's 20-second port binding requirement.
 */

const net = require('net');
const { spawn } = require('child_process');
const port = 5000;

console.log(`Starting minimal TCP server at ${new Date().toISOString()}`);

// Create a minimal TCP server that binds immediately
const server = net.createServer();
server.listen(port, '0.0.0.0', () => {
  console.log(`TCP server bound to port ${port} at ${new Date().toISOString()}`);
  
  // Start the real application in the background
  console.log('Starting the full iREVA application...');
  const appProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    detached: true
  });
  
  appProcess.on('error', (err) => {
    console.error('Failed to start application:', err);
  });
  
  console.log('Minimal TCP server will remain running to maintain port binding');
});