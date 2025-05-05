#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
fi

# Ultra-fast workflow script with static webview server
echo "Starting static webview server on port 3000..."

# Run the static webview server in the background
# This server is exclusively for the Replit webview
node static-webview-server.cjs &
WEBVIEW_SERVER_PID=$!

# Start the main application in the background
# Explicitly set the PORT environment variable to 5001
echo "Starting main application on port 5001..."
export PORT=5001
export VITE_PORT=3000
export VITE_HOST=0.0.0.0
npm run dev &
MAIN_APP_PID=$!

# Log status
echo "Webview server PID: $WEBVIEW_SERVER_PID"
echo "Main app PID: $MAIN_APP_PID"
echo "Port configuration:"
echo "- Static webview server: 3000"
echo "- Main application: 5001"
echo "- Vite development server: 3000 (configured via environment variables)"
echo "Both servers are now running"

# Keep the script running
wait $WEBVIEW_SERVER_PID $MAIN_APP_PID