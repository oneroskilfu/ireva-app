import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Container,
  Divider,
  Breadcrumbs,
  Link,
  Tab,
  Tabs,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link as WouterLink } from 'wouter';
import axiosInstance from '../../utils/axios';

// Import PortfolioOverview component when it's ready
// import PortfolioOverview from '../../components/Portfolio/PortfolioOverview';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`portfolio-tabpanel-${index}`}
      aria-labelledby={`portfolio-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `portfolio-tab-${index}`,
    'aria-controls': `portfolio-tabpanel-${index}`,
  };
}

export default function PortfolioPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const checkAuthStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try using the JWT token with our protected endpoint
      try {
        await axiosInstance.get('/api/test-jwt');
        console.log('JWT authentication successful');
        setAuthenticated(true);
        return;
      } catch (jwtErr) {
        console.log('JWT authentication failed, trying session auth...');
      }
      
      // Fallback to session-based auth
      const response = await axiosInstance.get('/api/debug/current-user');
      if (response.data && response.data.user) {
        console.log('Session authentication successful');
        setAuthenticated(true);
      } else {
        throw new Error('Not authenticated');
      }
    } catch (err) {
      console.error('Authentication check failed:', err);
      setError('You are not authenticated. Please use the debug login on the homepage first.');
    } finally {
      setLoading(false);
    }
  };
  
  // Check authentication on component mount
  React.useEffect(() => {
    checkAuthStatus();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={checkAuthStatus}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            component={WouterLink} 
            href="/"
            color="primary"
          >
            Go to Homepage
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            component={WouterLink}
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <AssessmentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Portfolio Management
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Investment Portfolio Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track, analyze, and manage all investment portfolios across properties.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="portfolio tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" {...a11yProps(0)} />
              <Tab label="Performance Analytics" {...a11yProps(1)} />
              <Tab label="ROI Distribution" {...a11yProps(2)} />
              <Tab label="Investor Exposure" {...a11yProps(3)} />
              <Tab label="Risk Assessment" {...a11yProps(4)} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Portfolio Overview
            </Typography>
            
            {/* Portfolio Overview component will be placed here */}
            <Box sx={{ mt: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography>
                Portfolio Overview component loading...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This component will display a comprehensive view of all investments,
                including active investments, total value, ROI projections, and performance metrics.
              </Typography>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Performance Analytics
            </Typography>
            <Typography variant="body1">
              Detailed performance analytics and trends will be displayed here.
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              ROI Distribution
            </Typography>
            <Typography variant="body1">
              ROI distribution metrics and payment schedules will be displayed here.
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Investor Exposure
            </Typography>
            <Typography variant="body1">
              Investor exposure across different properties and investment types will be displayed here.
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Risk Assessment
            </Typography>
            <Typography variant="body1">
              Risk assessment metrics and diversification analysis will be displayed here.
            </Typography>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}