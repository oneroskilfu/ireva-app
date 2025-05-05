#!/bin/bash

# Express server starter script for Replit workflows
# This script runs express-runner.cjs to bind port 5000 and start the main app

echo "Starting Express server with port binding optimization..."
echo "========================================================"
echo "Date: $(date)"

# Run the Express runner
node express-runner.cjs

# This should never be reached
echo "ERROR: Express runner exited unexpectedly"
exit 1