# iREVA Platform Port Configuration Guide

This document details the port configuration for the iREVA platform, explaining the dual-port architecture and how it addresses Replit's specific requirements.

## Port Configuration Overview

The iREVA platform uses a dual-port architecture specifically designed to work seamlessly in the Replit environment:

| Server                | Port | Purpose                                       |
|-----------------------|------|-----------------------------------------------|
| Static Webview Server | 3000 | Immediate port binding for Replit detection   |
| Main Application      | 5001 | Full iREVA application functionality          |

## Port Selection Rationale

### Port 3000

Port 3000 was specifically chosen for the static webview server because:

1. **Replit Webview Compatibility**: Replit's webview component automatically looks for applications on port 3000/3001
2. **Early Port Binding**: A minimal server can bind to this port almost instantaneously (<10ms)
3. **Default Expected Port**: Most Replit users and systems expect applications to use port 3000

### Port 5001

Port 5001 was chosen for the main application because:

1. **Avoids Conflict**: Prevents port conflicts with the static webview server
2. **Convention**: Uses the standard port convention (5000-range) for backend services
3. **Distinction**: Clearly distinguishes the main application from the webview server

## Port Binding Process

The startup sequence is carefully orchestrated to ensure reliable port detection:

1. **Static Webview Server Startup**
   - Binds to port 3000 immediately (typically <10ms)
   - Reports successful binding with multiple log formats
   - Serves static HTML with links to the main application

2. **Main Application Startup**
   - Binds to port 5001 (typically completes within 1-3 seconds)
   - No race conditions with the webview server
   - Full application functionality available once startup completes

## Port Access Patterns

### Internal Access

From within the application code:

```javascript
// Frontend (client)
const API_URL = '/api'; // Uses relative path for API access

// Backend (server)
app.listen(process.env.PORT || 5001, '0.0.0.0', () => {
  console.log(`Listening on port ${process.env.PORT || 5001}`);
});
```

### External Access

For external access to the application:

1. **Development Environment**
   - Webview UI: `https://<repl-name>.<username>.repl.co`
   - Main Application: Links provided in the webview UI

2. **Production Environment**
   - Single endpoint through reverse proxy: `https://ireva.com`
   - No dual-port architecture needed in production

## Configuring Ports

The port configuration can be modified if needed:

1. **Environment Variables**

```
# .env file
WEBVIEW_PORT=3000  # Static webview server port
MAIN_APP_PORT=5001 # Main application port
```

2. **Workflow Command Script**

The `workflow-command.sh` script can be edited to change port assignments:

```bash
# Extract from workflow-command.sh
WEBVIEW_PORT=${WEBVIEW_PORT:-3000}
MAIN_APP_PORT=${MAIN_APP_PORT:-5001}
```

## Troubleshooting Port Issues

If you encounter port-related issues:

### Port Already in Use

```bash
# Find processes using the ports
lsof -i :3000
lsof -i :5001

# Kill the processes
kill -9 <PID>
```

### Port Binding Failures

Check for port binding failures in the logs:

```bash
grep -i "error\|fail\|bind" .replit/logs/console.log
```

### URL Generation Issues

If the main application URL is not being generated correctly, check:

```bash
# Test URL generation manually
node -e "require('./open-app.js').testUrlGeneration()"
```

## Production Considerations

In production environments:

1. **Single Port**: Use a single port (typically 80/443) with a reverse proxy
2. **Load Balancing**: Configure load balancers to distribute traffic properly
3. **Health Checks**: Set up health checks on the appropriate ports

See [PRODUCTION-DEPLOYMENT-GUIDE.md](./PRODUCTION-DEPLOYMENT-GUIDE.md) for more details on production deployments.

## Resources and Documentation

- [DUAL-PORT-SOLUTION.md](./DUAL-PORT-SOLUTION.md): Detailed explanation of the dual-port architecture
- [Replit Documentation](https://docs.replit.com/): Official Replit documentation on port binding and webviews