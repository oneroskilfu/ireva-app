#!/bin/bash

# replit-start.sh: Replit-specific startup script for the iREVA platform
# This script should be used as the command for the "Start application" workflow in Replit

echo "Starting iREVA platform with Replit port binding optimization..."
echo "================================================================"
echo "Port binding process initiated on $(date)"
echo "================================================================"

# Set specific environment variables that might help Replit detection
export REPLIT_PORT_BINDING=true
export PORT=5000

# Ensure cleanup on script exit
cleanup() {
  echo "Cleaning up processes..."
  if [ -n "$SERVER_PID" ]; then
    echo "Terminating server process: $SERVER_PID"
    kill -TERM "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  exit 0
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Run the optimized port binding script
node replit-starter.cjs

# This line should not be reached as the starter script should keep the process running
echo "ERROR: Starter script exited unexpectedly"
exit 1