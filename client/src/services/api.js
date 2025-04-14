import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This assumes the backend is serving the API at /api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API methods
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

const getUser = async () => {
  const response = await api.get('/user');
  return response.data;
};

// Properties API methods
const getProperties = async (filters = {}) => {
  const response = await api.get('/properties', { params: filters });
  return response.data;
};

const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

// Investments API methods
const getInvestments = async () => {
  const response = await api.get('/investments');
  return response.data;
};

const createInvestment = async (investmentData) => {
  const response = await api.post('/investments', investmentData);
  return response.data;
};

// Admin API methods
const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

const updateUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// Export all API methods
export default {
  // Auth
  login,
  register,
  getUser,
  
  // Properties
  getProperties,
  getPropertyById,
  
  // Investments
  getInvestments,
  createInvestment,
  
  // Admin
  getUsers,
  updateUserRole
};