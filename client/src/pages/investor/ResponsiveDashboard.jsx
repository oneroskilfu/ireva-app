import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  useMediaQuery, 
  useTheme, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  Button
} from '@mui/material';
import { AddCircleOutline, TrendingUp, Apartment, CreditCard } from '@mui/icons-material';

// Enhanced components
import InvestmentOverview from '../../components/investor/InvestmentOverview';
import WalletSummary from '../../components/investor/WalletSummary';
import Messages from '../../components/investor/Messages';

export default function ResponsiveDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Welcome section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Welcome, John
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddCircleOutline />}
          >
            New Investment
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Overview of your investment portfolio and recent activities
        </Typography>
      </Box>
      
      {/* Investment Summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Investment Summary
        </Typography>
        <InvestmentOverview />
      </Box>
      
      {/* Main dashboard content */}
      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3, overflow: 'hidden', borderRadius: 2, boxShadow: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ backgroundColor: 'background.subtle' }}
            >
              <Tab 
                icon={<TrendingUp />} 
                label="PERFORMANCE" 
                iconPosition="start"
                sx={{ py: 2 }}
              />
              <Tab 
                icon={<Apartment />} 
                label="PROPERTIES" 
                iconPosition="start"
                sx={{ py: 2 }}
              />
              <Tab 
                icon={<CreditCard />} 
                label="TRANSACTIONS" 
                iconPosition="start"
                sx={{ py: 2 }}
              />
            </Tabs>
            <Divider />
            <Box sx={{ p: 3, minHeight: 400 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6">Investment Performance</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Your investment has grown by 12.5% over the past year.
                  </Typography>
                  <Box 
                    sx={{ 
                      height: 300, 
                      backgroundColor: 'background.subtle', 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Performance Chart
                    </Typography>
                  </Box>
                </Box>
              )}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6">Your Properties</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    You currently have investments in 3 properties.
                  </Typography>
                  <Box 
                    sx={{ 
                      height: 300, 
                      backgroundColor: 'background.subtle', 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Property Overview
                    </Typography>
                  </Box>
                </Box>
              )}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6">Recent Transactions</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Your recent investment activities and payments.
                  </Typography>
                  <Box 
                    sx={{ 
                      height: 300, 
                      backgroundColor: 'background.subtle', 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Transaction History
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
          
          {/* Messages */}
          <Messages />
        </Grid>
        
        {/* Right column */}
        <Grid item xs={12} md={4}>
          {/* Wallet Summary */}
          <WalletSummary />
          
          {/* Quick Actions */}
          <Paper sx={{ mt: 3, p: 3, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="body2">ROI History</Typography>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Apartment sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="body2">Properties</Typography>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CreditCard sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="body2">Transactions</Typography>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AddCircleOutline sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="body2">Invest More</Typography>
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Market Updates */}
          <Paper sx={{ mt: 3, p: 3, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Market Updates</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Real estate prices in Lagos have increased by 8.5% in the last quarter, outperforming other investment classes.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              New property listings in prime locations are expected this month.
            </Typography>
            <Button color="primary" sx={{ mt: 1 }}>
              View Market Analysis
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}