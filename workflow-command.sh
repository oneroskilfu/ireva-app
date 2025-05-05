#!/bin/bash

# Workflow Command Script for Replit
# This script is designed to be used as the workflow command

echo "==== IREVA PLATFORM STARTUP ===="
echo "Date: $(date)"

# Display information about the ports
echo "Port Configuration:"
echo "- Port 5000: Direct webview server for Replit webview"
echo "- Port 5001: Main application server (starts afterwards)"

echo "Starting direct webview server for fast access..."

# Run our server that directly displays the homepage in the webview
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
  kill $WEBVIEW_SERVER_PID 2>/dev/null
  kill $MAIN_APP_PID 2>/dev/null
  exit 0
}

# Set up trap for script termination
trap cleanup EXIT INT TERM

# Keep the script running
echo "Application startup complete - waiting for termination signals"
wait $WEBVIEW_SERVER_PID $MAIN_APP_PID