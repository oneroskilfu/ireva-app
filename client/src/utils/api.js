import axios from 'axios';

/**
 * Configure axios with defaults for our API
 */
const API = axios.create({
  baseURL: '/api', // This will work when the frontend is served by the backend
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor to add auth token to requests
 */
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token expiration
 */
API.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized responses
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if token is invalid or expired
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default API;