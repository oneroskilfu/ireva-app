import axios from 'axios';

const API_URL = '/api/roi'; // Use relative URL for proper proxy handling

// Simple API helpers
export const fetchStats = () => axios.get(`${API_URL}/stats`);
export const fetchChartData = () => axios.get(`${API_URL}/chart`);
export const fetchTableData = (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add any filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  return axios.get(`${API_URL}/table${params.toString() ? `?${params.toString()}` : ''}`);
};
export const triggerPayout = (payoutData) => axios.post(`${API_URL}/payout`, payoutData);
export const fetchDistributionLogs = () => axios.get(`${API_URL}-distribution/logs`);