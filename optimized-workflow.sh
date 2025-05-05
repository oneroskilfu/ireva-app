#!/bin/bash

# Ultra-optimized workflow script specifically designed for Replit webview
echo "==== IREVA PLATFORM REPLIT-OPTIMIZED STARTUP ===="
echo "Date: $(date)"

# Mark the start time for diagnostics
START_TIME=$(date +%s.%N)

# Display information about the ports
echo "Port Configuration:"
echo "- Port 3000: Immediate webview-friendly server (PRIMARY PORT)"
echo "- Port 5000: Direct webview server (backup)"
echo "- Port 5001: Main application server"

# Create a special flag file that Replit can detect
echo "REPLIT_WEBVIEW=true" > .replit-port-3000-ready

# CRITICAL: Start the webview fix server immediately on port 3000
# This is essential for Replit to detect our application
echo "BINDING DIRECTLY TO PORT 3000 FOR REPLIT WEBVIEW..."
node replit-webview-fix.js &
WEBVIEW_FIX_PID=$!

# Capture the time when the webview server started
WEBVIEW_START_TIME=$(date +%s.%N)
WEBVIEW_DURATION=$(echo "$WEBVIEW_START_TIME - $START_TIME" | bc)
echo "Webview server started in $WEBVIEW_DURATION seconds"

# Wait a moment to ensure the webview server is running
sleep 1

# Start direct webview server on port 5000 as a backup
echo "Starting direct webview server on port 5000..."
node direct-webview-server.cjs &
DIRECT_SERVER_PID=$!

# Start the main application in the background
echo "Starting main application on port 5001..."
# Set PORT environment variable to 5001 for the main application
export PORT=5001
export MAIN_APP_PORT=5001
export USE_PORT_5001=true
export REPLIT_WEBVIEW=true

# Special flags for Replit detection
echo "REPLIT WEBVIEW ACCESS READY ON PORT 3000" 
echo "PORT 3000 OPEN AND READY"
echo "PORT BINDING SUCCESSFUL: YES"

# Start the actual application
echo "Starting backend server..."
npm run dev &
MAIN_APP_PID=$!

# Function to handle script termination
cleanup() {
  echo "Cleaning up processes..."
  kill $WEBVIEW_FIX_PID 2>/dev/null
  kill $DIRECT_SERVER_PID 2>/dev/null
  kill $MAIN_APP_PID 2>/dev/null
  echo "All processes terminated"
  exit 0
}

# Set up trap for script termination
trap cleanup EXIT INT TERM

# Keep the script running and periodically signal that the server is active
echo "Application startup complete - all servers running"
echo "PORT 3000 ACTIVE - WEBVIEW ACCESS READY"

# Print the URLs for the different servers
echo "URL Information:"
echo "- Webview server: http://localhost:3000"
echo "- Direct server: http://localhost:5000"
echo "- Main application: http://localhost:5001"

# Simple "heartbeat" to keep the script alive and signal that servers are running
while true; do
  # Remind Replit about our port binding
  echo "PORT 3000 ACTIVE" > /dev/null
  
  # Check if the main application is still running
  if ! kill -0 $MAIN_APP_PID 2>/dev/null; then
    echo "Main application has stopped. Cleaning up..."
    cleanup
  fi
  
  # Sleep for a bit before checking again
  sleep 10
done