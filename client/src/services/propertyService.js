import axios from 'axios';

// Create axios instance with baseURL pointing to our backend API
const API_URL = '/api';

// Add request interceptor to attach JWT token to each request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all properties with optional filtering
export const getProperties = async (query = {}) => {
  try {
    const response = await axios.get(`${API_URL}/properties`, { params: query });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

// Get a single property by ID
export const getPropertyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error);
    throw error;
  }
};

// For admin: Create a new property
export const createProperty = async (propertyData) => {
  try {
    const response = await axios.post(`${API_URL}/properties`, propertyData);
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

// For admin: Update a property
export const updateProperty = async (id, propertyData) => {
  try {
    const response = await axios.put(`${API_URL}/properties/${id}`, propertyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating property ${id}:`, error);
    throw error;
  }
};

// For admin: Delete a property
export const deleteProperty = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting property ${id}:`, error);
    throw error;
  }
};

// Get featured properties
export const getFeaturedProperties = async () => {
  try {
    const response = await axios.get(`${API_URL}/properties/featured`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    throw error;
  }
};