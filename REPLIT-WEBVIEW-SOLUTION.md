# Replit WebView Solution for iREVA Platform

## Problem Overview

Replit's WebView functionality has a limitation where it only connects to port 5000, while our iREVA application runs on port 5001. This creates challenges when trying to view the application directly in Replit's interface.

## Technical Solution

We've implemented a reverse proxy solution that:

1. Binds to port 5000 immediately (for Replit port detection)
2. Forwards all requests from port 5000 to the main application on port 5001
3. Maintains all application functionality without changing the core application code

The solution uses the following components:

- **proxy-reverse.cjs**: A lightweight HTTP proxy server that:
  - Binds immediately to port 5000 (for Replit detection)
  - Proxies all incoming requests to port 5001
  - Handles error conditions gracefully
  - Starts the main application as a child process

- **workflow-command.sh**: Updated to launch the proxy server instead of the minimal TCP server

## How It Works

1. When the Replit workflow starts, it launches the `proxy-reverse.cjs` server
2. This server binds to port 5000 immediately
3. After port binding, it starts the main application on port 5001
4. When you access the Webview in Replit, it connects to port 5000
5. The proxy server forwards your request to the application on port 5001
6. You see the full application in Replit's Webview without needing to manually change ports

## Benefits of This Approach

- **Seamless User Experience**: Access the application directly in Replit's Webview
- **Reliable Port Detection**: Ensures Replit detects the bound port within its timeout window
- **No URL Manipulation**: No need to manually change URLs or add port parameters
- **Full Application Access**: Complete access to all application features including:
  - Homepage
  - Admin Dashboard
  - Investor Dashboard
  - Privacy Policy
  - Terms of Service

## Viewing the Application

To access the iREVA platform, simply:

1. Click the "Run" button in Replit to start the workflow
2. Wait for the application to start (typically 10-15 seconds)
3. Click the "Webview" button in Replit's interface
4. The application will load directly in Replit's Webview

## Technical Implementation Details

The reverse proxy implementation uses Node.js's `http-proxy` package to:

1. Listen on port 5000 for incoming requests
2. Proxy those requests to the main application on port 5001
3. Preserve all HTTP headers and request data
4. Handle errors gracefully with appropriate fallback pages

This provides a seamless experience while maintaining the architectural advantages of our dual-port approach.