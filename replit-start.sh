#!/bin/bash

# Replit Startup Script
# This script runs the minimal-replit-start.js file, which:
# 1. Creates a minimal TCP server that binds to port 5000 immediately
# 2. Starts the actual application in a separate process

echo "Starting with Replit bootstrap process..."
node minimal-replit-start.js