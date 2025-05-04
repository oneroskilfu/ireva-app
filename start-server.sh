#!/bin/bash

# Optimized startup script for iREVA platform on Replit
# This ensures the server starts within Replit's 20-second timeout

# Start the main application directly
echo "Starting iREVA server..."
NODE_ENV=development npx tsx server/index.ts