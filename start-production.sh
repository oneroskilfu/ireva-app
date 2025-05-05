#!/bin/bash

# Script to start the iREVA application in production mode
echo "Starting iREVA in production mode..."

# Set production environment
export NODE_ENV=production

# Check if the build exists
if [ ! -f "dist/index.js" ]; then
  echo "ERROR: Production build not found!"
  echo "Please run the build scripts first:"
  echo "  1. Run './build-frontend.sh' to build the frontend"
  echo "  2. Run './build-backend.sh' to build the backend"
  exit 1
fi

# Start the production server
echo "Starting production server..."
node dist/index.js