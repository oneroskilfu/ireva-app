#!/bin/bash

# quick-start.sh - Direct invoker for server/index.ts with TSX
# This script is designed to minimize startup time and ensure port binding is detected

echo "Starting iREVA application via quick-start.sh..."

# Set environment variables
export NODE_ENV=development

# Start the server using tsx (TypeScript executor)
# The server/index.ts file is designed with a two-phase startup pattern
# that binds to port 5000 immediately before loading the full application
tsx server/index.ts