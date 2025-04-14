import axios from 'axios';

// Create axios instance with baseURL pointing to our backend API
const API_URL = '/api';

// Get all investments for the current user
export const getUserInvestments = async () => {
  try {
    const response = await axios.get(`${API_URL}/investments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

// Get a single investment by ID
export const getInvestmentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/investments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching investment ${id}:`, error);
    throw error;
  }
};

// Create a new investment
export const createInvestment = async (investmentData) => {
  try {
    const response = await axios.post(`${API_URL}/investments`, investmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating investment:', error);
    throw error;
  }
};

// Update an investment status (admin only)
export const updateInvestmentStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API_URL}/investments/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating investment ${id} status:`, error);
    throw error;
  }
};

// Get investment statistics for the user
export const getInvestmentStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/investments/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching investment stats:', error);
    throw error;
  }
};