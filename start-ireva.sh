#!/bin/bash

# start-ireva.sh: Script to start the iREVA application with Replit workflow optimization
# This script runs the workflow-starter.js file to ensure proper port binding detection by Replit

echo "Starting iREVA platform with Replit workflow optimization..."

# Use node to run the workflow starter
node workflow-starter.js

# Exit with the same status code
exit $?