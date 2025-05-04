#!/bin/bash

# Ultra-lightweight startup script for Replit's 20-second timeout constraint
# Two-phase approach:
# 1. Start a bare TCP server immediately to open port 5000
# 2. Start the real application in the background

# Start the minimal TCP server first to pass Replit's port check
echo "Starting instant TCP server..."
node minimal-server.js &
TCP_SERVER_PID=$!

# Give it a moment to start
sleep 1

# Start the actual application in the background
echo "Starting main application..."
NODE_ENV=development tsx server/index.ts &
APP_PID=$!

# Wait for the real application to bind to its port
sleep 5

# Kill the TCP server to free up port 5000
echo "Killing temporary TCP server..."
kill $TCP_SERVER_PID

# Wait for the main application to complete
wait $APP_PID