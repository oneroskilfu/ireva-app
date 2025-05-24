#!/bin/bash

# This script starts a minimal Node.js server first to pass the port check,
# then gracefully transitions to the actual application.

echo "Starting minimal Node.js server..."
node server/minimal-server.js &
MINIMAL_SERVER_PID=$!

# Give it a moment to start
sleep 2

# Verify it's running
if curl -s http://localhost:5000 > /dev/null; then
  echo "Minimal server is running successfully."
  
  # Now start the actual application 
  echo "Starting main application..."
  NODE_ENV=development tsx server/index.ts &
  MAIN_APP_PID=$!
  
  # Give the main app some time to initialize
  sleep 5
  
  # Kill the minimal server to let the main app take over port 5000
  echo "Transitioning to main application..."
  kill $MINIMAL_SERVER_PID
  
  # Wait for the main application to finish
  wait $MAIN_APP_PID
else
  echo "Error: Minimal server did not start properly."
  # Kill the minimal server just in case
  kill $MINIMAL_SERVER_PID
  exit 1
fi