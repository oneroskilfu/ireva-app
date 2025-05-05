#!/bin/bash

# Workflow Command Script for Replit
# This script is designed to be used as the workflow command

echo "==== IREVA PLATFORM STARTUP ===="
echo "Date: $(date)"

# Display information about the ports
echo "Port Configuration:"
echo "- Port 3000: Proxy server for Replit webview"
echo "- Port 5000: Direct webview server (backup)"
echo "- Port 5001: Main application server"

# Start the proxy server for port 3000 (Replit Webview)
echo "Starting proxy server on port 3000 for Replit webview..."
node server.cjs &
PROXY_SERVER_PID=$!

# Run direct webview server as a backup
echo "Starting direct webview server as backup..."
node direct-webview-server.cjs &
WEBVIEW_SERVER_PID=$!

# Start the main application in the background
echo "Starting main application..."
# Set PORT environment variable to 5001 for the main application
export PORT=5001
export MAIN_APP_PORT=5001
export USE_PORT_5001=true
npm run dev &
MAIN_APP_PID=$!

# Function to handle script termination
cleanup() {
  echo "Cleaning up processes..."
  kill $PROXY_SERVER_PID 2>/dev/null
  kill $WEBVIEW_SERVER_PID 2>/dev/null
  kill $MAIN_APP_PID 2>/dev/null
  exit 0
}

# Set up trap for script termination
trap cleanup EXIT INT TERM

# Keep the script running
echo "Application startup complete - waiting for termination signals"
wait $PROXY_SERVER_PID $WEBVIEW_SERVER_PID $MAIN_APP_PID