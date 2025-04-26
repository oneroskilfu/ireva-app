import React, { lazy, Suspense, ComponentType } from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface LazyComponentWrapperProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  loadingLabel?: string;
}

const DefaultLoadingFallback: React.FC<{ label?: string }> = ({ label }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        minHeight: 200,
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        boxShadow: theme.shadows[1]
      }}
    >
      <CircularProgress size={40} thickness={4} />
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

const DefaultErrorFallback: React.FC = () => (
  <Box 
    sx={{ 
      p: 3, 
      borderRadius: 2, 
      bgcolor: (theme) => theme.palette.error.light,
      color: (theme) => theme.palette.error.contrastText,
      textAlign: 'center'
    }}
  >
    <Typography variant="subtitle1">
      Failed to load component
    </Typography>
    <Typography variant="body2">
      There was an error loading this part of the page. Please try refreshing.
    </Typography>
  </Box>
);

/**
 * LazyComponentWrapper is a higher-order component that facilitates lazy loading
 * of React components with proper loading and error states.
 * 
 * @example
 * // Basic usage
 * const LazyDashboard = () => (
 *   <LazyComponentWrapper 
 *     importFunc={() => import('@/pages/Dashboard')}
 *     loadingLabel="Loading dashboard..." 
 *   />
 * );
 * 
 * // With custom fallbacks
 * const LazyChart = () => (
 *   <LazyComponentWrapper 
 *     importFunc={() => import('@/components/Chart')}
 *     fallback={<CustomLoadingSkeleton />}
 *     errorFallback={<CustomErrorState />}
 *   />
 * );
 */
export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  importFunc,
  fallback,
  errorFallback,
  loadingLabel
}) => {
  // Use React.lazy to dynamically import the component
  const LazyComponent = lazy(importFunc);
  
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback label={loadingLabel} />}>
      <ErrorBoundary fallback={errorFallback || <DefaultErrorFallback />}>
        <LazyComponent />
      </ErrorBoundary>
    </Suspense>
  );
};

// Simple error boundary component to catch and handle errors in lazy-loaded components
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in lazy-loaded component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default LazyComponentWrapper;