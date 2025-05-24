#!/bin/bash
# Production Build Workflow for iREVA Platform
# This script is designed to be used with Replit's workflow system

# Set environment to production
export NODE_ENV=production

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show status
function show_status() {
  echo -e "${BLUE}[$(date +"%T")]${NC} $1"
}

# Function to show success
function show_success() {
  echo -e "${GREEN}[$(date +"%T")] SUCCESS:${NC} $1"
}

# Function to show error
function show_error() {
  echo -e "${RED}[$(date +"%T")] ERROR:${NC} $1"
}

# Function to show warning
function show_warning() {
  echo -e "${YELLOW}[$(date +"%T")] WARNING:${NC} $1"
}

# Check if build directory exists, create if not
if [ ! -d "dist" ]; then
  show_status "Creating dist directory..."
  mkdir -p dist
  mkdir -p dist/public
fi

# Show build start message
show_status "Starting iREVA Platform production build..."
show_status "This process may take several minutes to complete."

# Build frontend
show_status "Building frontend application with Vite..."
npx vite build --outDir dist/public

# Check if frontend build succeeded
if [ $? -ne 0 ]; then
  show_error "Frontend build failed!"
  exit 1
else
  show_success "Frontend build completed!"
fi

# Build backend
show_status "Building backend application with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Check if backend build succeeded
if [ $? -ne 0 ]; then
  show_error "Backend build failed!"
  exit 1
else
  show_success "Backend build completed!"
fi

# Copy environment variables
show_status "Copying environment configuration..."
if [ -f ".env.production" ]; then
  cp .env.production dist/.env
  show_success "Copied .env.production to dist/.env"
elif [ -f ".env" ]; then
  cp .env dist/.env
  show_success "Copied .env to dist/.env"
else
  show_warning "No .env file found. Make sure to configure environment variables in production."
fi

# Create version file
show_status "Generating build information..."
echo "iREVA Platform Production Build" > dist/VERSION.txt
echo "Build Date: $(date)" >> dist/VERSION.txt
echo "Node Version: $(node -v)" >> dist/VERSION.txt
echo "NPM Version: $(npm -v)" >> dist/VERSION.txt

# Build complete
show_success "Production build complete!"
show_status "The built application is now available in the dist/ directory."
show_status "To start the production server, run: NODE_ENV=production node dist/index.js"