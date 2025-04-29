import React from 'react';
import { Box, Container } from '@mui/material';
import ResponsiveDashboard from './ResponsiveDashboard.jsx';

/**
 * Main investor dashboard page that wraps the dashboard content
 * with appropriate layout elements
 */
const DashboardPage = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="xl">
        <ResponsiveDashboard />
      </Container>
    </Box>
  );
};

export default DashboardPage;