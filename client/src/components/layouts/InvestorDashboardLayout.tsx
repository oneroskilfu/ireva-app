import React, { useState, ReactNode } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import {
  Dashboard,
  AccountBalance,
  MonetizationOn,
  Assessment,
  Assignment,
  Message,
  Settings,
  Notifications,
  Person,
  Menu as MenuIcon,
  ChevronLeft
} from '@mui/icons-material';
import { useLocation } from 'wouter';

const drawerWidth = 240;

interface NavItem {
  text: string;
  icon: ReactNode;
  path: string;
  badge?: number;
}

interface InvestorDashboardLayoutProps {
  children: ReactNode;
}

const InvestorDashboardLayout: React.FC<InvestorDashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [location, navigate] = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const navItems: NavItem[] = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/investor/dashboard' 
    },
    { 
      text: 'Properties', 
      icon: <AccountBalance />, 
      path: '/investor/properties' 
    },
    { 
      text: 'Investments', 
      icon: <MonetizationOn />, 
      path: '/investor/investments' 
    },
    { 
      text: 'Analytics', 
      icon: <Assessment />, 
      path: '/investor/analytics' 
    },
    { 
      text: 'Documents', 
      icon: <Assignment />, 
      path: '/investor/documents' 
    },
    { 
      text: 'Messages', 
      icon: <Message />, 
      path: '/investor/messages',
      badge: 3 
    },
  ];

  const settingsItems: NavItem[] = [
    { 
      text: 'Settings', 
      icon: <Settings />, 
      path: '/investor/settings' 
    },
    { 
      text: 'Profile', 
      icon: <Person />, 
      path: '/investor/profile' 
    },
  ];

  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: [1]
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          iREVA Investor
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => navigate(item.path)}
              selected={location === item.path}
              sx={{ 
                borderRadius: '8px', 
                mx: 1, 
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  },
                }
              }}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <List>
          {settingsItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => navigate(item.path)}
              selected={location === item.path}
              sx={{ 
                borderRadius: '8px', 
                mx: 1, 
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  },
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 1
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            iREVA Investor Dashboard
          </Typography>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton 
            onClick={handleProfileMenuOpen}
            size="small" 
            edge="end" 
            aria-label="account of current user"
            aria-haspopup="true"
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>J</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/investor/profile'); handleProfileMenuClose(); }}>Profile</MenuItem>
            <MenuItem onClick={() => { navigate('/investor/settings'); handleProfileMenuClose(); }}>Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            boxShadow: isMobile ? 2 : 0
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default InvestorDashboardLayout;