#!/bin/bash

# Ultra-minimal startup script for Replit's 20-second timeout constraint
# This helps meet Replit's port binding requirement by opening a TCP socket immediately

# Start the TCP port binder first to pass Replit's port check 
echo "Starting TCP server on port 5000..."
node tcp-start.js