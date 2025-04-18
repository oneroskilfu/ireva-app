import { apiRequest } from "@/lib/queryClient";

/**
 * Get all ROI distributions with optional filters
 * @param {Object} filters - The filters to apply (project, date range, investor)
 * @returns {Promise} Promise object with ROI distributions
 */
export const getAllROIDistributions = async (filters = {}) => {
  const queryString = new URLSearchParams();
  
  if (filters.projectId) {
    queryString.append('projectId', filters.projectId);
  }
  
  if (filters.investorId) {
    queryString.append('investorId', filters.investorId);
  }
  
  if (filters.startDate) {
    queryString.append('startDate', filters.startDate);
  }
  
  if (filters.endDate) {
    queryString.append('endDate', filters.endDate);
  }
  
  if (filters.status) {
    queryString.append('status', filters.status);
  }
  
  if (filters.page) {
    queryString.append('page', filters.page);
  }
  
  if (filters.limit) {
    queryString.append('limit', filters.limit);
  }
  
  const endpoint = `/api/roi-distribution?${queryString.toString()}`;
  const response = await apiRequest("GET", endpoint);
  return response.json();
};

/**
 * Get ROI summary statistics
 * @returns {Promise} Promise object with ROI summary data
 */
export const getROISummary = async () => {
  const response = await apiRequest("GET", "/api/roi-distribution/summary");
  return response.json();
};

/**
 * Get ROI distribution logs for admin review
 * @param {number} limit - Optional limit for number of logs to return
 * @returns {Promise} Promise object with ROI logs
 */
export const getROILogs = async (limit = 100) => {
  const response = await apiRequest("GET", `/api/roi-distribution/logs?limit=${limit}`);
  return response.json();
};

/**
 * Calculate and distribute ROI for a specific project
 * @param {Object} data - Distribution data with projectId, roiPercentage, notes, distributionPeriod
 * @returns {Promise} Promise object with distribution results
 */
export const distributeROI = async (data) => {
  const response = await apiRequest("POST", "/api/roi-distribution/distribute", data);
  return response.json();
};

/**
 * Get ROI distributions for a specific project
 * @param {string} projectId - The project ID
 * @returns {Promise} Promise object with project ROI distributions
 */
export const getProjectROIDistributions = async (projectId) => {
  const response = await apiRequest("GET", `/api/roi-distribution/project/${projectId}`);
  return response.json();
};