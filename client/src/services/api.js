import axios from 'axios';

// Using the specified backend URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Explicitly set backend URL
  timeout: 10000,   // 10 second timeout for requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add the auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific HTTP errors
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication expired. Please log in again.'));
      }
      
      if (status === 403) {
        return Promise.reject(new Error('You do not have permission to perform this action.'));
      }
      
      if (status === 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('No response from server. Please check your internet connection.'));
    }
    
    return Promise.reject(error);
  }
);

// API service methods organized by resource
const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/user/profile'),
  updateProfile: (userData) => API.put('/user/profile', userData),
  changePassword: (passwordData) => API.post('/auth/change-password', passwordData),
  verify: () => API.get('/auth/verify')
};

const propertyService = {
  getAllProperties: (params) => API.get('/projects', { params }),
  getPropertyById: (id) => API.get(`/projects/${id}`),
  getFeaturedProperties: () => API.get('/projects/featured'),
  investInProperty: (propertyId, investmentData) => API.post(`/investments`, { ...investmentData, propertyId })
};

const investmentService = {
  getUserInvestments: () => API.get('/investments'),
  getInvestmentById: (id) => API.get(`/investments/${id}`),
  getRoiData: () => API.get('/investments/roi')
};

const adminService = {
  getAllUsers: () => API.get('/users'),
  getUserById: (id) => API.get(`/users/${id}`),
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),
  deleteUser: (id) => API.delete(`/users/${id}`),
  changeUserRole: (id, role) => API.put(`/users/role/${id}`, { role }),
  createProperty: (propertyData) => API.post('/projects', propertyData),
  updateProperty: (id, propertyData) => API.put(`/projects/${id}`, propertyData),
  deleteProperty: (id) => API.delete(`/projects/${id}`),
  approveKyc: (userId) => API.post(`/users/kyc/approve/${userId}`),
  rejectKyc: (userId) => API.post(`/users/kyc/reject/${userId}`)
};

export {
  API as default,
  authService,
  propertyService,
  investmentService,
  adminService
};