#!/bin/bash

# Ultra-minimal startup for Replit workflow with zero overhead
echo "Starting zero-overhead server..."

# Use Node.js directly to minimize startup time and avoid bash overhead
exec node zero-start.cjs