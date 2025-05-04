#!/bin/bash

# Ultra-minimal startup script for Replit's 20-second timeout constraint
# This script starts a minimal HTTP server that binds to port 5000 immediately
# and then starts the actual application in a separate process

echo "Starting iREVA platform with fast port binding..."
node minimal-replit-start.js