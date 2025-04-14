import API from './axios';

export interface Investment {
  id: number;
  userId: number;
  propertyId: number;
  property?: {
    name: string;
    location: string;
  };
  amount: number;
  date: string;
  status: 'active' | 'pending' | 'completed';
  returns: number;
  maturityDate?: string;
}

// Get all investments for the current user
export const getUserInvestments = async () => {
  const response = await API.get<Investment[]>('/investments');
  return response.data;
};

// Get a single investment by ID
export const getInvestmentById = async (id: number) => {
  const response = await API.get<Investment>(`/investments/${id}`);
  return response.data;
};

// Create a new investment
export const createInvestment = async (investmentData: {
  propertyId: number;
  amount: number;
}) => {
  const response = await API.post<Investment>('/investments', investmentData);
  return response.data;
};

// Update an investment status (admin only)
export const updateInvestmentStatus = async (id: number, status: string) => {
  const response = await API.put<Investment>(`/investments/${id}/status`, { status });
  return response.data;
};

// Get investment statistics for the user
export const getInvestmentStats = async () => {
  const response = await API.get('/investments/stats');
  return response.data;
};