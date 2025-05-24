#!/bin/bash

# This script runs the minimal-replit-startup.js to test port binding detection
echo "Starting minimal port binding test"
echo "=================================="

# Run the minimal server
node minimal-replit-startup.cjs

# This will only be reached if the server exits unexpectedly
echo "ERROR: Server exited unexpectedly"
exit 1