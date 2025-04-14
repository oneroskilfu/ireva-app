import * as React from 'react';
import { Box, CssBaseline } from '@mui/material';
import MuiSidebar from './MuiSidebar';
import { useLocation } from 'wouter';
// Import logout function from auth utilities
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
};

interface MuiLayoutProps {
  children: React.ReactNode;
}

const MuiLayout: React.FC<MuiLayoutProps> = ({ children }) => {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/auth');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <MuiSidebar onLogout={handleLogout} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '260px' }}>
        {children}
      </Box>
    </Box>
  );
};

export default MuiLayout;