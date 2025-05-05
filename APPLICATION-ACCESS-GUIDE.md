# iREVA Platform - How to Access the Application

## Quick Start

To access the iREVA platform:

1. Click the "Run" button at the top of the Replit interface
2. Wait for the application to start (usually takes 10-15 seconds)
3. You should be automatically redirected to the main application
4. If not redirected, use one of the access links provided on the loading page

## Access Options

### Method 1: Webview Access (Recommended)

The simplest way to access the application is through Replit's webview:

1. Click the "Run" button
2. The webview will show a loading page initially
3. Once the application is ready, you'll be automatically redirected

### Method 2: Direct Port Access

You can access the application directly using port-specific URLs:

```
https://[replit-id]-5001.replit.dev/
```

Where `[replit-id]` is your Replit project identifier. This is typically shown on the loading page in the technical details section.

### Method 3: Local Development

When developing locally (outside of Replit), you can access:

- Main application: `http://localhost:5001/`
- Loading page: `http://localhost:3000/`

## Troubleshooting

If you're having trouble accessing the application:

### Application Not Loading

1. Check if the application has finished starting up (look for "application loaded successfully" in the logs)
2. Try refreshing the page
3. Clear your browser cache
4. Use a direct port access URL (see Method 2 above)

### "Run this app" Message Persists

If you still see the "Run this app to see the results here" message:

1. Make sure you've clicked the "Run" button
2. Look at the console logs to verify the application has started
3. Try using a direct port access URL instead
4. Click the "Stop" button, then click "Run" again to restart the application

### URL Access Issues

If the URLs provided don't work:

1. Check your Replit ID in the technical details section on the loading page
2. Try different URL formats (provided on the loading page)
3. Ensure you're using the correct domain suffix (usually .replit.dev)

## Need More Help?

If you continue to experience issues:

1. Check the console logs for any error messages
2. Review the REPLIT-WEBVIEW-SOLUTION.md file for technical details
3. Restart the Replit environment completely

## Technical Background (Optional)

The iREVA platform uses a dual-port architecture:

- An ultra-minimal server on port 3000 (what Replit expects)
- The main application running on port 5001 (avoiding port conflicts)

This approach ensures that Replit's workflow system can detect the application is running, while also providing full access to the application's features.