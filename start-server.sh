#!/bin/bash

# Start a simple HTTP server on port 5000 that responds immediately
echo "Starting simple HTTP server on port 5000"
(
  echo -e "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"status\":\"starting\"}" | nc -l -p 5000 &
  SIMPLE_SERVER_PID=$!
  echo "Simple server started with PID: $SIMPLE_SERVER_PID"
  
  # Start the actual application in the background
  NODE_ENV=development tsx server/index.ts &
  APP_PID=$!
  echo "Application started with PID: $APP_PID"
  
  # Wait for the application to be ready
  sleep 3
  
  # Kill the simple server so the real application can take over
  echo "Killing simple server"
  kill $SIMPLE_SERVER_PID
  
  # Now wait for the application to complete
  wait $APP_PID
)