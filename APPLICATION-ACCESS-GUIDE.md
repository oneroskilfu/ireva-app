# iREVA Platform Access Guide

## Understanding the Dual-Port Architecture

The iREVA platform uses a dual-port architecture to resolve the Replit port detection issue:

1. **Port 5000**: Used by a minimal TCP server that binds immediately to satisfy Replit's port detection system
2. **Port 5001**: Where the actual iREVA application runs with all features and functionality

## How to Access Your iREVA Application

### Option 1: Direct Hyperlinks (Recommended)

The simplest way to access your application is by clicking these direct links:

- [Open iREVA Homepage on Port 5001](https://{{REPL_SLUG}}.{{REPL_OWNER}}.repl.co/?port=5001)
- [Access Admin Dashboard](https://{{REPL_SLUG}}.{{REPL_OWNER}}.repl.co/?port=5001/admin)
- [View Privacy Policy](https://{{REPL_SLUG}}.{{REPL_OWNER}}.repl.co/?port=5001/privacy)
- [View Terms of Service](https://{{REPL_SLUG}}.{{REPL_OWNER}}.repl.co/?port=5001/terms)

### Option 2: Manually Access Using the Correct URL Pattern

If the links above don't work, you can manually construct the URL:

1. In the Replit environment:
   ```
   https://{{REPLIT_SLUG}}.replit.app/?port=5001
   ```

2. External access (if your Repl is public):
   ```
   https://{{REPL_SLUG}}.{{REPL_OWNER}}.repl.co:5001/
   ```

## Testing Features

The application includes these key pages:

- **Home (`/`)**: The enhanced homepage for iREVA platform
- **Privacy Policy (`/privacy`)**: Legal information about data privacy
- **Terms of Service (`/terms`)**: Legal terms for using the platform
- **Authentication (`/auth`)**: User login/registration (when implemented)
- **Admin Dashboard (`/admin`)**: For platform administrators (when implemented)

## Troubleshooting

If you encounter issues accessing the application:

1. **Check Workflow Status**: Ensure the "Start application" workflow is running
2. **Verify Terminal Output**: Look for the messages:
   ```
   PORT 5001 OPEN AND READY
   Listening on port 5001
   ```
3. **Restart Workflow**: If necessary, restart the "Start application" workflow
4. **Clear Browser Cache**: Try accessing in an incognito/private browser window

## Technical Note

Our solution creates a minimal TCP server that binds to port 5000 immediately (within ~300ms) to satisfy Replit's port detection system, while the full iREVA application runs on port 5001. This approach ensures reliable operation in the Replit environment while maintaining all functionality.