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
  Tabs,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import AdminAnalyticsOverviewJS from '../../components/admin/AdminAnalyticsOverviewJS';
import AdminSidebar from '../../components/admin/AdminSidebar';

const EnhancedAdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = React.useState(0);
  const [drawerOpen, setDrawerOpen] = React.useState(!isMobile);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={toggleDrawer}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            iREVA Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={isMobile ? toggleDrawer : undefined}
        sx={{
          width: 250,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: 250, 
            boxSizing: 'border-box',
            boxShadow: isMobile ? 1 : 0
          },
        }}
      >
        <Toolbar />
        <AdminSidebar />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        
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
    </Box>
  );
};

export default EnhancedAdminDashboard;