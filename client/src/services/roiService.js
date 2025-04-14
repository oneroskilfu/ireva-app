import API from '../api/axios';

// Get ROI data for all user investments
export const getUserROI = async (timeframe) => {
  try {
    const response = await API.get('/investments/roi', {
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
    const response = await API.get(`/investments/${investmentId}/roi`, {
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
    const response = await API.post('/investments/roi', roiData);
    return response.data;
  } catch (error) {
    console.error('Error adding ROI record:', error);
    throw error;
  }
};

// Admin: Update an ROI record
export const updateROIRecord = async (id, roiData) => {
  try {
    const response = await API.put(`/investments/roi/${id}`, roiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating ROI record ${id}:`, error);
    throw error;
  }
};

// Get ROI metrics such as average return
export const getROIMetrics = async () => {
  try {
    const response = await API.get('/investments/roi/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching ROI metrics:', error);
    throw error;
  }
};