import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  height?: string | number;
}

/**
 * Wrapper for lazy-loaded components that shows a loading spinner
 * while the component is being loaded
 */
export default function LazyComponentWrapper({ 
  children, 
  height = 200 
}: LazyComponentWrapperProps) {
  return (
    <Suspense fallback={
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: height,
          width: '100%'
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    }>
      {children}
    </Suspense>
  );
}