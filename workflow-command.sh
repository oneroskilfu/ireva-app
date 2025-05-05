#!/bin/bash

# First, start the minimal server to immediately bind to port 3000
node minimal-server.js &
MINIMAL_SERVER_PID=$!

# Give it a moment to fully start
sleep 1

# Then start the full application
npm run dev &
FULL_APP_PID=$!

# Set up signal handling to ensure clean termination
trap "kill $MINIMAL_SERVER_PID $FULL_APP_PID" SIGINT SIGTERM EXIT

# Wait for the process to complete
wait