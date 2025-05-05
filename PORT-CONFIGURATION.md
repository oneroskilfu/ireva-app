# iREVA Platform Port Configuration

This document explains the port configuration strategy used in the iREVA platform, particularly for Replit deployment.

## Port Configuration Overview

The platform uses a dual-port strategy:

| Port | Usage | File |
|------|-------|------|
| 5000 | Minimal TCP server for Replit detection | tcp-start.cjs |
| 5001 | Main application server | server/index.ts |

## Central Configuration

Port settings are centralized in `server/config/ports.ts` to make management easier. If you need to change port numbers, you should update them in this file.

## How It Works

1. The workflow command (`./workflow-command.sh`) starts a minimal TCP server that binds to port 5000 immediately
2. This ensures Replit's workflow system detects an active port within the 20-second timeout period
3. The main application (server/index.ts) starts afterward and checks if port 5000 is already in use
4. If port 5000 is in use, the main application automatically uses port 5001 instead
5. Both servers continue running - the minimal server on port 5000 (satisfying Replit) and the main application on port 5001

## Accessing the Application

When accessing the application, use the following URLs:

- Main application: `https://repl-user-port-5001.yourrepl.repl.co/`
- Investor dashboard: `https://repl-user-port-5001.yourrepl.repl.co/investor/dashboard`
- Admin dashboard: `https://repl-user-port-5001.yourrepl.repl.co/admin/dashboard`

## Troubleshooting

If you encounter port-related issues:

1. Check the workflow logs to see if the minimal TCP server started successfully
2. Verify that the main application is using port 5001 when it detects port 5000 is in use
3. If you modify port numbers, ensure they're updated consistently across both CommonJS and ES Module files