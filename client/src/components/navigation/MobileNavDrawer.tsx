import React, { useState } from 'react';
import { 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home as HomeIcon,
  Storefront as StorefrontIcon,
  AccountBalanceWallet as WalletIcon,
  BarChart as BarChartIcon,
  ContactSupport as ContactSupportIcon,
  Settings as SettingsIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'wouter';

// Interface for navigation items
interface NavItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

// Navigation items for the app
const navItems: NavItem[] = [
  { text: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
  { text: 'Properties', path: '/properties', icon: <StorefrontIcon /> },
  { text: 'My Investments', path: '/investments', icon: <BarChartIcon /> },
  { text: 'Wallet', path: '/wallet', icon: <WalletIcon /> },
  { text: 'Support', path: '/support', icon: <ContactSupportIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const MobileNavDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const theme = useTheme();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  // Handle swipe gestures for the drawer (open and close)
  const handleSwipeOpen = () => {
    setOpen(true);
  };

  return (
    <>
      {/* Hamburger menu button */}
      <IconButton 
        color="inherit" 
        edge="start" 
        onClick={toggleDrawer(true)}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1100,
          backgroundColor: 'background.paper',
          boxShadow: 2,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Swipe area to open drawer */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '20px',
          height: '100%',
          zIndex: 1000,
          cursor: 'grab',
        }}
        onClick={handleSwipeOpen}
      />

      {/* Navigation drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            pb: 2,
          },
        }}
        variant="temporary"
      >
        {/* User profile section */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">John Doe</Typography>
            <Typography variant="body2" color="text.secondary">Premium Investor</Typography>
          </Box>
        </Box>

        <Divider />

        {/* Notification banner */}
        <Box 
          sx={{ 
            m: 2, 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: 'primary.light', 
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <NotificationsIcon />
          <Typography variant="body2">
            You have 3 new notifications
          </Typography>
        </Box>

        {/* Navigation items */}
        <List sx={{ pt: 0 }}>
          {navItems.map((item) => (
            <ListItem 
              key={item.text} 
              disablePadding
              sx={{ 
                mb: 0.5, 
                '& .MuiListItemButton-root': {
                  py: 1.5, // Larger padding for touch targets
                },
              }}
            >
              <ListItemButton 
                component={Link} 
                href={item.path}
                selected={location === item.path}
                onClick={toggleDrawer(false)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.main',
                      fontWeight: 'bold',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '16px', // Larger text for better readability
                  }}
                />
                <ChevronRightIcon />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            iREVA - v1.0.0 | © 2025
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileNavDrawer;