# Replit Workflow Update Guide

This guide explains how the iREVA platform has been optimized to work effectively with Replit's workflow system.

## Problem Solved

We've addressed two key challenges with Replit:

1. **Port Detection Issue**: Replit's workflow system fails to detect port binding even when a server successfully binds to port 5000 within approximately 1 second. This causes workflow failures with the error message "Server didn't open port 5000 after 20000ms."

2. **Webview Port Mismatch**: Replit's Webview defaults to ports 3000/3001 instead of port 5000 where our main application runs, causing the "Run this app to see the results here" message to appear instead of the application.

## Solution Architecture

We've implemented a multi-server architecture to ensure both reliable port detection and proper webview functionality:

1. **Ultra-Minimal Server (Port 3000)**:
   - Uses CommonJS for maximum compatibility
   - Binds to port 3000 immediately (within milliseconds)
   - Serves a simple landing page with auto-redirect capabilities
   - Provides multiple URL access options if automatic redirection fails

2. **Main Application (Port 5001)**:
   - Runs the actual iREVA platform with full functionality
   - Avoids port conflicts with Replit's webview port (3000)
   - Ensures stable operation once the application is fully loaded

## Implementation Details

The implementation uses these key files:

- **ultra-minimal-server.cjs**: Ultra-lightweight server that binds immediately to port 3000
- **workflow-command.sh**: Starts both servers in the correct sequence
- **IREVA-APP-URL.md**: Documentation of all URL access options

## Technical Approach

1. **Immediate Port Binding**: The ultra-minimal server binds to port 3000 within milliseconds, ensuring Replit detects it within its 10-second timeout window
2. **Dynamic URL Generation**: Generates multiple URL formats to maximize the chances of successful access
3. **Auto-Redirect Mechanism**: Automatically redirects users to the main application when it's ready
4. **Fallback Options**: Provides multiple manual access options if automatic redirection fails

## Usage

When running the application in Replit:

1. Click the "Run" button at the top
2. The webview will initially show a loading page
3. Once the main application is ready, you'll be automatically redirected
4. If not redirected, use one of the manual access links provided on the loading page

## Troubleshooting

If you encounter issues:

1. Use the direct port access URLs (documented in IREVA-APP-URL.md)
2. Check the console logs for any error messages
3. Try restarting the application
4. Ensure you're using the correct Replit domain format