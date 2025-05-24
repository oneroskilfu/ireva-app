#!/bin/bash

# Master build script for iREVA Application
# This handles the entire build process with proper error checking

# Function to display status messages
function echo_status() {
  echo "=========================================="
  echo "$1"
  echo "=========================================="
}

# Function to check for errors
function check_error() {
  if [ $1 -ne 0 ]; then
    echo_status "ERROR: $2 failed with exit code $1"
    exit $1
  fi
}

# Clean up existing build if it exists
echo_status "Preparing build environment"
rm -rf dist
mkdir -p dist
mkdir -p dist/public

# Build the frontend
echo_status "Building the frontend (this may take several minutes)"
./build-frontend.sh
check_error $? "Frontend build"

# Build the backend
echo_status "Building the backend"
./build-backend.sh
check_error $? "Backend build"

# Copy any necessary assets
echo_status "Copying additional assets"
if [ -d "public" ]; then
  cp -r public/* dist/public/ 2>/dev/null
fi

# Copy environment file for production if it exists
if [ -f ".env.production" ]; then
  cp .env.production dist/.env
elif [ -f ".env" ]; then
  cp .env dist/.env
fi

# Create a version file for reference
echo "Build completed on $(date)" > dist/VERSION.txt
echo "iREVA Platform Production Build" >> dist/VERSION.txt

echo_status "Build completed successfully!"
echo "To start the production server, run: ./start-production.sh"
echo "The application will be available on port 5001"