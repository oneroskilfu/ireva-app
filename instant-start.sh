#!/bin/bash

# Ultra-minimal startup script to test Replit port detection
# This script should be used as the workflow command

echo "Starting instant HTTP server on port 5000..."
echo "=========================================="
echo "Time: $(date)"

# Run the instant HTTP server
node instant-http.cjs

# This should never be reached
echo "ERROR: Server exited unexpectedly"
exit 1