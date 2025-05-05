#!/bin/bash

# Ultra-minimal startup script for Replit
# This file should be set as the workflow command

# Print context information
echo "Starting ultra-minimal server on port 5000"
echo "Date: $(date)"

# Run the absolute minimal server
node ultra-minimal-server.cjs

# This should never be reached
echo "ERROR: Server exited unexpectedly"
exit 1