import axios from 'axios';

// Create axios instance with baseURL pointing to our backend API
const API = axios.create({
  // Base URL is set relative to the current origin, since both frontend and backend 
  // are served from the same domain in our Replit environment
  baseURL: '/api',
});

// Add request interceptor to attach JWT token to each request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle common error scenarios
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (expired or invalid token)
    if (error.response && error.response.status === 401) {
      // Clear stored tokens
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default API;