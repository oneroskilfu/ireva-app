/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI with retry capabilities
 */

import React from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Capture error details for logging
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: new Date().toISOString()
    }));

    // Report error to server if reporting is enabled
    if (this.props.reportErrors !== false) {
      this.reportError(error, errorInfo);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }
  
  // Report error to server for tracking
  reportError(error, errorInfo) {
    const errorData = {
      component: this.props.componentName || 'Unknown',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    // Send error report to server
    fetch('/api/errors/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData),
      // Use keepalive to ensure the request completes even on page unload
      keepalive: true
    }).catch(err => {
      // Silently fail - this is just error reporting
      console.debug('Failed to report error:', err);
    });
  }

  // Reset the error state to retry rendering the component
  handleRetry = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }
  
  // Reset the error state and reload the page
  handleReload = () => {
    window.location.reload();
  }

  render() {
    // If there's an error, render the fallback UI
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleRetry,
          reloadPage: this.handleReload
        });
      }
      
      // Otherwise use default fallback
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>Something went wrong</h2>
            <p>
              We're sorry, but something went wrong while rendering this component.
            </p>
            
            {process.env.NODE_ENV !== 'production' && (
              <div className="error-details">
                <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                <details>
                  <summary>Component Stack</summary>
                  <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </details>
              </div>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                Try Again
              </button>
              <button onClick={this.handleReload} className="reload-button">
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Otherwise, render children normally
    return this.props.children;
  }
}

/**
 * Functional component wrapper for ErrorBoundary with hooks
 */
export function ErrorBoundaryWithMonitoring({
  children,
  componentName,
  fallback,
  reportErrors = true
}) {
  // Use performance monitoring to track errors and retries
  const { trackOperation } = usePerformanceMonitor(
    `ErrorBoundary_${componentName || 'Unknown'}`,
    { trackInteractions: true }
  );
  
  // Track retry operations
  const handleRetry = (resetError) => {
    const retryOp = trackOperation('errorRetry');
    resetError();
    retryOp.end('success');
  };
  
  // Create custom fallback component with performance tracking
  const trackedFallback = fallback 
    ? (props) => fallback({
        ...props,
        resetError: () => handleRetry(props.resetError)
      })
    : undefined;
  
  return (
    <ErrorBoundary
      componentName={componentName}
      fallback={trackedFallback}
      reportErrors={reportErrors}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;