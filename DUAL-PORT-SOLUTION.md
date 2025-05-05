# Dual-Port Architecture Solution for Replit

This document explains the dual-port architecture implemented for the iREVA platform to solve Replit's webview port binding detection issues.

## Problem Overview

Replit's environment has two specific challenges:

1. **Port Binding Detection**: Replit requires applications to bind to a port within 20 seconds, or it considers the startup failed. However, even when the iREVA application was binding to port 5000 within 1 second, Replit would sometimes fail to detect it.

2. **Webview Port Expectation**: Replit's webview component expects applications to run on port 3000 or 3001. When accessing a different port like 5001, users would see a "Run this app to see the results here" message.

## Solution: Dual-Port Architecture

Our solution implements a dual-port architecture:

### 1. Static Webview Server (Port 3000)

- A lightweight HTTP server that binds to port 3000 immediately
- Serves static HTML content with links to the main application
- Provides multiple access methods for the main application:
  - Direct links to open in a new tab
  - Iframe embedding for in-page viewing
  - Auto-redirect options for seamless experience

### 2. Main Application Server (Port 5001)

- The full iREVA application running on port 5001
- Handles all business logic, data, and main functionality
- Uses its own internal routing and API system

## Implementation Details

### Key Files

1. **static-webview-server.cjs**
   - Binds to port 3000 immediately
   - Serves static HTML pages with links to the main application
   - Logs detailed information about port binding

2. **open-main-app.html**
   - Main interface shown to users on port 3000
   - Provides buttons and links to access the full application
   - Includes clear instructions and information

3. **open-app.js**
   - Sophisticated URL generation for Replit environment
   - Handles various Replit URL formats and domain structures
   - Ensures proper redirection to the main application

4. **direct-app-access.html**
   - Alternative interface with iframe embedding
   - Allows users to see the main application without leaving the tab

5. **workflow-command.sh**
   - Orchestrates the startup of both servers
   - Sets environment variables and handles process management
   - Ensures proper cleanup on shutdown

## Architecture Diagram

```
┌──────────────────────────────────────┐     ┌───────────────────────────────┐
│                                      │     │                               │
│  Static Webview Server (Port 3000)   │     │ Main Application (Port 5001)  │
│  --------------------------------    │     │ -----------------------------  │
│  - Fast port binding                 │     │ - Full iREVA platform         │
│  - Static HTML content               │     │ - React frontend              │
│  - Access options for main app       │     │ - Express backend             │
│                                      │     │ - Complete business logic     │
└───────────────┬──────────────────────┘     └───────────────────────────────┘
                │                                          ▲
                │                                          │
                │              Redirects/Links             │
                └──────────────────────────────────────────┘
```

## Benefits of this Approach

1. **Reliable Port Detection**: By using a static server on port 3000, we ensure Replit always detects a bound port within the required timeframe.

2. **Better User Experience**: Users see a proper interface with clear instructions instead of a "Run this app" message.

3. **Multiple Access Options**: Users can choose how they want to access the application (direct link, iframe, etc.).

4. **No Code Changes Required**: The main application code remains unchanged; all modifications are in the startup and server configuration.

5. **Development Friendliness**: Developers can continue to work on the main application without worrying about Replit-specific issues.

## Deployment Considerations

For production deployments:

1. The dual-port architecture might not be necessary outside of Replit
2. A reverse proxy (like Nginx) can be used to route all traffic to a single endpoint
3. The production build system is configured to handle both architectures

See [PRODUCTION-DEPLOYMENT-GUIDE.md](./PRODUCTION-DEPLOYMENT-GUIDE.md) for more details on deploying to production environments.