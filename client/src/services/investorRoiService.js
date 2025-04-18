import axios from 'axios';

const API_URL = '/api/investor/roi';

// Get ROI summary statistics for the logged-in investor
export const fetchRoiStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ROI stats:', error);
    throw error;
  }
};

// Get ROI chart data for the logged-in investor
export const fetchRoiChartData = async () => {
  try {
    const response = await axios.get(`${API_URL}/chart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ROI chart data:', error);
    throw error;
  }
};

// Get ROI transactions for the logged-in investor with optional filters
export const fetchRoiTransactions = async (page = 1, limit = 10, sort = 'desc', projectId = null) => {
  try {
    let url = `${API_URL}/transactions?page=${page}&limit=${limit}&sort=${sort}`;
    
    if (projectId) {
      url += `&projectId=${projectId}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching ROI transactions:', error);
    throw error;
  }
};

// Get investment performance metrics
export const fetchInvestmentPerformance = async () => {
  try {
    const response = await axios.get(`${API_URL}/performance`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching investment performance metrics:', error);
    throw error;
  }
};