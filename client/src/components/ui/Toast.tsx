import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 max-w-md";
    
    if (!isVisible) return `${baseStyles} opacity-0 translate-y-[-20px]`;
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white border-l-4 border-green-600`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white border-l-4 border-red-600`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white border-l-4 border-yellow-600`;
      case 'info':
        return `${baseStyles} bg-blue-500 text-white border-l-4 border-blue-600`;
      default:
        return `${baseStyles} bg-gray-500 text-white`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          {getIcon()}
        </span>
        <span style={{ flex: 1, fontSize: '0.95rem', lineHeight: '1.4' }}>
          {message}
        </span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Toast Context for global toast management
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

let toastCallbacks: ToastContextType['showToast'][] = [];

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Register this component's showToast function
  useEffect(() => {
    toastCallbacks.push(showToast);
    return () => {
      toastCallbacks = toastCallbacks.filter(cb => cb !== showToast);
    };
  }, []);

  return {
    showToast,
    toasts: toasts.map(toast => (
      <Toast
        key={toast.id}
        message={toast.message}
        type={toast.type}
        onClose={() => removeToast(toast.id)}
      />
    ))
  };
};

// Global toast function that can be called from anywhere
export const toast = {
  success: (message: string) => {
    toastCallbacks.forEach(cb => cb(message, 'success'));
  },
  error: (message: string) => {
    toastCallbacks.forEach(cb => cb(message, 'error'));
  },
  info: (message: string) => {
    toastCallbacks.forEach(cb => cb(message, 'info'));
  },
  warning: (message: string) => {
    toastCallbacks.forEach(cb => cb(message, 'warning'));
  }
};