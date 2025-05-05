# iREVA Platform - Access URLs

This guide provides all the ways you can access the iREVA Platform application running in this Replit environment.

## Primary Access URLs

For direct access to the application, you can use any of these URLs:

1. **Main App (Port 5001)**: The main application server
   - In Replit: https://[replit-id]-5001.replit.dev

2. **Webview (Port 3000)**: The auto-redirecting webview server 
   - In Replit: Click "Run" at the top of the page

## Replit Environment URLs

Replit has a special URL format for accessing different ports:

```
https://[replit-id]-[PORT].[domain]/
```

For example, if your Replit ID is `abcd1234`, you can access:
- Port 3000: `https://abcd1234-3000.replit.dev/`
- Port 5001: `https://abcd1234-5001.replit.dev/`

## Troubleshooting Access Issues

If you're experiencing issues with the application not appearing:

1. **Wait for Initialization**: The application takes a few seconds to fully initialize
2. **Try Direct Port Access**: Use the port-specific URLs listed above
3. **Restart the App**: Click "Stop" and then "Run" again 
4. **Check Console Logs**: Look for any error messages in the console tab

## Technical Notes

The platform runs a multi-server architecture:
- Port 3000: Ultra-minimal webview server that starts immediately
- Port 5001: Main application server with full functionality

This architecture solves the "Run this app to see the results here" issue in Replit by ensuring:
1. Immediate port binding (within milliseconds)
2. Automatic redirection to the main application when it's ready
3. Multiple access options for better reliability