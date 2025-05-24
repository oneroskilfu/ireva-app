#!/bin/bash

# Self-healing workflow script for iREVA platform
echo "Starting iREVA platform initialization..."

# Record startup time for performance tracking
STARTUP_TIME=$(date +%s%N | cut -b1-13)

# Function to log with timestamp
log_with_time() {
  local current_time=$(date +%s%N | cut -b1-13)
  local elapsed=$((current_time - STARTUP_TIME))
  echo "[${elapsed}ms] $1"
}

# Ensure this script has execute permissions
chmod +x "$0"
log_with_time "Set execute permission for workflow script"

# Define critical scripts that need execute permissions
SCRIPTS=(
  "./login-server.cjs"
  "./server/bootstrap.js"
  "./run-replit-init.sh"
)

# Ensure all critical scripts have execute permissions
for script in "${SCRIPTS[@]}"; do
  if [ -f "$script" ]; then
    log_with_time "Setting executable permissions for $script"
    chmod +x "$script"
  fi
done

# Set environment variables for optimized startup
export MINIMAL_STARTUP="true"
export STAGED_LOADING="true"
export REPLIT_PORT_BINDING="true"

log_with_time "Environment configured for optimized startup"

# Start webview bridge on port 3000 for Replit webview
log_with_time "Starting webview bridge on port 3000..."
node replit-webview.js &

# Start the React application with your StaticHome homepage
log_with_time "Starting iREVA React application..."
exec npm run dev