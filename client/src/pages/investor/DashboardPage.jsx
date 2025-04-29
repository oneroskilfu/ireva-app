import React from 'react';
import { Box, Container } from '@mui/material';
import ResponsiveDashboard from './ResponsiveDashboard.jsx';
import InvestorDashboardLayout from '../../components/layouts/InvestorDashboardLayout';

/**
 * Main investor dashboard page that wraps the dashboard content
 * with appropriate layout elements
 */
const DashboardPage = () => {
  return (
    <InvestorDashboardLayout>
      <ResponsiveDashboard />
    </InvestorDashboardLayout>
  );
};

export default DashboardPage;