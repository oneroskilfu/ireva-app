/**
 * Toast utility for displaying notifications
 */

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  duration?: number;
}

/**
 * Display a toast notification
 * This is a simple implementation that can be enhanced with a real toast library
 */
export const toast = ({ 
  title, 
  description, 
  variant = 'default',
  duration = 3000 
}: ToastOptions) => {
  // For now, we'll use a basic console.log
  console.log(`[${variant.toUpperCase()}] ${title}${description ? `: ${description}` : ''}`);
  
  // In a real implementation, this would use a toast library
  // like react-toastify, react-hot-toast, or shadcn/ui toast component

  // Create a simple toast element
  const toastEl = document.createElement('div');
  toastEl.className = `irev-toast irev-toast-${variant}`;
  toastEl.style.position = 'fixed';
  toastEl.style.bottom = '20px';
  toastEl.style.right = '20px';
  toastEl.style.padding = '10px 15px';
  toastEl.style.borderRadius = '4px';
  toastEl.style.zIndex = '9999';
  toastEl.style.minWidth = '300px';
  toastEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

  // Set colors based on variant
  switch (variant) {
    case 'success':
      toastEl.style.backgroundColor = '#4caf50';
      toastEl.style.color = 'white';
      break;
    case 'destructive':
      toastEl.style.backgroundColor = '#f44336';
      toastEl.style.color = 'white';
      break;
    case 'warning':
      toastEl.style.backgroundColor = '#ff9800';
      toastEl.style.color = 'white';
      break;
    case 'info':
      toastEl.style.backgroundColor = '#2196f3';
      toastEl.style.color = 'white';
      break;
    default:
      toastEl.style.backgroundColor = '#6b7280';
      toastEl.style.color = 'white';
  }

  // Create title element
  const titleEl = document.createElement('div');
  titleEl.style.fontWeight = 'bold';
  titleEl.textContent = title;
  toastEl.appendChild(titleEl);

  // Add description if provided
  if (description) {
    const descEl = document.createElement('div');
    descEl.style.fontSize = '0.875rem';
    descEl.style.marginTop = '4px';
    descEl.textContent = description;
    toastEl.appendChild(descEl);
  }

  // Add to DOM
  document.body.appendChild(toastEl);

  // Auto-remove after duration
  setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transition = 'opacity 0.3s ease-out';
    
    // Remove from DOM after fade
    setTimeout(() => {
      if (document.body.contains(toastEl)) {
        document.body.removeChild(toastEl);
      }
    }, 300);
  }, duration);
};