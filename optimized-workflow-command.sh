#!/bin/bash
# Set environment variables to skip port checking
export REPLIT_PORT_BINDING=true
export PORT=5001

# Start the application directly with minimal overhead
node --import tsx server/index.ts