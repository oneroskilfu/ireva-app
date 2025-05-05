# iREVA Replit Webview Access Solution

## Accessing the Application

The iREVA platform is now accessible through Replit's Webview system. We've implemented a robust two-server architecture to handle the constraints of Replit's environment:

1. **Direct Webview Server (Port 5000)**: Binds immediately for Replit's port detection
2. **Main Application Server (Port 5001)**: Runs the actual iREVA platform

## How to Access the Application

### Method 1: Direct URL Access
The main application is accessible at port 5001. You can access it by:
- Clicking the Webview option in Replit (automatic redirect will happen)
- Manually entering the URL with port 5001 in your browser

### Method 2: Webview Access
When you access the application through Replit's Webview tab:
1. Our direct webview server on port 5000 receives the request
2. It checks if the main application is running on port 5001
3. Once verified, it automatically redirects you to the main application

### Method 3: Special Webview Route
You can also use our special webview direct access route:
- `/webview` - This route will immediately redirect to the main application

## Troubleshooting Access Issues

If you experience any issues accessing the application:

1. **Ensure the workflow is running**: The "Start application" workflow must be active
2. **Check both servers are running**: Look for "PORT 5000 OPEN AND READY" and "PORT 5001 OPEN AND READY" in logs
3. **Try direct access**: Access the application using the port 5001 directly in your URL
4. **Use the special routes**: Try accessing `/webview` via port 5000

## Port Configuration

| Port | Service | Purpose |
|------|---------|---------|
| 5000 | Direct Webview Server | Immediate port binding for Replit detection |
| 5001 | Main Application | The actual iREVA platform with all features |

## How It Works

Our solution addresses two key challenges with Replit's environment:

1. **Port Detection Challenge**: Replit requires a server to bind to port 5000 within 20 seconds
   - Solution: Direct webview server binds immediately to port 5000

2. **Webview Access Challenge**: Replit Webview tries to access port 3001 by default
   - Solution: Smart redirect system that routes all traffic to port 5001 where the main app runs

This dual-server architecture ensures reliable access while maintaining full application functionality.