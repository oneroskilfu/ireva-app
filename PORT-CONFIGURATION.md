# Replit Port Configuration Guide

This guide explains how to properly configure your Replit workflow to use our dual-port solution.

## Current Setup

Our solution uses a multi-server architecture:

- **Ultra-minimal server** on port 3000 (for Replit detection)
- **Main application** on port 5001 (for actual functionality)

## Configuring the Workflow

To ensure Replit's webview works correctly with our solution, follow these steps:

### Step 1: Configure the Workflow

In your .replit file, update the run configuration to use the wait_for_port option:

```toml
[nix]
channel = "stable-22_11"

[env]
XDG_CONFIG_HOME = "/home/runner/.config"
PORT = "3000"  # This is the port Replit will check

[deployment]
build = ["npm", "install"]
run = ["bash", "workflow-command.sh"]

[deployment.ports]
3000 = "Port 3000 - Webview Access"
5001 = "Port 5001 - Main Application"

[deployment.env]
AUTO_REDIRECT = "true"

[workflow]
logoutStale = false
wait_for_port = 3000  # Tell Replit to detect port 3000
```

### Step 2: Use the Workflow Script

Ensure your workflow is using our workflow-command.sh script, which properly starts both servers:

```bash
#!/bin/bash

# Start the ultra-minimal server in the background
node ultra-minimal-server.cjs &
MINIMAL_SERVER_PID=$!

# Start the main application on port 5001
export PORT=5001
npm run dev &
MAIN_APP_PID=$!

# Keep the script running
wait $MINIMAL_SERVER_PID $MAIN_APP_PID
```

### Step 3: Verify Configuration

After updating your configuration:

1. Click the "Stop" button if the application is running
2. Click "Run" to restart with the new configuration
3. Verify the webview shows the loading page (not "Run this app to see results here")
4. Check that you are automatically redirected to the main application

## Manual Configuration

If you can't modify the .replit file directly, you can still access the application using the direct port URLs:

```
https://[replit-id]-5001.replit.dev/
```

Where [replit-id] is your Replit project identifier.

## Troubleshooting

If you still encounter issues:

1. Ensure workflow-command.sh is executable (run `chmod +x workflow-command.sh`)
2. Check the console logs for any error messages
3. Verify both servers are binding successfully (look for "PORT 3000 OPEN AND READY" and "PORT 5001 OPEN AND READY")
4. Try accessing the application directly via port 5001

## Advanced Configuration

For more advanced configurations, such as custom domains or additional security measures, refer to the DUAL-PORT-SOLUTION.md file.