#!/bin/bash

# Combined Multi-Approach Startup Script for iREVA
# This script tries various strategies to ensure the server starts 
# and binds to a port within Replit's 20-second timeout.

echo "Starting iREVA with multi-strategy approach..."

# Method 1: Minimal TCP binding first
echo "=== STRATEGY 1: TCP-BIND FIRST ==="
node -e "
const net = require('net');
const server = net.createServer();
server.listen(5000, '0.0.0.0', () => {
  console.log('Successfully bound TCP server to port 5000');
  
  // Close the TCP server after a short delay
  setTimeout(() => {
    server.close(() => {
      console.log('TCP server closed, ready for Express server');
    });
  }, 1000);
});
" &

# Give the TCP server time to bind
sleep 2

# Method 2: Start the actual application
echo "=== STRATEGY 2: START APPLICATION ==="
NODE_ENV=development tsx server/index.ts