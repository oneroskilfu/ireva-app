# iREVA Platform - Replit Port Solution

## Overview

This document explains the multi-port architecture we've implemented to address Replit's unique constraints:

1. Replit requires a server binding to port 5000 within 20 seconds
2. Replit's webview defaults to port 3000 (or sometimes 3001)
3. The application needs to be accessible through the webview interface

## Port Architecture

We've implemented a three-server solution:

| Port | Server | Purpose |
|------|--------|---------|
| 3000 | Proxy Server | Serves content directly on Replit's default webview port |
| 5000 | Direct Webview Server | Binds immediately for Replit's port detection |
| 5001 | Main Application | Runs the full iREVA platform |

## How It Works

### Port 3000 Server
- Binds to port 3000, which is Replit's default webview port
- Proxies all requests to the main application on port 5001
- Provides immediate feedback if the main app isn't ready yet

### Port 5000 Server
- Binds immediately to satisfy Replit's 20-second requirement
- Provides direct redirects to the main application
- Handles special routes like `/webview` for direct access

### Port 5001 Server
- Runs the full iREVA application with all features
- Operates independently of Replit's port detection mechanism
- Contains the complete application stack

## Startup Sequence

1. The workflow starts all three servers in parallel
2. Port 3000 and 5000 servers bind almost instantly
3. The main application on port 5001 starts up shortly after
4. Users can access the application through any of the three ports

## User Access Options

1. **Replit Webview Tab**: Automatically uses port 3000, showing the application
2. **Direct Port 5001 Access**: Access the main application directly
3. **Port 5000 with /webview path**: Use the direct redirect feature

## Troubleshooting

If you experience issues with the application not appearing in the webview:

1. Run the diagnostic tool: `node webview-diagnostic.js`
2. Check which ports are accessible and which show HTML content
3. Try accessing the application through all three ports directly
4. Ensure the workflow is running with all three servers active

## Benefits of This Approach

1. **Reliability**: Multiple redundant access paths
2. **Speed**: Instant port binding for Replit detection
3. **Flexibility**: Works regardless of which port Replit prefers
4. **User Experience**: Seamless access through standard interfaces