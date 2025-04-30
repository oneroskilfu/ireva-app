import axios from 'axios';

// Create an axios instance with custom config
const axiosInstance = axios.create();

// Request interceptor to add auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
  (error) => {
    if (error.response) {
      // Handle specific error responses
      if (error.response.status === 401) {
        console.error('Authentication error - redirecting to login');
        // Could redirect to login page or clear auth data here
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;