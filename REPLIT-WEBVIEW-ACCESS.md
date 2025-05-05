# iREVA Platform - Accessing the Application on Replit

## URL Pattern for Accessing the Application

The iREVA Platform uses a dual-port architecture to accommodate Replit's requirements:

- **Port 5000**: Used by the proxy server for Replit's port detection
- **Port 5001**: Where the main application runs (mapped to external port 3001)

## How to Access the Application

### Option 1: Using the Default Webview Button
1. Click on the **Webview** button in Replit
2. This will open the application in a new tab with the URL:
   `https://[repl-id].[replit-domain].dev:3001`
3. The application will automatically redirect you to the correct URL without the port number

### Option 2: Manually Remove the Port from URL
If you're seeing an empty page or a connection error:
1. Remove the `:3001` from the end of the URL in your browser
2. Press Enter to navigate to the clean URL

### Option 3: Open a Custom Webview
1. In the Replit Shell, run:
   ```
   open https://[repl-id].[replit-domain].dev
   ```
2. This will open a custom webview without the port number

## Troubleshooting

If you encounter any issues accessing the application:

1. **Check the Workflow Status**: Make sure the "Start application" workflow is running
2. **Clear Browser Cache**: Sometimes the browser cache can cause issues with redirects
3. **Try Incognito/Private Mode**: Open the application in an incognito or private window
4. **Check Console Logs**: Look for any error messages in the browser console

## Technical Background

The platform implements a reverse proxy server that:
1. Binds to port 5000 to satisfy Replit's port detection requirements
2. Proxies requests to the main application running on port 5001
3. Includes special handling for port redirection to ensure a seamless user experience

---

For developers: More technical details can be found in `proxy-reverse.cjs`.