import { apiRequest } from '@/lib/queryClient';

// Get all pending KYC submissions (admin)
export const getAllKYCs = async () => {
  const response = await apiRequest('GET', '/api/kyc/pending');
  return response.json();
};

// Update KYC status (admin)
export const updateKYCStatus = async (
  userId: number, 
  action: 'approve' | 'reject', 
  rejectionReason?: string
) => {
  const response = await apiRequest('POST', `/api/kyc/${userId}/verify`, {
    action,
    rejectionReason
  });
  return response.json();
};

// Get user's own KYC status
export const getUserKYCStatus = async () => {
  const response = await apiRequest('GET', '/api/kyc/status');
  return response.json();
};

// Submit KYC application (this function is called directly from the form component)
// Files are handled using FormData which isn't handled by our apiRequest function,
// so we directly use fetch in the KYCForm component