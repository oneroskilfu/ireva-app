import React from 'react';
import { Box, CircularProgress, Paper } from '@mui/material';

/**
 * Wrapper component for lazy-loaded content that displays a loading indicator
 * and provides consistent styling for cards/sections in the dashboard
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {number} props.height - Height of the component container
 * @param {number} props.elevation - Material UI Paper elevation
 * @returns {JSX.Element} Wrapped component with loading fallback
 */
const LazyComponentWrapper = ({ children, height = 200, elevation = 2 }) => {
  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        height: height, 
        p: 2, 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '10px'
      }}
    >
      <React.Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <CircularProgress />
        </Box>
      }>
        {children}
      </React.Suspense>
    </Paper>
  );
};

export default LazyComponentWrapper;