# iREVA Platform - Dual-Port Access Solution

## Background

The iREVA platform uses a dual-port architecture to meet Replit's requirements:

1. **Port 5000**: Primary proxy server that satisfies Replit's port detection
2. **Port 5001**: Main application server (mapped to external port 3001)

## Accessing the Application

### Option 1: Using Replit's Webview (Recommended)

The application is configured to work directly with Replit's Webview on port 3001:

1. Click on the **Webview** button in Replit's interface
2. The application will automatically load, even with the `:3001` in the URL
3. Our proxy server handles requests on both ports seamlessly

### Option 2: Custom URL Access

If you prefer to use a clean URL:

1. Remove the `:3001` part from the URL in your browser
2. This connects directly to the proxy server on port 5000

## How It Works

The platform uses an advanced dual-proxy architecture:

1. **Main Proxy** (Port 5000):
   - Binds immediately to satisfy Replit's port detection
   - Proxies requests to the main application on port 5001
   - Handles special Replit paths and WebSocket connections

2. **Secondary Proxy** (Port 3001):
   - Directly handles Replit Webview connections (which default to port 3001)
   - Shows a loading screen while the main application starts
   - Transparently proxies requests to the main application when ready

## Technical Implementation

The proxies are implemented in `proxy-reverse.cjs` using:
- The `http-proxy` package for efficient request forwarding
- WebSocket support for real-time features
- Intelligent health checking to detect when the application is ready

This approach ensures that users can access the application regardless of which port they connect to, providing a seamless experience in the Replit environment.