import { toast } from '../utils/toastUtil';

/**
 * Notification Service 
 * Provides centralized handling of application notifications using React Toastify
 */
class NotificationService {
  constructor() {
    this.toastIds = new Map(); // Track active toast notifications
  }

  /**
   * Show a success notification
   * @param {string} message - The message to display
   * @param {object} options - Additional toast options
   */
  success(message, options = {}) {
    return toast.success(message, {
      ...options
    });
  }

  /**
   * Show an error notification
   * @param {string} message - The message to display
   * @param {object} options - Additional toast options
   */
  error(message, options = {}) {
    return toast.error(message, {
      ...options,
      autoClose: 5000 // Longer duration for errors
    });
  }

  /**
   * Show an information notification
   * @param {string} message - The message to display
   * @param {object} options - Additional toast options
   */
  info(message, options = {}) {
    return toast.info(message, {
      ...options
    });
  }

  /**
   * Show a warning notification
   * @param {string} message - The message to display
   * @param {object} options - Additional toast options
   */
  warning(message, options = {}) {
    return toast.warn(message, {
      ...options,
      autoClose: 4000
    });
  }

  /**
   * Show a loading notification that can be updated later
   * @param {string} message - The message to display
   * @param {string} key - Optional unique key to identify this notification
   * @returns {string|number} - Toast ID for later reference
   */
  loading(message, key = null) {
    const id = toast.loading(message, { 
      position: "top-right",
      autoClose: false
    });
    
    if (key) {
      this.toastIds.set(key, id);
    }
    
    return id;
  }

  /**
   * Update an existing toast notification
   * @param {string|number} toastId - The ID of the toast to update
   * @param {string} type - The new type (success, error, etc.)
   * @param {string} message - The new message
   */
  update(toastId, type, message) {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 3000
    });
  }

  /**
   * Update a toast by its key
   * @param {string} key - The key used when creating the loading toast
   * @param {string} type - The new type (success, error, etc.)
   * @param {string} message - The new message
   */
  updateByKey(key, type, message) {
    const toastId = this.toastIds.get(key);
    if (toastId) {
      this.update(toastId, type, message);
      this.toastIds.delete(key);
    }
  }

  /**
   * Dismiss all active notifications
   */
  dismissAll() {
    toast.dismiss();
    this.toastIds.clear();
  }

  /**
   * Show an API error notification with appropriate message
   * @param {Error} error - The error object from the API call
   */
  apiError(error) {
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error.response) {
      // Request was made and server responded with error status
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.status === 401) {
        message = 'You need to log in again to continue.';
      } else if (error.response.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (error.response.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.response.status === 500) {
        message = 'Server error. Our team has been notified.';
      }
    } else if (error.request) {
      // Request was made but no response received
      message = 'No response from server. Please check your internet connection.';
    } else if (error.message) {
      // Something else happened while setting up the request
      message = error.message;
    }
    
    this.error(message);
    return message;
  }

  /**
   * Show a notification for a successful API response
   * @param {object} response - The API response object
   * @param {string} defaultMessage - Default message if response has no message
   */
  apiSuccess(response, defaultMessage = 'Operation completed successfully') {
    const message = response?.data?.message || defaultMessage;
    this.success(message);
    return message;
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;