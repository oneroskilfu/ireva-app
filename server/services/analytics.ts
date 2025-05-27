/**
 * Analytics & Error Monitoring Service
 * Integrates Sentry for error tracking and user behavior analytics
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export class AnalyticsService {
  private static initialized = false;

  static initialize() {
    if (this.initialized || !process.env.SENTRY_DSN) {
      return;
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        // Performance monitoring
        nodeProfilingIntegration(),
        // Database monitoring
        Sentry.prismaIntegration(),
        // HTTP request monitoring
        Sentry.httpIntegration({
          tracing: {
            ignoreIncomingRequests: (url) => {
              return url.includes('/health') || url.includes('/favicon.ico');
            }
          }
        })
      ],
      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Error filtering
      beforeSend(event, hint) {
        // Don't send test errors
        if (process.env.NODE_ENV === 'test') return null;
        
        // Filter out known non-critical errors
        const error = hint.originalException;
        if (error instanceof Error) {
          if (error.message.includes('ECONNRESET') || 
              error.message.includes('EPIPE')) {
            return null;
          }
        }
        
        return event;
      }
    });

    this.initialized = true;
    console.log('✅ Analytics & Error Monitoring initialized');
  }

  // User Journey Tracking
  static trackUserRegistration(userId: string, userEmail: string, source?: string) {
    Sentry.addBreadcrumb({
      message: 'User Registration',
      category: 'user',
      level: 'info',
      data: { userId, userEmail, source }
    });

    Sentry.setTag('user_action', 'registration');
    Sentry.setContext('user', { id: userId, email: userEmail });
  }

  static trackUserLogin(userId: string, userEmail: string, method: string = 'email') {
    Sentry.addBreadcrumb({
      message: 'User Login',
      category: 'auth',
      level: 'info',
      data: { userId, userEmail, method }
    });

    Sentry.setUser({ id: userId, email: userEmail });
    Sentry.setTag('login_method', method);
  }

  static trackPropertyView(userId: string, propertyId: string, propertyTitle: string) {
    Sentry.addBreadcrumb({
      message: 'Property Viewed',
      category: 'engagement',
      level: 'info',
      data: { userId, propertyId, propertyTitle }
    });

    // Custom metric for property engagement
    Sentry.metrics.increment('property.views', 1, {
      tags: { propertyId, userId }
    });
  }

  static trackInvestmentCreated(userId: string, propertyId: string, amount: number) {
    Sentry.addBreadcrumb({
      message: 'Investment Created',
      category: 'transaction',
      level: 'info',
      data: { userId, propertyId, amount }
    });

    // Business metrics
    Sentry.metrics.increment('investment.created', 1);
    Sentry.metrics.distribution('investment.amount', amount, {
      tags: { userId, propertyId }
    });

    Sentry.setTag('conversion', 'investment_created');
  }

  static trackKYCSubmission(userId: string, documentTypes: string[]) {
    Sentry.addBreadcrumb({
      message: 'KYC Documents Submitted',
      category: 'compliance',
      level: 'info',
      data: { userId, documentTypes: documentTypes.join(',') }
    });

    Sentry.metrics.increment('kyc.submission', 1, {
      tags: { userId, documentCount: documentTypes.length.toString() }
    });
  }

  static trackKYCApproval(userId: string, adminId: string) {
    Sentry.addBreadcrumb({
      message: 'KYC Approved',
      category: 'compliance',
      level: 'info',
      data: { userId, adminId }
    });

    Sentry.metrics.increment('kyc.approval', 1);
    Sentry.setTag('kyc_status', 'approved');
  }

  // Error Tracking
  static captureError(error: Error, context?: Record<string, any>) {
    if (context) {
      Sentry.setContext('error_context', context);
    }
    
    return Sentry.captureException(error);
  }

  static captureAuthError(error: Error, userId?: string, action?: string) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'authentication');
      scope.setLevel('warning');
      
      if (userId) scope.setUser({ id: userId });
      if (action) scope.setContext('auth_action', { action });
      
      Sentry.captureException(error);
    });
  }

  static capturePaymentError(error: Error, userId: string, amount: number, propertyId: string) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'payment');
      scope.setLevel('error');
      scope.setUser({ id: userId });
      scope.setContext('payment', { amount, propertyId });
      
      Sentry.captureException(error);
    });

    // Alert on payment failures
    Sentry.metrics.increment('payment.error', 1, {
      tags: { userId, propertyId }
    });
  }

  static captureSecurityEvent(event: string, userId: string, details: Record<string, any>) {
    Sentry.withScope((scope) => {
      scope.setTag('event_type', 'security');
      scope.setLevel('error');
      scope.setUser({ id: userId });
      scope.setContext('security_event', { event, ...details });
      
      Sentry.captureMessage(`Security Event: ${event}`, 'error');
    });
  }

  // Performance Monitoring
  static startTransaction(name: string, operation: string) {
    return Sentry.startTransaction({ name, op: operation });
  }

  static trackDatabaseQuery(query: string, duration: number) {
    Sentry.metrics.distribution('database.query.duration', duration, {
      tags: { query_type: query.split(' ')[0].toLowerCase() }
    });
  }

  static trackAPIResponse(endpoint: string, method: string, statusCode: number, duration: number) {
    Sentry.metrics.distribution('api.response_time', duration, {
      tags: { endpoint, method, status_code: statusCode.toString() }
    });

    if (statusCode >= 400) {
      Sentry.metrics.increment('api.error', 1, {
        tags: { endpoint, method, status_code: statusCode.toString() }
      });
    }
  }

  // Business Intelligence
  static trackConversionFunnel(userId: string, step: string, metadata?: Record<string, any>) {
    const funnelSteps = [
      'user_registered',
      'profile_completed',
      'kyc_submitted',
      'kyc_approved',
      'property_viewed',
      'investment_created'
    ];

    const stepIndex = funnelSteps.indexOf(step);
    
    Sentry.addBreadcrumb({
      message: `Funnel Step: ${step}`,
      category: 'conversion',
      level: 'info',
      data: { userId, step, stepIndex, ...metadata }
    });

    Sentry.metrics.increment('conversion.funnel', 1, {
      tags: { step, userId }
    });
  }

  static trackRetention(userId: string, action: string, daysSinceRegistration: number) {
    Sentry.metrics.increment('user.retention', 1, {
      tags: { 
        userId, 
        action, 
        retention_bucket: this.getRetentionBucket(daysSinceRegistration)
      }
    });
  }

  private static getRetentionBucket(days: number): string {
    if (days <= 1) return 'day_1';
    if (days <= 7) return 'week_1';
    if (days <= 30) return 'month_1';
    if (days <= 90) return 'month_3';
    return 'long_term';
  }

  // Platform Health Monitoring
  static trackPlatformMetrics(metrics: {
    activeUsers: number;
    totalInvestments: number;
    platformValue: number;
    pendingKYCs: number;
  }) {
    Object.entries(metrics).forEach(([key, value]) => {
      Sentry.metrics.gauge(`platform.${key}`, value);
    });
  }

  // Express Middleware
  static requestHandler() {
    return Sentry.Handlers.requestHandler({
      user: ['id', 'email', 'role']
    });
  }

  static tracingHandler() {
    return Sentry.Handlers.tracingHandler();
  }

  static errorHandler() {
    return Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Only handle 4xx and 5xx errors
        return error.status >= 400;
      }
    });
  }
}

// Express middleware factory
export const createAnalyticsMiddleware = () => {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Track request
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      AnalyticsService.trackAPIResponse(
        req.route?.path || req.path,
        req.method,
        res.statusCode,
        duration
      );
    });

    next();
  };
};

export default AnalyticsService;