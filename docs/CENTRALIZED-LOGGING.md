# Centralized Logging with LogDNA

This document explains how to set up and use the centralized logging system implemented in the iREVA platform.

## Overview

The iREVA platform uses a sophisticated logging system built on Winston with LogDNA integration. This provides:

- Real-time log monitoring and alerts
- Centralized log storage and searching
- Structured logs with context (tenant, user, request info)
- Automatic log rotation for local logs
- Environment-specific log levels

## Setting Up LogDNA

To use LogDNA for centralized logging:

1. **Create a LogDNA Account**:
   - Sign up at [LogDNA.com](https://www.logdna.com/)
   - Create a new organization or use an existing one

2. **Get Your API Key**:
   - In the LogDNA dashboard, go to Settings → Organization → API Keys
   - Create a new Ingestion Key or use an existing one

3. **Configure Environment Variables**:
   - Add your LogDNA API Key to the `.env` file:
     ```
     LOGDNA_API_KEY=your_logdna_api_key_here
     ```
   - For production deployments, add this to your deployment environment

4. **Verify Integration**:
   - Access the `/logdna-test` endpoint in your application
   - Check the LogDNA dashboard to verify logs are being received
   - Look for the unique test ID printed in the response

## Log Levels

The system uses the following log levels, from highest to lowest priority:

- **error**: Errors and exceptions that require attention
- **warn**: Warnings that don't stop the application but might indicate issues
- **info**: Important application events (default in production)
- **http**: HTTP request/response logs
- **debug**: Detailed debugging information (default in development)
- **silly**: Very verbose debugging information

## Environment Configuration

Configure logging behavior with these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Minimum log level to record | `info` in production, `debug` in development |
| `LOGDNA_API_KEY` | API key for LogDNA integration | Not set (LogDNA disabled) |
| `APP_NAME` | Application name for log context | `ireva-platform` |
| `NODE_ENV` | Environment name for log context | `development` |

## Using the Logger

The logging system is available throughout the application:

```typescript
// Import the logger
import logger from '../lib/logger';

// Basic logging
logger.info('User registered successfully', { userId: 123 });
logger.error('Failed to process payment', { error, orderId });

// Request-scoped logging
const reqLogger = logger.createRequestLogger(req);
reqLogger.debug('Processing user data');

// Tenant-specific logging
const tenantLogger = logger.createTenantLogger(tenantId);
tenantLogger.info('Tenant configuration updated');
```

## Log Locations

Logs are stored in multiple locations:

1. **Console**: All logs are printed to the console
2. **Log Files**: Stored in the `logs` directory:
   - `application-YYYY-MM-DD.log`: All logs
   - `error-YYYY-MM-DD.log`: Error logs only
3. **LogDNA**: When configured, logs are sent to LogDNA's cloud service

## Searching Logs in LogDNA

LogDNA provides powerful search capabilities:

- **Simple search**: Just type keywords in the search box
- **Field search**: Use `field:value` syntax (e.g., `userId:123`)
- **Complex queries**: Combine with AND/OR operators
- **Time ranges**: Filter logs by time periods

Common search fields:

- `tenantId`: Filter logs by tenant
- `userId`: Filter logs by user
- `requestId`: Find all logs related to a specific request
- `level`: Filter by log level (e.g., `level:error`)

## Monitoring and Alerts

Set up alerts in LogDNA for critical events:

1. Go to the "Alerts" section in LogDNA
2. Create a new alert with a search query (e.g., `level:error`)
3. Configure notification channels (email, Slack, PagerDuty, etc.)
4. Set thresholds and schedules as needed

## Best Practices

- Use appropriate log levels for different events
- Include relevant context in log messages
- Avoid logging sensitive information (passwords, tokens, etc.)
- Use structured logging (objects) instead of string concatenation
- Create specific alerts for critical application events