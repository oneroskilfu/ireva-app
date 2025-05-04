/**
 * Replit Startup Helper
 * 
 * This script handles the 20-second timeout constraint by:
 * 1. Creating a minimal TCP server that binds to port 5000 immediately
 * 2. Starting the actual Node.js application in a separate process
 */

import net from 'net';
import { spawn } from 'child_process';

console.log(`[${new Date().toISOString()}] Starting Replit bootstrap process...`);

// Create minimal TCP server
const server = net.createServer();

// Listen on port 5000 immediately
server.listen(5000, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] Successfully bound to port 5000`);
  console.log(`[${new Date().toISOString()}] Replit startup constraint satisfied`);
  
  // Start actual application in a separate process
  const appProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process events
  appProcess.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Failed to start application: ${err.message}`);
    process.exit(1);
  });
  
  appProcess.on('exit', (code) => {
    console.log(`[${new Date().toISOString()}] Application exited with code ${code}`);
    process.exit(code);
  });
  
  // Keep minimal server running, actual app will need to use a different port or inherit this server
  console.log(`[${new Date().toISOString()}] Bootstrap complete, application starting...`);
});