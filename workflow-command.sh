#!/bin/bash

# Set environment variables to optimize the startup
export REPLIT_WORKFLOW_STARTER=true
export PORT=3000

# Start the application directly with minimal overhead
node --import tsx server/index.ts