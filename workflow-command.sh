#!/bin/bash

# Ultra-fast workflow script with static webview server
echo "Starting static webview server on port 3000..."

# Run the static webview server in the background
node static-webview-server.cjs &
WEBVIEW_SERVER_PID=$!

# Start the main application in the background
echo "Starting main application on port 5001..."
export PORT=5001
npm run dev &
MAIN_APP_PID=$!

# Log status
echo "Webview server PID: $WEBVIEW_SERVER_PID"
echo "Main app PID: $MAIN_APP_PID"
echo "Both servers are now running"

# Keep the script running
wait $WEBVIEW_SERVER_PID $MAIN_APP_PID