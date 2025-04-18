import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, useTheme, Divider, Alert, Button } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import InfoIcon from '@mui/icons-material/Info';
import TableChartIcon from '@mui/icons-material/TableChart';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import ROIOverview from '../components/Investor/ROIOverview';
import ROIChart from '../components/Investor/ROIChart';
import ROITransactions from '../components/Investor/ROITransactions';
import ROIPerformance from '../components/Investor/ROIPerformance';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`roi-tabpanel-${index}`}
      aria-labelledby={`roi-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const InvestorROIDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 700, 
          color: '#4B3B2A',
          mb: 1,
          background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Your ROI Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your returns on investment and performance across all properties
        </Typography>
      </Box>

      <Paper sx={{ 
        p: 2, 
        mb: 4, 
        backgroundColor: 'rgba(75, 59, 42, 0.05)', 
        border: '1px solid rgba(75, 59, 42, 0.2)',
        borderRadius: '8px' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <InfoIcon sx={{ color: '#4B3B2A' }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: '#4B3B2A' }}>
              Understanding Your ROI
            </Typography>
            <Typography variant="body2">
              Return on Investment (ROI) is calculated based on your investment amount and distributed on a monthly basis.
              Payments are processed on the 1st of each month and will appear in your wallet within 3 business days.
              Monitor your performance below to ensure your portfolio is meeting target returns.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Dashboard Overview */}
      <ROIOverview />

      {/* Tabs for different sections */}
      <Paper sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          sx={{
            '& .MuiTab-root': { 
              fontWeight: 600,
              textTransform: 'none',
              minHeight: '64px',
              color: 'rgba(0, 0, 0, 0.7)'
            },
            '& .Mui-selected': { 
              color: '#4B3B2A !important' 
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: '#4B3B2A',
              height: '3px'
            }
          }}
        >
          <Tab 
            icon={<AssessmentIcon />} 
            iconPosition="start" 
            label="Monthly ROI Chart" 
            id="roi-tab-0" 
            aria-controls="roi-tabpanel-0" 
          />
          <Tab 
            icon={<HomeWorkIcon />} 
            iconPosition="start" 
            label="Property Performance" 
            id="roi-tab-1" 
            aria-controls="roi-tabpanel-1" 
          />
          <Tab 
            icon={<ReceiptLongIcon />} 
            iconPosition="start" 
            label="Transaction History" 
            id="roi-tab-2" 
            aria-controls="roi-tabpanel-2" 
          />
        </Tabs>
        
        <Divider />
        
        <TabPanel value={tabValue} index={0}>
          <ROIChart />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ROIPerformance />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ROITransactions />
        </TabPanel>
      </Paper>
      
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Container>
  );
};

export default InvestorROIDashboard;