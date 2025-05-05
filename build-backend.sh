#!/bin/bash

# Script to build just the backend part of the iREVA application
echo "Starting iREVA backend build..."

# Set production environment
export NODE_ENV=production

# Build the server with esbuild
echo "Building backend with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Backend build process completed!"
echo "Check the dist directory for the built server files."