import API from './axios';

export interface ROIDataPoint {
  date: string;
  value: number;
}

export interface ROIData {
  investmentId?: number;
  monthly: ROIDataPoint[];
  quarterly: ROIDataPoint[];
  yearly: ROIDataPoint[];
  totalReturns: number;
  averageROI: number;
}

// Get ROI data for all user investments
export const getUserROI = async (timeframe?: 'monthly' | 'quarterly' | 'yearly') => {
  const response = await API.get<ROIData>('/investments/roi', {
    params: { timeframe }
  });
  return response.data;
};

// Get ROI data for a specific investment
export const getInvestmentROI = async (
  investmentId: number,
  timeframe?: 'monthly' | 'quarterly' | 'yearly'
) => {
  const response = await API.get<ROIData>(`/investments/${investmentId}/roi`, {
    params: { timeframe }
  });
  return response.data;
};

// Admin: Add a new ROI record
export const addROIRecord = async (roiData: {
  investmentId: number;
  date: string;
  value: number;
}) => {
  const response = await API.post('/investments/roi', roiData);
  return response.data;
};

// Admin: Update an ROI record
export const updateROIRecord = async (
  id: number,
  roiData: {
    value: number;
  }
) => {
  const response = await API.put(`/investments/roi/${id}`, roiData);
  return response.data;
};