import axios, { AxiosRequestConfig } from 'axios';
import { getAuthToken, isTokenExpired, removeAuthToken, shouldRefreshToken, setAuthToken } from './jwt';

// Extend AxiosRequestConfig to include properties we need
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// Create an axios instance with custom config
const axiosInstance = axios.create();

// Track if a token refresh is in progress
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to refresh the token
const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post('/api/auth/jwt/refresh');
    if (response.status === 200 && response.data?.token) {
      const newToken = response.data.token;
      setAuthToken(newToken);
      return newToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  return null;
};

// Helper to subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Helper to notify all subscribers about new token
const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

// Request interceptor to add auth token to all requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getAuthToken();
    
    // If token exists and is not expired
    if (token && !isTokenExpired(token)) {
      // Token needs refreshing but is not yet expired
      if (shouldRefreshToken(token) && !isRefreshing) {
        isRefreshing = true;
        
        try {
          const newToken = await refreshToken();
          if (newToken) {
            // Use the new token for this request
            config.headers['Authorization'] = `Bearer ${newToken}`;
            // Notify all pending requests
            onTokenRefreshed(newToken);
          } else {
            // Use the existing token if refresh failed
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Token refresh failed in interceptor:', error);
          // Use existing token if refresh failed
          config.headers['Authorization'] = `Bearer ${token}`;
        } finally {
          isRefreshing = false;
        }
      } else {
        // Token is valid and doesn't need refreshing yet
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } else if (token) {
      // Remove expired token
      console.warn('Removing expired token from storage');
      removeAuthToken();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      // Handle specific error responses
      const status = error.response.status;
      
      // Handle 401 errors with token refresh
      if (status === 401 && !originalRequest._retry) {
        // Check if the error message indicates token expiration specifically
        const isTokenExpiredError = 
          error.response.data?.message?.toLowerCase().includes('expired') ||
          error.response.data?.error?.toLowerCase().includes('expired');
        
        // Only attempt refresh for expired token errors
        if (isTokenExpiredError && !isRefreshing) {
          originalRequest._retry = true;
          isRefreshing = true;
          
          try {
            // Try to refresh the token
            const newToken = await refreshToken();
            
            if (newToken) {
              // Retry the original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              onTokenRefreshed(newToken);
              isRefreshing = false;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          } finally {
            isRefreshing = false;
          }
        } else if (isRefreshing) {
          // Request failed while refresh is in progress, wait for new token
          try {
            // Wait for token refresh via a Promise
            const newToken = await new Promise<string>((resolve) => {
              subscribeTokenRefresh((token: string) => {
                resolve(token);
              });
            });
            
            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } catch (waitError) {
            console.error('Error waiting for token refresh:', waitError);
          }
        }
        
        // If we get here, token refresh failed or wasn't attempted
        console.error('Authentication failed after token refresh attempt');
        removeAuthToken();
        
        // Dispatch an event that auth context can listen for
        window.dispatchEvent(new CustomEvent('auth:error', {
          detail: {
            status,
            message: 'Session expired. Please log in again.'
          }
        }));
      } else if (status === 403) {
        // Authorization errors
        console.error('Authorization error - Access denied');
        
        // Dispatch an event that auth context can listen for
        window.dispatchEvent(new CustomEvent('auth:error', {
          detail: {
            status,
            message: error.response.data?.message || 'You do not have permission to access this resource'
          }
        }));
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;