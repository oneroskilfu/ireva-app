# iREVA Platform - Replit Workflow Solution

## Overview

This document explains how we've optimized the iREVA platform to work seamlessly with Replit's workflow and port detection system.

## The Challenge

Replit's workflow system has two key constraints that needed to be addressed:

1. **20-Second Timeout**: Replit requires servers to bind to a port within 20 seconds, or it considers the workflow failed
2. **Webview Port Binding**: The Replit webview expects content on port 3000/3001, but our main application runs on port 5000/5001

## Our Solution: Multi-Server Architecture

We implemented a specialized three-component system:

### 1. Ultra-Minimal Server (Port 3000)
- Binds to port 3000 immediately (typically within 50ms)
- Uses CommonJS for maximum compatibility and fastest startup
- Serves as the initial entry point for Replit's webview
- Provides a loading page with auto-redirect functionality
- Displays multiple URL access options if redirection fails

### 2. Main Application (Port 5001)
- Full iREVA platform with all functionality
- Runs on port 5001 to avoid conflicts with the webview port
- Configured specifically for the Replit environment

### 3. Workflow Orchestration
- `workflow-command.sh` coordinates the startup process
- Starts servers in the optimal sequence
- Provides proper cleanup on shutdown

## Key Features

1. **Immediate Port Detection**: The ultra-minimal server binds within milliseconds, well under Replit's 20-second timeout
2. **Smart URL Generation**: Handles Replit's unique domain formats
3. **Auto-Redirect Logic**: Automatically sends users to the right location
4. **Multiple Access Options**: Provides fallback URLs if auto-redirect fails
5. **Technical Details Panel**: Shows debugging information for troubleshooting

## Usage Instructions

When running the iREVA platform in Replit:

1. Click the "Run" button
2. You'll see a loading page initially
3. Once the main application is ready, you'll be automatically redirected
4. If not redirected automatically, use one of the manual access links provided

## Files Involved

- `ultra-minimal-server.cjs`: The ultra-lightweight server for port 3000
- `workflow-command.sh`: The workflow script that manages the startup process
- `IREVA-APP-URL.md`: Documentation of all URL access methods
- `WORKFLOW_UPDATE_GUIDE.md`: Detailed explanation of the technical approach

## Technical Implementation

For developers who need to understand or modify this setup:

1. The CommonJS server was chosen for maximum compatibility with Node.js
2. We use environment variable detection to determine if we're running in Replit
3. URL generation handles multiple Replit domain formats
4. Port binding is optimized for immediate detection
5. The application startup sequence is carefully orchestrated to ensure reliability

## Troubleshooting

If you encounter issues accessing the application:

1. Check the console logs for any error messages
2. Try the direct port access URLs from IREVA-APP-URL.md
3. Restart the workflow
4. Verify the Replit domain format in your access URL