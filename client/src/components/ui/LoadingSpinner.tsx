interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary', text }: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white border-t-transparent';
      case 'gray':
        return 'border-gray-300 border-t-transparent';
      default:
        return 'border-[#1F6FEB] border-t-transparent';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        className={`animate-spin rounded-full border-2 ${getSizeClasses()} ${getColorClasses()}`}
        style={{
          animation: 'spin 1s linear infinite'
        }}
      ></div>
      {text && (
        <span style={{ 
          fontSize: size === 'sm' ? '0.875rem' : '0.95rem',
          color: color === 'white' ? '#fff' : '#64748b'
        }}>
          {text}
        </span>
      )}
    </div>
  );
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      gap: '16px'
    }}>
      <LoadingSpinner size="lg" />
      <p style={{ 
        fontSize: '1.1rem', 
        color: '#64748b',
        fontWeight: '500'
      }}>
        {message}
      </p>
    </div>
  );
}