# iREVA Platform Access Guide

## Accessing the Application in Replit

The iREVA platform is now fully accessible directly through Replit's interface using our new reverse proxy solution. This guide explains how to access and use the application.

### Step 1: Start the Application

1. In your Replit project, click the **Run** button to start the application
2. Wait for the application to fully initialize (typically 10-15 seconds)
3. You should see logs indicating that both servers are running:
   - Proxy server: `SERVER LISTENING ON PORT 5000`
   - Main application: `iREVA server bound to port 5001`

### Step 2: Access through Replit's Webview

1. Click on the **Webview** tab in Replit's interface
2. The iREVA platform homepage should load automatically
3. You can now navigate the application directly in Replit's Webview

### Step 3: Using External Access (Optional)

If you want to access the application outside of Replit's Webview:

1. Use the URL shown in Replit's "Share" menu
2. The reverse proxy will automatically handle forwarding requests to the main application

## How Our Solution Works

Our solution uses a reverse proxy approach that:

1. Binds immediately to port 5000 (the port Replit looks for)
2. Forwards all incoming requests to our main application on port 5001
3. Maintains full application functionality without redirection

## Troubleshooting

If you encounter any issues:

1. **Application not loading in Webview**:
   - Check the workflow logs to confirm both servers are running
   - Make sure the proxy server bound successfully to port 5000
   - Refresh the Webview tab after the application is fully initialized

2. **Server errors in console**:
   - Look for error messages related to port binding
   - Check if the main application started successfully
   - Verify the workflow command has executable permissions

3. **Missing UI elements or styles**:
   - Clear your browser cache
   - Try accessing in a private/incognito window
   - Check the browser console for JavaScript errors

## Technical Details

Our solution consists of two main components:

1. **proxy-reverse.cjs**: A lightweight HTTP proxy server that forwards requests
2. **server/index.ts**: The main application server that runs on port 5001

The proxy server uses Node.js's `http-proxy` library to seamlessly forward all HTTP traffic, maintaining headers and request integrity.