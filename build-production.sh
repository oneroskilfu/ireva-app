#!/bin/bash

# Build production script for iREVA Application
echo "Starting iREVA production build..."

# Set production environment
export NODE_ENV=production

# First build the frontend with Vite
echo "Building frontend with Vite..."
npx vite build

# Then build the server with esbuild
echo "Building backend with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# If both succeeded, show success message
if [ $? -eq 0 ]; then
  echo "Build completed successfully!"
  echo "Production files are in dist/ directory"
  echo "To start the production server, run: NODE_ENV=production node dist/index.js"
else
  echo "Build failed. Please check the errors above."
  exit 1
fi