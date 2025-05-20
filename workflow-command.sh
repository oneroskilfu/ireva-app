#!/bin/bash

# Ultra-minimal startup for Replit workflow with zero overhead
echo "Starting application server..."

# Ensure permissions are set
chmod +x zero-start.cjs

# Use Node.js directly to minimize startup time and avoid bash overhead
exec node zero-start.cjs