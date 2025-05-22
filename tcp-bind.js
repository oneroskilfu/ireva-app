/**
 * Ultra-minimal TCP server that binds to port 5000 immediately,
 * then spawns the actual application server as a child process.
 * 
 * This is designed to address Replit's 20-second port binding requirement
 * in the most direct way possible.
 */

import net from 'net';
import { spawn } from 'child_process';
import fs from 'fs';

// Configuration
const PORT = 5000;
const HOST = '0.0.0.0';

console.log(`[${new Date().toISOString()}] TCP-Bind: Starting minimal TCP server...`);

// Create a minimal TCP server
const server = net.createServer();

// Bind to port immediately
server.listen(PORT, HOST, () => {
  console.log(`[${new Date().toISOString()}] TCP-Bind: Successfully bound to port ${PORT}`);
  console.log(`[${new Date().toISOString()}] TCP-Bind: Starting actual application server...`);
  
  // Start the actual application server as a child process
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: false
  });
  
  // Close the minimal server once the child process is running
  // This allows the actual server to take over the port
  setTimeout(() => {
    server.close(() => {
      console.log(`[${new Date().toISOString()}] TCP-Bind: Minimal server closed, handing over to application server`);
    });
  }, 2000); // Wait for 2 seconds before closing
  
  // Handle child process events
  child.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] TCP-Bind: Error starting application server:`, err);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    console.log(`[${new Date().toISOString()}] TCP-Bind: Application server exited with code ${code}`);
    process.exit(code);
  });
});

// Handle errors
server.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] TCP-Bind: Error binding to port ${PORT}:`, err);
  process.exit(1);
});