import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import MuiSidebar from './MuiSidebar';
import { useLocation } from 'wouter';
import { logout } from '../../utils/auth';

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