#!/bin/bash

# Workflow Command Script for Replit
# This script is designed to be used as the workflow command

echo "==== IREVA PLATFORM STARTUP ===="
echo "Date: $(date)"

# Display information about the ports
echo "Port Configuration:"
echo "- Port 5000: Proxy server (for Replit port detection)"
echo "- Port 5001: Main application (mapped to external port 3001)"

# Special handling for the Replit environment
if [ -f ./replit_webview_handled ] && [ -s ./replit_webview_handled ]; then
  echo "Using previously determined port settings..."
else
  echo "Setting up for first run..."
  
  # Update known hosts
  echo "OPTIONS='-o ServerAliveInterval=60'" > ~/.ssh/config
  echo "Creating port indicator file for future runs..."
  echo "PROXY_PORT=5000" > ./replit_webview_handled
  echo "MAIN_PORT=5001" >> ./replit_webview_handled
fi

echo "Starting reverse proxy server..."

# Run the reverse proxy server that binds port 5000 immediately
# and proxies requests to the main application on port 5001
node proxy-reverse.cjs

# This should never be reached as the proxy server stays running
echo "ERROR: Proxy server exited unexpectedly"
exit 1