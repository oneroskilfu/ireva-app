# iREVA Platform: Replit Webview Access Guide

## Overview

This document explains how to access the iREVA Platform through Replit's Webview tab, which is now fully supported through our multi-port solution.

## Access Methods

### Method 1: Direct Webview Access (Recommended)
The simplest way to access the application:
1. Start the "Start application" workflow
2. Click the "Webview" tab in Replit
3. The application should automatically display

### Method 2: Port-Specific Access
If the direct webview doesn't work, you can try accessing specific ports:

| Port | URL | Purpose |
|------|-----|---------|
| 3000 | `https://[repl-name].[username].repl.co:3000` | Proxy server (optimized for webview) |
| 5000 | `https://[repl-name].[username].repl.co:5000` | Direct webview server with redirect |
| 5001 | `https://[repl-name].[username].repl.co:5001` | Main application server |

### Method 3: Special Routes
For troubleshooting, you can use special routes:

1. `/webview` - Direct access path on port 5000: `https://[repl-name].[username].repl.co:5000/webview`
2. `/force-redirect` - Force a redirect to port 5001: `https://[repl-name].[username].repl.co:5000/force-redirect`
3. `/health` - Check server health: `https://[repl-name].[username].repl.co:5000/health`

## How It Works

Our solution uses a three-server architecture to overcome Replit's constraints:

1. **Port 3000 Server**: A proxy server that runs on Replit's default webview port and forwards requests to the main application
2. **Port 5000 Server**: Binds immediately for Replit's port detection and provides redirection services
3. **Port 5001 Server**: Runs the full iREVA platform application

This architecture ensures:
- Immediate port binding (satisfied within Replit's 20-second requirement)
- Proper webview support (through multiple access paths)
- Full application functionality (by keeping the main app isolated)

## Troubleshooting

If you cannot access the application through the webview tab:

1. **Check Application Status**: All three servers should be running. Look for these logs:
   - "DIRECT WEBVIEW SERVER LISTENING ON PORT 5000"
   - "iREVA PROXY SERVER ON PORT 3000"
   - "iREVA server bound to port 5001"

2. **Try Direct Port Access**: Sometimes accessing port 5001 directly works best.

3. **Use the Diagnostic Tool**: Run `node webview-diagnostic.js` to check which ports are accessible and identify the best one to use.

4. **Clear Cache**: Sometimes Replit's webview caches old responses. Try reloading or using a private/incognito browser window.