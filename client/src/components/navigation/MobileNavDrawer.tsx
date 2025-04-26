import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon,
  Divider,
  Typography,
  Avatar,
  Fab,
  SwipeableDrawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  NotificationsOutlined as NotificationsIcon,
  SettingsOutlined as SettingsIcon,
  BarChart as AnalyticsIcon,
  HelpOutline as SupportIcon,
  Info as AboutIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useLocation, Link } from 'wouter';

// Mock user data - would come from authentication context in a real app
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://i.pravatar.cc/150?img=68'
};

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  dividerAfter?: boolean;
}

const MobileNavDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [location] = useLocation();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  // Navigation items with icons
  const navigationItems: NavigationItem[] = [
    { label: 'Home', path: '/', icon: <HomeIcon />, dividerAfter: true },
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Properties', path: '/properties', icon: <BusinessIcon /> },
    { label: 'Wallet', path: '/wallet', icon: <WalletIcon /> },
    { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon />, dividerAfter: true },
    { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon />, dividerAfter: true },
    { label: 'Support', path: '/support', icon: <SupportIcon /> },
    { label: 'About', path: '/about', icon: <AboutIcon /> },
  ];

  // iOS has a "swipe to go back" feature that interferes with the swipe to open drawer
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const drawerContent = (
    <Box 
      sx={{ 
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* User profile section */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          pb: 3
        }}
      >
        <Avatar 
          src={mockUser.avatar} 
          sx={{ width: 64, height: 64, mb: 1, mt: 1 }}
        />
        <Typography variant="subtitle1" fontWeight="bold">
          {mockUser.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {mockUser.email}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <IconButton 
            size="small" 
            sx={{ 
              color: 'primary.contrastText',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              }
            }}
            component={Link} 
            href="/profile"
            onClick={toggleDrawer(false)}
          >
            <PersonIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Navigation links */}
      <List sx={{ flexGrow: 1, pt: 0 }}>
        {navigationItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={location === item.path}
                onClick={toggleDrawer(false)}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    borderRight: `4px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: location === item.path ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: location === item.path ? 'bold' : 'regular'
                  }} 
                />
              </ListItemButton>
            </ListItem>
            {item.dividerAfter && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>

      {/* Logout button */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          component={Link}
          href="/logout"
          onClick={toggleDrawer(false)}
          sx={{
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Menu button - fixed position for easy access */}
      <Box
        sx={{
          position: 'fixed',
          bottom: isDesktop ? 'auto' : 20,
          top: isDesktop ? 20 : 'auto',
          right: 20,
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          size={isDesktop ? 'medium' : 'large'}
          sx={{
            boxShadow: theme.shadows[8],
          }}
        >
          <MenuIcon />
        </Fab>
      </Box>

      {/* Swipeable drawer for mobile, regular drawer for desktop */}
      {isDesktop ? (
        <Drawer
          anchor="right"
          open={open}
          onClose={toggleDrawer(false)}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              boxShadow: theme.shadows[5],
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <SwipeableDrawer
          anchor="left"
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          disableBackdropTransition={!iOS}
          disableDiscovery={iOS}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              boxShadow: theme.shadows[5],
            },
          }}
        >
          {drawerContent}
        </SwipeableDrawer>
      )}
    </>
  );
};

export default MobileNavDrawer;