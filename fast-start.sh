#!/bin/bash

# Fast start script for iREVA on Replit
# This uses the ultra-minimal HTTP server to bind quickly

echo "Starting iREVA with ultra-minimal HTTP server..."
node instant-http.cjs &
MINIMAL_PID=$!

# Give it a moment to bind to the port
sleep 1

# Now start the real application in the background
echo "Starting the full iREVA application..."
NODE_ENV=development tsx server/index.ts &
APP_PID=$!

# Wait a bit for the application to initialize
sleep 5

# Kill the minimal server so the real app can bind to port 5000
echo "Transitioning to the full application..."
kill $MINIMAL_PID

# Wait for the full application to complete
wait $APP_PID