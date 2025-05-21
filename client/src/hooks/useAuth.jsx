/**
 * Authentication Hook
 * 
 * Provides authentication state and methods with:
 * - User session management
 * - Login/logout functions
 * - Role-based authorization
 * - Integration with performance monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { useApiRequest } from './useApiRequest';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { Redirect } from 'wouter';

// Default authentication state
const initialState = {
  user: null,
  isLoading: true,
  error: null
};

/**
 * Hook for authentication state and methods
 */
export default function useAuth() {
  // Use API request for authentication endpoints
  const api = useApiRequest({
    baseUrl: '/api',
    retries: 1, // Lower retries for auth endpoints
    circuitBreaker: {
      enabled: true,
      failureThreshold: 3
    }
  });
  
  // Performance monitoring
  const { trackOperation } = usePerformanceMonitor('Auth', {
    trackInteractions: true
  });
  
  // Authentication state
  const [auth, setAuth] = useState(initialState);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const perfOp = trackOperation('checkAuthStatus');
      
      try {
        // Try to get current user data
        const userData = await api.get('user');
        
        perfOp.checkpoint('user-data-received');
        
        setAuth({
          user: userData,
          isLoading: false,
          error: null
        });
        
        perfOp.end('success');
      } catch (error) {
        // Not authenticated or server error
        if (error.statusCode === 401) {
          // Not authenticated, this is expected for logged out users
          perfOp.checkpoint('not-authenticated');
          
          setAuth({
            user: null,
            isLoading: false,
            error: null
          });
          
          perfOp.end('not-authenticated');
        } else {
          // Server error or other issue
          console.error('Auth check failed:', error);
          
          perfOp.checkpoint('error');
          
          setAuth({
            user: null,
            isLoading: false,
            error: error.message || 'Failed to check authentication status'
          });
          
          perfOp.end('failed');
        }
      }
    };
    
    checkAuthStatus();
  }, []);
  
  /**
   * Login function
   */
  const login = useCallback(async (credentials) => {
    const perfOp = trackOperation('login');
    
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));
      
      perfOp.checkpoint('request-start');
      
      // Call login API
      const userData = await api.post('login', credentials);
      
      perfOp.checkpoint('login-successful');
      
      // Update auth state with user data
      setAuth({
        user: userData,
        isLoading: false,
        error: null
      });
      
      perfOp.end('success');
      
      return userData;
    } catch (error) {
      perfOp.checkpoint('login-failed');
      
      // Set error state
      setAuth({
        user: null,
        isLoading: false,
        error: error.message || 'Login failed'
      });
      
      perfOp.end('failed');
      
      throw error;
    }
  }, [api, trackOperation]);
  
  /**
   * Register function
   */
  const register = useCallback(async (userData) => {
    const perfOp = trackOperation('register');
    
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));
      
      perfOp.checkpoint('request-start');
      
      // Call register API
      const newUser = await api.post('register', userData);
      
      perfOp.checkpoint('register-successful');
      
      // Update auth state with new user data
      setAuth({
        user: newUser,
        isLoading: false,
        error: null
      });
      
      perfOp.end('success');
      
      return newUser;
    } catch (error) {
      perfOp.checkpoint('register-failed');
      
      // Set error state
      setAuth({
        user: null,
        isLoading: false,
        error: error.message || 'Registration failed'
      });
      
      perfOp.end('failed');
      
      throw error;
    }
  }, [api, trackOperation]);
  
  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    const perfOp = trackOperation('logout');
    
    try {
      setAuth(prev => ({ ...prev, isLoading: true }));
      
      perfOp.checkpoint('request-start');
      
      // Call logout API
      await api.post('logout');
      
      perfOp.checkpoint('logout-successful');
      
      // Clear auth state
      setAuth({
        user: null,
        isLoading: false,
        error: null
      });
      
      perfOp.end('success');
      
      return true;
    } catch (error) {
      perfOp.checkpoint('logout-failed');
      
      // Set error state but still clear user
      // (better to force logout client-side even if server fails)
      setAuth({
        user: null,
        isLoading: false,
        error: error.message || 'Logout failed'
      });
      
      perfOp.end('failed');
      
      // Don't throw error for logout failures
      console.error('Logout failed:', error);
      return false;
    }
  }, [api, trackOperation]);
  
  /**
   * Check if user has required role
   */
  const hasRole = useCallback((role) => {
    if (!auth.user) return false;
    
    // If role is an array, check if user has any of the roles
    if (Array.isArray(role)) {
      return role.some(r => auth.user.role === r);
    }
    
    // Otherwise check specific role
    return auth.user.role === role;
  }, [auth.user]);
  
  return {
    // State
    user: auth.user,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Authentication methods
    login,
    register,
    logout,
    
    // Authorization method
    hasRole
  };
}