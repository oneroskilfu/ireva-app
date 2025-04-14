import axios from 'axios';

// Create axios instance with baseURL pointing to our backend API
const API_URL = '/api';

// User login
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// User registration
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    // Store token in localStorage if provided
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
};

// Get current user data
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/verify`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_URL}/users/profile/me`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/change-password`, passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Set up the axios interceptor for auth
export const setupAxiosInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Auto logout if 401 Unauthorized response is returned
        logout();
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }
  );
};

// Call this function to set up interceptors
setupAxiosInterceptors();