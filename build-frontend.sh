#!/bin/bash

# Script to build just the frontend part of the iREVA application
echo "Starting iREVA frontend build..."

# Set production environment
export NODE_ENV=production

# Build the frontend with Vite
echo "Building frontend with Vite..."
npx vite build --outDir dist/public

echo "Frontend build process completed!"
echo "Check the dist/public directory for the built assets."