#!/bin/bash

# Ultra-fast starter for Replit
# This immediately binds a TCP socket to port 5000
# then starts the real application

echo "Starting ultra-minimal TCP server for Replit..."
node tcp-start.js &
TCP_PID=$!

# Only need to wait a tiny bit for TCP binding (which is instantaneous)
sleep 0.2

# Check if the port is bound
if lsof -i :5000 >/dev/null; then
  echo "TCP server successfully bound to port 5000"
else
  echo "TCP server failed to bind to port 5000"
  exit 1
fi

# Start the real application in the background
echo "TCP socket bound. Starting the full iREVA application..."
npm run dev &
APP_PID=$!

# Wait for the application to finish
wait $APP_PID

# Clean up TCP server if still running
if kill -0 $TCP_PID 2>/dev/null; then
  kill $TCP_PID
fi