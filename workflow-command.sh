#!/bin/bash

# Direct login server to ensure Replit webview displays login page
echo "Starting direct login server..."

# Use node directly with our login server for direct access
node direct-login-server.js &
LOGIN_SERVER_PID=$!

# Keep track of our process for cleanup
echo $LOGIN_SERVER_PID > .login-server.pid

# Give the login server a moment to start
sleep 2

# Then start the main application in the background
echo "Starting main application..."
NODE_ENV=development MINIMAL_STARTUP=true tsx server/index.ts &
APP_PID=$!

# Keep track of our process for cleanup
echo $APP_PID > .app-server.pid

# Set up a trap to clean up processes on exit
trap 'kill $(cat .login-server.pid) $(cat .app-server.pid) 2>/dev/null' EXIT

# Keep the workflow running
wait