import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Logout by removing token
      localStorage.removeItem('auth_token');
      
      // If we're not trying to login or register, redirect to login
      if (
        !originalRequest.url.includes('/login') &&
        !originalRequest.url.includes('/register')
      ) {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

// Wrapper functions for API calls
export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.get<T>(url, config);
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.post<T>(url, data, config);
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.put<T>(url, data, config);
}

export function patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.patch<T>(url, data, config);
}

export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.delete<T>(url, config);
}

export default api;