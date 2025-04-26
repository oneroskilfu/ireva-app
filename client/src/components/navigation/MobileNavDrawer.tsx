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
  Divider, 
  Avatar, 
  Typography 
} from '@mui/material';
import { SwipeableDrawer } from '@mui/material';
import { useTheme } from '@mui/material';
import { Link, useLocation } from 'wouter';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';

// User auth context
import { useAuth } from '@/hooks/use-auth';

interface MobileNavProps {
  title?: string;
}

export default function MobileNavDrawer({ title = 'iREVA' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const theme = useTheme();
  const [location] = useLocation();
  
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setIsOpen(open);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };
  
  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Wallet', icon: <AccountBalanceWalletIcon />, path: '/wallet' },
    { text: 'Investments', icon: <BusinessCenterIcon />, path: '/investments' },
    { text: 'Properties', icon: <ShowChartIcon />, path: '/properties' },
    { text: 'KYC Verification', icon: <VerifiedUserIcon />, path: '/kyc' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/support' },
  ];
  
  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: 1,
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.background.paper,
        zIndex: 10,
      }}>
        <IconButton 
          edge="start" 
          color="inherit" 
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ p: '12px' }} // Larger touch target
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 1 }}>
          {title}
        </Typography>
      </Box>
      
      <SwipeableDrawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        sx={{
          '& .MuiDrawer-paper': { 
            width: { xs: '85%', sm: 280 },
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mb: 1,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
            }}
          >
            {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="h6">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.username || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || ''}
          </Typography>
        </Box>
        
        <Divider />
        
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                href={item.path}
                selected={location === item.path}
                onClick={toggleDrawer(false)}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mx: 1,
                  py: 1.5, // Taller buttons for touch targets
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ mt: 'auto' }} />
        
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout}
              sx={{ py: 1.5 }} // Taller button for touch target
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </SwipeableDrawer>
    </>
  );
}