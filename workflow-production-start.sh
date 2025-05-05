#!/bin/bash
# Production Start Workflow for iREVA Platform
# This script starts the production version of the application

# Set environment to production
export NODE_ENV=production

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Check if the production build exists
if [ ! -f "dist/index.js" ]; then
  show_error "Production build not found!"
  show_status "Please run the production build workflow first: './workflow-production-build.sh'"
  exit 1
fi

# Load environment variables
if [ -f "dist/.env" ]; then
  show_status "Loading environment variables from dist/.env..."
  export $(grep -v '^#' dist/.env | xargs)
fi

# Start server
show_status "Starting iREVA Platform in production mode..."
show_status "Binding to port 5001..."
cd dist
node index.js