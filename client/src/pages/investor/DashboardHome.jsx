import React from 'react';
import { Box, Grid } from '@mui/material';
import InvestorDashboardLayout from '../../components/layouts/InvestorDashboardLayout';
import InvestmentOverview from '../../components/investor/InvestmentOverview';
import WalletSummary from '../../components/investor/WalletSummary';
import Messages from '../../components/investor/Messages';

const DashboardHome = () => {
  return (
    <InvestorDashboardLayout>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InvestmentOverview />
          </Grid>
          <Grid item xs={12} md={8}>
            <Messages />
          </Grid>
          <Grid item xs={12} md={4}>
            <WalletSummary />
          </Grid>
        </Grid>
      </Box>
    </InvestorDashboardLayout>
  );
};

export default DashboardHome;