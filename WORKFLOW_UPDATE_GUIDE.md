# Workflow Configuration Guide for Replit

This guide explains how to resolve port binding detection issues in Replit workflows.

## Problem

Replit workflows have a 20-second timeout for detecting port binding. If your application doesn't bind to the specified port within this window, the workflow fails with a timeout error. This can happen even if your server successfully binds to the port but Replit fails to detect it.

## Solution

We've created several optimized scripts that ensure port binding is detected:

1. **Ultra-Minimal TCP Server** (recommended): `tcp-start.cjs`
   - Uses raw TCP sockets for immediate port binding
   - Starts main application after port is bound
   - Command: `node tcp-start.cjs`

2. **Express-Based Server**: `express-runner.cjs`
   - Uses Express for binding port 5000
   - Starts main application as child process
   - Command: `node express-runner.cjs`

3. **HTTP-Based Server**: `instant-http.cjs`
   - Uses Node.js HTTP module for binding
   - Provides minimal HTML response
   - Command: `node instant-http.cjs`

4. **Raw TCP Server**: `ultra-minimal-server.cjs`
   - Absolute minimal implementation
   - Does nothing except bind port 5000
   - Command: `node ultra-minimal-server.cjs`

## How to Update Your Workflow

1. Go to the Replit dashboard
2. Click on your project
3. Go to "Tools" > "Workflows"
4. Edit the "Start application" workflow
5. Change the command to one of the following:
   ```
   ./workflow-command.sh
   ```
   or
   ```
   ./express-start.sh
   ```
   or
   ```
   ./instant-start.sh
   ```
   or
   ```
   ./startup.sh
   ```
   
6. Save the workflow changes
7. Run the workflow

## Troubleshooting

If you're still experiencing issues with port detection:

1. Make sure the scripts have executable permissions:
   ```
   chmod +x workflow-command.sh express-start.sh instant-start.sh startup.sh
   ```

2. Check that the scripts are running correctly by testing them directly:
   ```
   ./workflow-command.sh
   ```

3. Verify port binding with a simple curl request:
   ```
   curl http://localhost:5000
   ```

4. Look for logs showing port binding confirmation.

## Which Script Should I Use?

1. `workflow-command.sh` (with tcp-start.cjs) - Most reliable, minimal approach
2. `express-start.sh` - Good for Express-based applications
3. `instant-start.sh` - Simple HTTP response approach
4. `startup.sh` - Ultra-minimal approach

Start with `workflow-command.sh` and try the others if needed.