import axios from 'axios';

/**
 * Service for handling KYC-related API requests
 */
class KYCService {
  constructor() {
    this.api = axios.create({
      baseURL: '/api/kyc',
      withCredentials: true,
    });
  }

  /**
   * Submit KYC application data
   * 
   * @param {Object} kycData - The KYC application data
   * @returns {Promise<Object>} - The response data from the API
   */
  async submitKYCApplication(kycData) {
    try {
      const response = await this.api.post('/submit', kycData);
      return response.data;
    } catch (error) {
      console.error('Error submitting KYC application:', error);
      throw error;
    }
  }

  /**
   * Upload a document for KYC verification
   * 
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Callback function for upload progress
   * @returns {Promise<Object>} - The response data from the API
   */
  async uploadDocument(file, onProgress = () => {}) {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await this.api.post('/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Get KYC application status for the current user
   * 
   * @returns {Promise<Object>} - The KYC status data
   */
  async getKYCStatus() {
    try {
      const response = await this.api.get('/status');
      return response.data;
    } catch (error) {
      console.error('Error getting KYC status:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed KYC verification
   * 
   * @returns {Promise<boolean>} - Whether the user has completed KYC
   */
  async hasCompletedKYC() {
    try {
      const response = await this.api.get('/status');
      return response.data.status === 'approved';
    } catch (error) {
      console.error('Error checking KYC completion:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const kycService = new KYCService();
export default kycService;

// Export individual methods for easier imports
export const { 
  submitKYCApplication, 
  uploadDocument, 
  getKYCStatus, 
  hasCompletedKYC 
} = kycService;