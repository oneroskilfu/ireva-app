# iREVA Application URL Access Guide

This document provides quick access information for the iREVA Platform.

## Direct Application URLs

| Service | URL | Notes |
|---------|-----|-------|
| **Main Application** | `https://[repl-name].[username].repl.co:5001/` | The main iREVA platform |
| **Webview Server** | `https://[repl-name].[username].repl.co:5000/` | Redirects to main application |
| **Direct Webview** | `https://[repl-name].[username].repl.co:5000/webview` | Fast redirect to main app |

## Special Routes

| Route | Purpose |
|-------|---------|
| `/webview` | Direct access to main application |
| `/health` | Check if the servers are running |
| `/check-main-app` | Verify if main application is available |

## Access Tips

1. The most reliable way to access iREVA is through the direct app URL (port 5001)
2. If you're using Replit's Webview tab, you'll be automatically redirected to the main application
3. All paths and routes from the main application are fully supported

## Webview Testing

To test that the application is working correctly:

1. Start the "Start application" workflow
2. Open the Webview tab in Replit
3. You should be automatically redirected to the main application

If you see any errors or blank screens, try refreshing or directly accessing port 5001.

---

*Note: Replace '[repl-name].[username]' with your actual Replit identifier*