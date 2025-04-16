import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create Axios instance with default config
const api: AxiosInstance = axios.create({
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
      config.headers['Authorization'] = `Bearer ${token}`;
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
    
    // Handle 401 responses (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // You could implement token refresh here if needed
      
      // For now, just redirect to login if user is unauthorized
      // Note: we're checking if not on login page to avoid infinite redirect
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic request function with type parameters
export const request = async <T = any, R = AxiosResponse<T>>(
  config: AxiosRequestConfig
): Promise<R> => {
  try {
    const response = await api(config);
    return response as R;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Simplified request methods
export const get = <T = any>(url: string, config?: AxiosRequestConfig) => 
  request<T>({ ...config, method: 'GET', url });

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
  request<T>({ ...config, method: 'POST', url, data });

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
  request<T>({ ...config, method: 'PUT', url, data });

export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
  request<T>({ ...config, method: 'PATCH', url, data });

export const del = <T = any>(url: string, config?: AxiosRequestConfig) => 
  request<T>({ ...config, method: 'DELETE', url });

export default api;