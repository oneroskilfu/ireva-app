# Self-Healing Job Queue System Documentation

This document describes the self-healing job queue system implemented in the iREVA platform.

## Overview

The job queue system provides a robust way to handle background tasks such as:
- Sending emails to users and investors
- Distributing ROI payments to investors
- Generating reports and documents
- Processing data imports and exports
- Sending notifications across multiple channels

Key features include:
- Reliable processing with automatic retries
- Graceful handling of transient failures
- Dead-letter queues for persistent failures
- Job prioritization and scheduling
- Real-time monitoring and statistics
- Distributed processing across multiple nodes

## Architecture

The system is built on the following components:

1. **Queue Infrastructure** (`server/lib/queue/index.ts`)
   - Core queue management and job handling
   - Connection to Redis for distributed storage
   - Support for high-availability with Redis Sentinel

2. **Job Processors** (`server/lib/queue/processors/`)
   - `email-processor.ts`: Handles email sending with retry logic
   - `roi-processor.ts`: Processes ROI distributions with transaction safety
   - `report-processor.ts`: Generates reports asynchronously

3. **Worker System** (`server/lib/queue/worker.ts`)
   - Processes jobs from queues with concurrency control
   - Handles job lifecycle events (started, completed, failed)
   - Implements automatic retries with exponential backoff

4. **Queue Service** (`server/services/queue-service.ts`)
   - High-level API for application code to interact with queues
   - Business-focused methods that abstract queue details

5. **API Routes** (`server/routes/job-queue-routes.ts`)
   - RESTful API for queue management
   - Endpoints for adding jobs and monitoring queues

## Available Queues

The system defines several specialized queues:

- **email**: For sending emails to users, investors, and administrators
- **roi-distribution**: For calculating and distributing returns to investors
- **report-generation**: For generating reports and documents
- **notification**: For sending multi-channel notifications
- **data-import**: For processing data imports from external sources
- **data-export**: For generating and exporting data to external systems

## Using the Queue System

### From Application Code

Use the Queue Service to add jobs to queues:

```typescript
import queueService from '../services/queue-service';

// Send an email
await queueService.sendEmail(
  'investor@example.com',
  'Monthly ROI Report',
  'monthly-roi',
  { month: 'January', roi: 8.5, amount: 425.00 }
);

// Schedule an ROI distribution
await queueService.scheduleROIDistribution(
  propertyId,
  totalAmount,
  { 
    periodId: 202401,
    distributionDate: '2024-01-31',
    initiatedBy: adminUserId
  }
);

// Generate a report
await queueService.generateReport(
  'investor-statement',
  'pdf',
  { 
    userId: investorId,
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  },
  {
    notifyOnComplete: true,
    email: 'investor@example.com'
  }
);
```

### Via API Endpoints

The system provides RESTful APIs for queue management:

#### Send an Email

```
POST /api/jobs/email
```

Request body:
```json
{
  "to": "investor@example.com",
  "subject": "Welcome to iREVA",
  "template": "welcome-email",
  "context": {
    "firstName": "John",
    "investorId": 12345
  }
}
```

#### Schedule an ROI Distribution (Admin Only)

```
POST /api/jobs/roi-distribution
```

Request body:
```json
{
  "propertyId": 123,
  "periodId": 202401,
  "distributionDate": "2024-01-31",
  "totalAmount": 25000,
  "calculationMethod": "pro-rata"
}
```

#### Generate a Report

```
POST /api/jobs/report
```

Request body:
```json
{
  "reportType": "investor-statement",
  "format": "pdf",
  "parameters": {
    "userId": 456,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "includeCharts": true
  },
  "notifyOnComplete": true,
  "email": "investor@example.com"
}
```

#### Get Queue Statistics (Admin Only)

```
GET /api/jobs/stats
GET /api/jobs/stats/:queueName
```

#### Clear Queue (Admin Only)

```
DELETE /api/jobs/clear/:queueName
```

## Self-Healing Capabilities

The system implements several self-healing mechanisms:

1. **Automatic Retries**
   - Failed jobs are automatically retried with exponential backoff
   - Different retry strategies based on error type
   - Configurable maximum retry attempts

2. **Error Classification**
   - Errors are classified as transient or permanent
   - Transient errors (network issues, timeouts) trigger retries
   - Permanent errors (validation failures) are sent to dead-letter queue

3. **Job Prioritization**
   - Critical jobs can be assigned higher priority
   - Priority jobs are processed before normal jobs

4. **Resource Management**
   - Concurrency limits prevent system overload
   - Rate limiting prevents flooding external services
   - Job batching for efficient processing

5. **Monitoring and Alerting**
   - Real-time statistics on queue health
   - Centralized logging of job lifecycles
   - Alerts for persistent failures

## Configuration

The queue system can be configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_HOST` | Redis server hostname | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis server password | |
| `REDIS_MODE` | Redis mode (`standalone` or `sentinel`) | `standalone` |
| `REDIS_SENTINEL_NAME` | Redis Sentinel master name | `mymaster` |
| `REDIS_SENTINEL_URLS` | Comma-separated Redis Sentinel URLs | |
| `QUEUE_PREFIX` | Prefix for queue keys in Redis | `ireva:queue:` |
| `QUEUE_WORKER_CONCURRENCY` | Max concurrent jobs per worker | CPU cores - 1 |

## Deployment Considerations

For production deployments:

1. **Use Redis Sentinel**
   - Configure Redis Sentinel for high availability
   - Set `REDIS_MODE=sentinel` and provide Sentinel URLs

2. **Separate Worker Processes**
   - Consider running workers in separate processes/containers
   - Scale workers independently based on load

3. **Monitor Queue Health**
   - Set up alerts for queue backlogs
   - Monitor failed job rates
   - Check dead-letter queues regularly

4. **Resource Allocation**
   - Allocate appropriate resources based on job types
   - CPU-bound jobs (report generation) need more CPU
   - I/O-bound jobs (emails) benefit from higher concurrency

## Troubleshooting

Common issues and solutions:

1. **Jobs Not Processing**
   - Check Redis connection
   - Verify workers are running
   - Check for queue backlogs with `/api/jobs/stats`

2. **Repeated Job Failures**
   - Check logs for specific error messages
   - Review dead-letter queues
   - Verify external service connectivity

3. **Queue Backup**
   - Increase worker concurrency
   - Check for resource bottlenecks
   - Consider adding more worker instances

4. **High Redis Memory Usage**
   - Adjust `removeOnComplete` and `removeOnFail` settings
   - Set up Redis eviction policies
   - Consider Redis persistence options