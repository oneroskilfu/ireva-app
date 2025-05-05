#!/bin/bash

# Workflow Command Script for Replit
# This script is designed to be used as the workflow command

echo "==== IREVA PLATFORM STARTUP ===="
echo "Date: $(date)"
echo "Starting TCP port binding..."

# Run the ultra-minimal TCP server that binds port 5000 immediately
# This ensures Replit can detect the port binding within 20 seconds
node tcp-start.cjs

# This should never be reached as the TCP server stays running
echo "ERROR: TCP server exited unexpectedly"
exit 1