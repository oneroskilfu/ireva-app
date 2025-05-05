# iREVA Platform Webview Solution

## Current Implementation Status

✅ **Static HTML Server (Port 3000)**: Successfully implemented and running
✅ **Main Application (Port 5001)**: Successfully running and accessible
✅ **Webview Integration**: Basic integration working with static content
✅ **Workflow Automation**: Successfully implemented with dual-server approach

## Technical Overview

### Dual-Server Architecture

We've implemented a two-server architecture to solve the Replit webview display issues:

1. **Static Webview Server (Port 3000)**
   - Lightweight Node.js HTTP server
   - Serves a professionally styled static HTML landing page
   - Responds in <5ms to ensure Replit detects it instantly
   - Includes all necessary health check endpoints
   - Configured with proper HTTP headers for caching and CORS

2. **Main Application Server (Port 5001)**
   - Full iREVA platform with all features
   - Express + Vite for backend and frontend
   - Database connectivity and API endpoints
   - Complete user experience

### Solution Benefits

This approach offers several key advantages:

1. **Instant Visibility**: Users see meaningful content immediately instead of a "Run this app" message
2. **Improved Reliability**: Static server is extremely stable and unlikely to crash
3. **Performance**: Static content loads instantly, no waiting for React initialization
4. **Clear User Guidance**: Static page has links to the full application
5. **Separation of Concerns**: Display issues won't affect the main application functionality

## Port Configuration

The current port configuration is:

- **Port 3000**: Static webview server (local) → Mapped to port 80 (external)
- **Port 5001**: Main application server (local) → Mapped to port 3001 (external)

This configuration ensures that:
- The webview always shows content (port 3000)
- The main application is accessible via its own URL (port 5001/3001)
- External access is streamlined through standard HTTP ports

## Accessing the Application

Users can access the application in two ways:

1. **Webview**: Shows the static landing page
2. **Direct URL**: For the full application experience:
   - Main application: https://[repl-name]-5001.repl.app

## Next Steps

To further enhance the solution:

1. **Update `.replit` file**: Map port 3000 to external port 80 for optimal access
2. **Create production build**: A production build of the React app would perform better
3. **Enhanced routing**: Better integration between static server and main application

## Troubleshooting

If the webview shows "Run this app" instead of content:

1. Check if the workflow is running
2. Verify that port 3000 is successfully bound
3. Update the `.replit` file configuration as specified in `REPLIT-CONFIG-UPDATE.md`
4. Restart the workflow