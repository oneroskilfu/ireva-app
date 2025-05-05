#!/bin/bash

# Workflow Command Script for Replit
# This script is designed to be used as the workflow command

echo "==== IREVA PLATFORM STARTUP ===="
echo "Date: $(date)"
echo "Starting reverse proxy server..."

# Run the reverse proxy server that binds port 5000 immediately
# and proxies requests to the main application on port 5001
node proxy-reverse.cjs

# This should never be reached as the proxy server stays running
echo "ERROR: Proxy server exited unexpectedly"
exit 1