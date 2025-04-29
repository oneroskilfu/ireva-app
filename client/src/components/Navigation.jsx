import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  AccountBalance,
  Payment,
  Settings,
  ExitToApp,
  Home
} from '@mui/icons-material';
import { useLocation } from 'wouter';

const Navigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [location, navigate] = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Navigation items with icons and paths
  const navItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Investor Dashboard', icon: <Dashboard />, path: '/investor/dashboard' },
    { text: 'Admin Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Admin Overview', icon: <Dashboard />, path: '/admin/overview' },
    { text: 'Properties', icon: <AccountBalance />, path: '/investor/properties' },
    { text: 'Wallet', icon: <Payment />, path: '/investor/wallet' },
    { text: 'Settings', icon: <Settings />, path: '/settings' }
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          iREVA Platform
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
            selected={location === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => handleNavigation('/')}>
            iREVA
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {navItems.map((item) => (
                <Button 
                  color="inherit" 
                  key={item.text}
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    mx: 1,
                    borderBottom: location === item.path ? '2px solid white' : 'none',
                    borderRadius: 0,
                    pb: 0.5
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
          
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      
      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Navigation;