import axios from 'axios';
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Custom hook for making API requests with authentication
 * and standard error handling
 */
export const useApiRequest = () => {
  const { user, logoutMutation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create axios instance with baseURL
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  // Add request interceptor to include auth token if available
  api.interceptors.request.use(
    (config) => {
      setIsLoading(true);
      setError(null);
      
      // Add authorization header if user is logged in and has token
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      
      return config;
    },
    (error) => {
      setLoading(false);
      setError(error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => {
      setIsLoading(false);
      return response;
    },
    (error) => {
      setIsLoading(false);
      
      // Handle unauthorized errors (401)
      if (error.response && error.response.status === 401) {
        // Logout user if token is invalid or expired
        logoutMutation.mutate();
      }
      
      setError(error.response?.data?.message || error.message);
      return Promise.reject(error);
    }
  );

  // Helper method for GET requests
  const get = useCallback(async (endpoint, params = {}) => {
    try {
      const response = await api.get(endpoint, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  // Helper method for POST requests
  const post = useCallback(async (endpoint, data = {}) => {
    try {
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  // Helper method for PUT requests
  const put = useCallback(async (endpoint, data = {}) => {
    try {
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  // Helper method for DELETE requests
  const del = useCallback(async (endpoint) => {
    try {
      const response = await api.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    api,
    get,
    post,
    put,
    delete: del,
    isLoading,
    error
  };
};