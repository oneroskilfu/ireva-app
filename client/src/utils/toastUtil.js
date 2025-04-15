import { toast } from 'react-toastify';

// Default toast settings are now configured via the ToastContainer component in App.tsx

/**
 * Direct export of toast for the simple syntax:
 * toast.success('Message');
 * toast.error('Error');
 */
export { toast };

/**
 * Utility functions for showing toast notifications with more options
 */
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showInfoToast = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showWarningToast = (message) => {
  toast.warn(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const dismissAllToasts = () => {
  toast.dismiss();
};

// Custom loading toast that can be updated later
export const showLoadingToast = (message) => {
  return toast.loading(message, {
    position: "top-right",
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
  });
};

// Update a loading toast with a success or error message
export const updateToast = (toastId, type, message) => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
    closeOnClick: true,
    draggable: true,
  });
};