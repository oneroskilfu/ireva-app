#!/bin/bash

# Simple workflow script for testing
echo "==== STARTING SIMPLE SERVER ===="
echo "Opening port 3000 immediately..."

# Create a very simple HTTP server on port 3000
node -e "
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>iREVA Platform is starting...</h1><p>Please wait while the application loads.</p>');
}).listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
  console.log('PORT 3000 OPEN');
});
" &
SERVER_PID=$!

# Keep script running
echo "Simple HTTP server running on port 3000"
echo "PORT 3000 OPENED"
echo "Waiting for termination signal..."

# Wait for termination signal
wait $SERVER_PID