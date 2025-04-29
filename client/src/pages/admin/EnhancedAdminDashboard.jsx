import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import AdminAnalyticsOverviewJS from '../../components/admin/AdminAnalyticsOverviewJS';

const EnhancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="KYC Verification" />
        <Tab label="Properties" />
        <Tab label="Investors" />
      </Tabs>
      
      <Divider sx={{ mb: 3 }} />
      
      {activeTab === 0 && (
        <AdminAnalyticsOverviewJS />
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            KYC Verification Requests
          </Typography>
          <Typography>
            There are 5 pending KYC verification requests that need your attention.
          </Typography>
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Property Management
          </Typography>
          <Typography>
            You have 8 properties currently listed on the platform.
          </Typography>
        </Paper>
      )}
      
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Investor Management
          </Typography>
          <Typography>
            There are 1,243 registered investors on the platform.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EnhancedAdminDashboard;