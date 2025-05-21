/**
 * Performance Monitoring Hook
 * 
 * Provides client-side performance tracking integrated with the server's monitoring system.
 * Tracks component rendering, data fetching, user interactions, and reports to backend.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Default configuration
const DEFAULT_CONFIG = {
  enabled: true,
  reportInterval: 30000,     // Send metrics to server every 30 seconds
  sampleRate: 0.1,           // Only track 10% of sessions by default
  slowThreshold: 300,        // Consider renders/operations over 300ms as slow
  trackRenders: true,        // Track component render times
  trackInteractions: true,   // Track user interactions (clicks, form submissions)
  trackNetworkRequests: true // Track API/fetch requests
};

/**
 * Hook for monitoring component and application performance
 */
export default function usePerformanceMonitor(componentName, options = {}) {
  // Merge with default configuration
  const config = { ...DEFAULT_CONFIG, ...options };
  
  // Determine if this session should be tracked based on sample rate
  const shouldTrack = useRef(Math.random() < config.sampleRate);
  
  // Skip all tracking if disabled or not in sample
  if (!config.enabled || !shouldTrack.current) {
    // Return dummy functions that do nothing
    return {
      trackRender: () => {},
      trackOperation: () => ({ end: () => {} }),
      trackInteraction: () => {},
      performanceData: null
    };
  }
  
  // Store metrics
  const [metrics, setMetrics] = useState({
    componentName,
    renders: {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      slowRenders: 0
    },
    operations: {},
    interactions: {
      count: 0,
      events: {}
    },
    networkRequests: {
      count: 0,
      failedCount: 0,
      totalDuration: 0
    }
  });
  
  // Reference to store last render time
  const lastRenderTime = useRef(null);
  
  // Current operations in progress
  const activeOperations = useRef({});
  
  // Track component render time
  const trackRender = useCallback(() => {
    if (!config.trackRenders) return;
    
    const renderStart = performance.now();
    
    // Return function to be called after render completes
    return () => {
      const renderEnd = performance.now();
      const duration = renderEnd - renderStart;
      
      setMetrics(prev => {
        const renders = { ...prev.renders };
        renders.count += 1;
        renders.totalDuration += duration;
        renders.averageDuration = renders.totalDuration / renders.count;
        
        if (duration > config.slowThreshold) {
          renders.slowRenders += 1;
        }
        
        return { ...prev, renders };
      });
      
      lastRenderTime.current = renderEnd;
    };
  }, [config.trackRenders, config.slowThreshold, componentName]);
  
  // Track a custom operation (data loading, computation, etc.)
  const trackOperation = useCallback((operationName, context = {}) => {
    const startTime = performance.now();
    const operationId = `${operationName}_${Date.now()}`;
    
    // Store in active operations
    activeOperations.current[operationId] = {
      name: operationName,
      start: startTime,
      context
    };
    
    // Return object with methods to track the operation
    return {
      // Add checkpoint
      checkpoint: (checkpointName) => {
        if (!activeOperations.current[operationId]) return;
        
        const checkpointTime = performance.now();
        const elapsed = checkpointTime - startTime;
        
        // Add checkpoint to operation
        if (!activeOperations.current[operationId].checkpoints) {
          activeOperations.current[operationId].checkpoints = [];
        }
        
        activeOperations.current[operationId].checkpoints.push({
          name: checkpointName,
          time: elapsed
        });
        
        return elapsed;
      },
      
      // End operation tracking
      end: (status = 'success') => {
        if (!activeOperations.current[operationId]) return 0;
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Get operation data
        const operation = activeOperations.current[operationId];
        
        // Remove from active operations
        delete activeOperations.current[operationId];
        
        // Update metrics
        setMetrics(prev => {
          const operations = { ...prev.operations };
          
          // Initialize operation metrics if not exist
          if (!operations[operationName]) {
            operations[operationName] = {
              count: 0,
              totalDuration: 0,
              averageDuration: 0,
              successCount: 0,
              failureCount: 0
            };
          }
          
          // Update operation metrics
          operations[operationName].count += 1;
          operations[operationName].totalDuration += duration;
          operations[operationName].averageDuration = 
            operations[operationName].totalDuration / operations[operationName].count;
          
          if (status === 'success') {
            operations[operationName].successCount += 1;
          } else {
            operations[operationName].failureCount += 1;
          }
          
          return { ...prev, operations };
        });
        
        return duration;
      }
    };
  }, [componentName]);
  
  // Track user interaction (click, form submission, etc.)
  const trackInteraction = useCallback((interactionType, target) => {
    if (!config.trackInteractions) return;
    
    setMetrics(prev => {
      const interactions = { ...prev.interactions };
      interactions.count += 1;
      
      // Initialize event type if not exist
      if (!interactions.events[interactionType]) {
        interactions.events[interactionType] = 0;
      }
      
      // Increment event count
      interactions.events[interactionType] += 1;
      
      return { ...prev, interactions };
    });
  }, [config.trackInteractions, componentName]);
  
  // Setup network request tracking
  useEffect(() => {
    if (!config.trackNetworkRequests) return;
    
    // Track fetch API
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Only track requests from our domain or API routes
        if (url.startsWith('/api/') || url.startsWith(window.location.origin)) {
          setMetrics(prev => {
            const networkRequests = { ...prev.networkRequests };
            networkRequests.count += 1;
            networkRequests.totalDuration += duration;
            
            if (!response.ok) {
              networkRequests.failedCount += 1;
            }
            
            return { ...prev, networkRequests };
          });
        }
        
        return response;
      } catch (error) {
        // Track failed requests
        setMetrics(prev => {
          const networkRequests = { ...prev.networkRequests };
          networkRequests.count += 1;
          networkRequests.failedCount += 1;
          
          return { ...prev, networkRequests };
        });
        
        throw error;
      }
    };
    
    // Restore original fetch on cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, [config.trackNetworkRequests]);
  
  // Send metrics to server periodically
  useEffect(() => {
    if (!config.enabled) return;
    
    const reportTimer = setInterval(() => {
      // Only send if we have meaningful data
      if (metrics.renders.count > 0 || 
          Object.keys(metrics.operations).length > 0 || 
          metrics.interactions.count > 0 ||
          metrics.networkRequests.count > 0) {
        
        // Send metrics to server
        fetch('/api/performance/client', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            component: componentName,
            metrics: metrics
          }),
          // Use keepalive to ensure the request completes even if the page is unloading
          keepalive: true
        }).catch(err => {
          // Silently fail - this is non-critical telemetry
          console.debug('Failed to send performance metrics:', err);
        });
        
        // Reset counters after reporting
        setMetrics(prev => ({
          ...prev,
          renders: {
            count: 0,
            totalDuration: 0,
            averageDuration: 0,
            slowRenders: 0
          },
          // Keep operation definitions but reset counters
          operations: Object.fromEntries(
            Object.entries(prev.operations).map(([key, value]) => [
              key, 
              {
                count: 0,
                totalDuration: 0,
                averageDuration: 0,
                successCount: 0,
                failureCount: 0
              }
            ])
          ),
          interactions: {
            count: 0,
            events: {}
          },
          networkRequests: {
            count: 0,
            failedCount: 0,
            totalDuration: 0
          }
        }));
      }
    }, config.reportInterval);
    
    return () => clearInterval(reportTimer);
  }, [metrics, config.reportInterval, config.enabled, componentName]);
  
  // Handle component unmount
  useEffect(() => {
    return () => {
      // Complete any active operations
      Object.keys(activeOperations.current).forEach(operationId => {
        const operation = activeOperations.current[operationId];
        const duration = performance.now() - operation.start;
        
        // Log to console that operation was interrupted
        console.debug(`Operation ${operation.name} interrupted by component unmount after ${Math.round(duration)}ms`);
      });
    };
  }, []);
  
  return {
    trackRender,
    trackOperation,
    trackInteraction,
    performanceData: metrics
  };
}