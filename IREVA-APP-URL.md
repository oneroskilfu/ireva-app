# iREVA Platform URL Access Guide

## Primary Access URL

The iREVA Platform can be accessed directly at:

```
https://[repl-name].[username].repl.co:5001/
```

This is the most reliable way to access the application as it connects directly to the main application server.

## Multi-Port Architecture

The platform uses a three-server architecture to ensure reliability:

| Port | Purpose | Access URL |
|------|---------|------------|
| 3000 | Proxy server for Replit webview | `https://[repl-name].[username].repl.co:3000/` |
| 5000 | Direct webview server with redirect | `https://[repl-name].[username].repl.co:5000/` |
| 5001 | Main application server | `https://[repl-name].[username].repl.co:5001/` |

## Special Access Routes

For troubleshooting or specific access scenarios:

1. **Webview Redirect Page**  
   `https://[repl-name].[username].repl.co:5000/webview`  
   A special page with multiple options to connect to the main application.

2. **Force Redirect**  
   `https://[repl-name].[username].repl.co:5000/force-redirect`  
   Forces an immediate redirect to the main application on port 5001.

3. **Health Check**  
   `https://[repl-name].[username].repl.co:5000/health`  
   Returns the health status of the direct webview server.

4. **Main App Check**  
   `https://[repl-name].[username].repl.co:5000/check-main-app`  
   Checks if the main application server on port 5001 is available.

## How to Share URLs

When sharing access to the iREVA platform, provide the direct port 5001 URL:

```
https://[repl-name].[username].repl.co:5001/
```

This ensures users bypass the redirection system and connect directly to the main application server.