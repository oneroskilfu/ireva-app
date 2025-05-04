#!/bin/bash

# Standard startup script for the iREVA application
# This starts the actual application in parallel with the TCP server

# Start the application normally
echo "Starting iREVA application..."
NODE_ENV=development tsx server/index.ts