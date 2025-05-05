#!/bin/bash

# Ultra-fast workflow script that starts immediately
echo "Starting ultra-minimal server on port 3000..."

# Run the ultra-minimal server in the background
node ultra-minimal-server.cjs &
MINIMAL_SERVER_PID=$!

# Start the main application in the background
echo "Starting main application..."
export PORT=5001
npm run dev &
MAIN_APP_PID=$!

# Keep the script running
wait $MINIMAL_SERVER_PID $MAIN_APP_PID