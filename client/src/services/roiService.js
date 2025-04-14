import axios from 'axios';

// Create axios instance with baseURL pointing to our backend API
const API_URL = '/api';

// Get ROI data for all user investments
export const getUserROI = async (timeframe) => {
  try {
    const response = await axios.get(`${API_URL}/investments/roi`, {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ROI data:', error);
    throw error;
  }
};

// Get ROI data for a specific investment
export const getInvestmentROI = async (investmentId, timeframe) => {
  try {
    const response = await axios.get(`${API_URL}/investments/${investmentId}/roi`, {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ROI data for investment ${investmentId}:`, error);
    throw error;
  }
};

// Admin: Add a new ROI record
export const addROIRecord = async (roiData) => {
  try {
    const response = await axios.post(`${API_URL}/investments/roi`, roiData);
    return response.data;
  } catch (error) {
    console.error('Error adding ROI record:', error);
    throw error;
  }
};

// Admin: Update an ROI record
export const updateROIRecord = async (id, roiData) => {
  try {
    const response = await axios.put(`${API_URL}/investments/roi/${id}`, roiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating ROI record ${id}:`, error);
    throw error;
  }
};

// Get ROI metrics such as average return
export const getROIMetrics = async () => {
  try {
    const response = await axios.get(`${API_URL}/investments/roi/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ROI metrics:', error);
    throw error;
  }
};