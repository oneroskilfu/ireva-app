#!/bin/bash

# cjs-start.sh - CommonJS version of the startup script
# This script runs the CommonJS version of our port binding server

echo "Starting iREVA with CommonJS port binding server..."
echo "================================================="
echo "$(date): Starting CommonJS minimal server on port 5000"

# Clear any existing coordination file
if [ -f "port-status.json" ]; then
  rm port-status.json
  echo "Cleared previous coordination file"
fi

# Run the CommonJS version
node replit-starter.cjs

# This should never be reached
echo "ERROR: replit-starter.cjs exited unexpectedly!"
exit 1