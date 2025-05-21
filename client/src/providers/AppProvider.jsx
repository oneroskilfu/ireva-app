/**
 * App Provider
 * 
 * Central provider that wraps the application with:
 * - Error boundary
 * - Performance monitoring
 * - Authentication context
 * - Theme provider
 * - API client
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ErrorBoundaryWithMonitoring } from '../components/ErrorBoundary';
import useApiRequest from '../hooks/useApiRequest';
import usePerformanceMonitor from '../hooks/usePerformanceMonitor';

// Create context for application-wide state and services
const AppContext = createContext(null);

// App Provider component
export function AppProvider({ children }) {
  // Performance tracking for the entire app
  const performance = usePerformanceMonitor('AppProvider', {
    sampleRate: 0.5, // Track 50% of sessions
    trackRenders: true
  });
  
  // Track app initialization
  const initOperation = performance.trackOperation('app-initialization');
  
  // Create API client
  const api = useApiRequest({
    baseUrl: '/api',
    retries: 3,
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5
    }
  });
  
  // Application state
  const [appState, setAppState] = useState({
    isReady: false,
    theme: 'light',
    systemInfo: null
  });
  
  // Initialize application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        initOperation.checkpoint('app-init-start');
        
        // Load system information
        const systemInfo = await api.get('health');
        initOperation.checkpoint('system-info-loaded');
        
        // Set theme from local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', initialTheme);
        
        initOperation.checkpoint('theme-initialized');
        
        // Update app state
        setAppState({
          isReady: true,
          theme: initialTheme,
          systemInfo
        });
        
        initOperation.end('success');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        initOperation.end('failed');
        
        // Still mark as ready even if we fail to load some data
        setAppState(prev => ({
          ...prev,
          isReady: true
        }));
      }
    };
    
    initializeApp();
  }, []);
  
  // Handle theme toggling
  const toggleTheme = () => {
    setAppState(prev => {
      const newTheme = prev.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { ...prev, theme: newTheme };
    });
  };
  
  // Create context value with all services and state
  const contextValue = {
    // Application state
    isReady: appState.isReady,
    theme: appState.theme,
    systemInfo: appState.systemInfo,
    
    // Services
    api,
    performance,
    
    // Actions
    toggleTheme,
    
    // App metadata
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV
  };
  
  // Provide context to all children
  return (
    <AppContext.Provider value={contextValue}>
      <ErrorBoundaryWithMonitoring componentName="AppRoot">
        {children}
      </ErrorBoundaryWithMonitoring>
    </AppContext.Provider>
  );
}

// Hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Export individual hooks for specific functionality
export function useTheme() {
  const { theme, toggleTheme } = useApp();
  return { theme, toggleTheme };
}

export function useApi() {
  const { api } = useApp();
  return api;
}

export function useAppPerformance() {
  const { performance } = useApp();
  return performance;
}

export function useSystemInfo() {
  const { systemInfo } = useApp();
  return systemInfo;
}

export default AppProvider;