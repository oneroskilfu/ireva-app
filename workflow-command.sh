#!/bin/bash

# Ultra-fast workflow script with direct proxy
echo "Starting direct proxy server on port 3000..."

# Run the direct proxy server in the background
node direct-proxy-server.cjs &
PROXY_SERVER_PID=$!

# Start the main application in the background
echo "Starting main application..."
export PORT=5001
npm run dev &
MAIN_APP_PID=$!

# Log status
echo "Proxy server PID: $PROXY_SERVER_PID"
echo "Main app PID: $MAIN_APP_PID"
echo "Both servers are now running"

# Keep the script running
wait $PROXY_SERVER_PID $MAIN_APP_PID