# iREVA Platform: Replit Webview Solution

## Overview

This document explains the multi-server architecture implemented to solve two key challenges with Replit:

1. **Port Detection Issue**: Replit was failing to detect our server binding to port 5000 within its 20-second timeout, causing workflow failures.

2. **Webview Access Issue**: Replit's Webview was defaulting to port 3001 instead of our application port, causing a blank screen when accessing the application through Replit's interface.

## Solution Architecture

We've implemented a three-server solution:

### 1. Port 3000 Server (`server.cjs`)
- Designed specifically for Replit's webview system, which defaults to port 3000
- Acts as a proxy that forwards all requests to the main application on port 5001
- Provides friendly loading screens when the main application is starting up
- Adds CORS headers to support Replit's webview environment

### 2. Port 5000 Server (`direct-webview-server.cjs`)
- Binds immediately to port 5000 to satisfy Replit's port detection requirement
- Serves a redirect page with multiple options to access the main application
- Provides health check and diagnostic endpoints
- Acts as a backup access point for the application

### 3. Port 5001 Server (Main Application)
- Runs the full iREVA platform with all features
- Operates on a separate port to avoid interference from the specialized servers
- Accessed directly by both the port 3000 and port 5000 servers

## Technical Implementation

The implementation uses three concurrent processes:

1. **Workflow Command** (`workflow-command.sh`):
   - Starts all three servers in the correct order
   - Manages process dependencies and logging

2. **Redirect System**:
   - HTML-based redirects using `webview-redirect.html`
   - JavaScript detection of hostname and ports
   - Multiple fallback mechanisms for robustness

3. **Cross-Server Communication**:
   - Health checks between servers
   - Port availability detection
   - Synchronized startup and error handling

## Access Methods

Users can access the application through multiple paths:

1. **Direct Webview** - Using Replit's webview tab, which should connect via the proxy server on port 3000

2. **Direct URL Access** - Using the URLs listed in `IREVA-APP-URL.md`, with port 5001 being the most reliable

3. **Redirect Pages** - Using any of the specialized redirect pages on port 5000

## Troubleshooting

If issues occur:

1. Check which servers are running using the logs
2. Try accessing port 5001 directly
3. Use the `/check-main-app` endpoint on port 3000 or 5000
4. Refer to the documentation in `REPLIT-WEBVIEW-ACCESS.md`