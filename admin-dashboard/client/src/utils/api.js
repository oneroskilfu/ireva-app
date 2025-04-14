import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This assumes the API is served at the same domain
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // If we're already on the login page, don't redirect
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// If we have a token in localStorage, add it to the default headers
const token = localStorage.getItem('adminToken');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;