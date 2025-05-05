#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
fi

# Start the optimized webview server immediately for fastest port binding
echo "Starting optimized webview server on port 3000..."
node optimized-webview.js &
WEBVIEW_PID=$!

# Give the webview server a moment to start
sleep 0.5

# Start the main application with proper environment variables
echo "Starting main application on port 5001..."
export PORT=5001
export VITE_PORT=3000
export VITE_HOST=0.0.0.0
npm run dev &
MAIN_APP_PID=$!

# Log server information
echo "Server status:"
echo "- Webview server: PID $WEBVIEW_PID (port 3000)"
echo "- Main application: PID $MAIN_APP_PID (port 5001)"
echo "Both servers are running"

# Keep the script running
wait $WEBVIEW_PID $MAIN_APP_PID