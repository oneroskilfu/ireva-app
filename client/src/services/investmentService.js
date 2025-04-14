import API from '../api/axios';

// Get all investments for the current user
export const getUserInvestments = async () => {
  try {
    const response = await API.get('/investments');
    return response.data;
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

// Get a single investment by ID
export const getInvestmentById = async (id) => {
  try {
    const response = await API.get(`/investments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching investment ${id}:`, error);
    throw error;
  }
};

// Create a new investment
export const createInvestment = async (investmentData) => {
  try {
    const response = await API.post('/investments', investmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating investment:', error);
    throw error;
  }
};

// Update an investment status (admin only)
export const updateInvestmentStatus = async (id, status) => {
  try {
    const response = await API.put(`/investments/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating investment ${id} status:`, error);
    throw error;
  }
};

// Get investment statistics for the user
export const getInvestmentStats = async () => {
  try {
    const response = await API.get('/investments/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching investment stats:', error);
    throw error;
  }
};