import * as React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SimpleSidebar from './SimpleSidebar';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SimpleSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: '240px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SimpleLayout;