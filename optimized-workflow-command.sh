#!/bin/bash

# Optimized Workflow Command for iREVA Platform
# Uses the new application bootstrapper for staged initialization

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
  "./server/bootstrap.cjs"
  "./server/application-bootstrapper.js"
)

# Ensure all critical scripts have execute permissions
for script in "${SCRIPTS[@]}"; do
  if [ -f "$script" ]; then
    log_with_time "Setting executable permissions for $script"
    chmod +x "$script"
  fi
done

# Set optimized environment variables
export NODE_ENV=${NODE_ENV:-"development"}
export MINIMAL_STARTUP="true"
export STAGED_LOADING="true"
export REPLIT_PORT_BINDING="true"
export ULTRA_MINIMAL_DB="true"
export PORT="3000"
export DB_POOL_MAX="2"
export DB_POOL_MIN="0"
export DB_CONNECTION_TIMEOUT="300"
export DB_IDLE_TIMEOUT="5000"

log_with_time "Environment configured for optimized startup"

# Create run directory if it doesn't exist
mkdir -p ./run
log_with_time "Ensured run directory exists"

# Kill any existing Node.js processes (optional, uncomment if needed)
# pkill -f "node" || true
# log_with_time "Cleaned up existing Node.js processes"

# Function to check if port is in use
is_port_in_use() {
  lsof -i:"$1" >/dev/null 2>&1
  return $?
}

# Check if port 3000 is already in use
if is_port_in_use 3000; then
  log_with_time "Warning: Port 3000 is already in use, application may have conflicts"
fi

# Start the application using the bootstrapper
log_with_time "Starting iREVA platform with optimized bootstrapper..."

# Start initial port binding server for immediate response
node -e "
const http = require('http');
const PORT = 3000;
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(\`
    <html>
      <head><title>iREVA Platform</title></head>
      <body>
        <h1>iREVA Platform</h1>
        <p>Server is starting...</p>
        <script>
          setTimeout(() => { location.reload(); }, 2000);
        </script>
      </body>
    </html>
  \`);
});
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`[BIND] Ultra-fast server running on port \${PORT}\`);
  
  // Start the full application in the background
  const { spawn } = require('child_process');
  const child = spawn('node', ['server/application-bootstrapper.js'], {
    detached: true,
    stdio: 'inherit'
  });
  
  // Keep track of the child process
  require('fs').writeFileSync('./run/app.pid', child.pid.toString());
});
"

log_with_time "Port binding server started, application bootstrapper running in background"

# Keep the script alive to maintain the workflow
# This will be killed when the workflow is stopped
while true; do
  # Check if the application is still running
  if [ -f "./run/app.pid" ]; then
    APP_PID=$(cat ./run/app.pid)
    if ! ps -p $APP_PID > /dev/null; then
      log_with_time "Application process no longer running, restarting..."
      # Restart the application here if needed
      break
    fi
  fi
  
  # Sleep to reduce CPU usage
  sleep 5
done