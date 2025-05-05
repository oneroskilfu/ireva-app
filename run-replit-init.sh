#!/bin/bash

# Replit Initialization Script Runner
# This script runs the replit-init.cjs file for the iREVA platform

echo "===== IREVA PLATFORM REPLIT INITIALIZATION ====="
echo "Date: $(date)"
echo "Starting replit-init.cjs to handle port binding..."

# Run the Replit initialization script
node replit-init.cjs

# This should never be reached as the script stays running
echo "ERROR: Replit initialization script exited unexpectedly"
exit 1