import React from 'react';
import { Link } from 'wouter';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  ListItemIcon, 
  Box, 
  Typography, 
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Business as ProjectsIcon,
  People as UsersIcon, 
  HomeWork as PropertiesIcon, 
  TrendingUp as ROIIcon, 
  CurrencyExchange as InvestmentsIcon, 
  Email as MessagesIcon, 
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

interface SidebarProps {
  onLogout: () => void;
}

const MuiSidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [location] = React.useState<string>(window.location.pathname);

  const isActive = (path: string): string => {
    return location === path ? 'bg-blue-50 text-blue-700' : '';
  };

  return (
    <Drawer
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e6e6e6',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e40af' }}>
          REVA Admin
        </Typography>
        <Typography variant="subtitle2" sx={{ color: '#64748b' }}>
          Real Estate Investment Platform
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ p: 1 }}>
        <ListItem 
          button 
          component={Link} 
          href="/dashboard"
          sx={{ 
            borderRadius: 1, 
            mb: 0.5, 
            backgroundColor: location === '/dashboard' ? '#eff6ff' : 'transparent',
            color: location === '/dashboard' ? '#1e40af' : 'inherit',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          <ListItemIcon sx={{ color: location === '/dashboard' ? '#1e40af' : '#64748b', minWidth: 40 }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          href="/projects"
          sx={{ 
            borderRadius: 1, 
            mb: 0.5, 
            backgroundColor: location === '/projects' ? '#eff6ff' : 'transparent', 
            color: location === '/projects' ? '#1e40af' : 'inherit',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          <ListItemIcon sx={{ color: location === '/projects' ? '#1e40af' : '#64748b', minWidth: 40 }}>
            <ProjectsIcon />
          </ListItemIcon>
          <ListItemText primary="Projects" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          href="/users"
          sx={{ 
            borderRadius: 1, 
            mb: 0.5, 
            backgroundColor: location === '/users' ? '#eff6ff' : 'transparent', 
            color: location === '/users' ? '#1e40af' : 'inherit',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          <ListItemIcon sx={{ color: location === '/users' ? '#1e40af' : '#64748b', minWidth: 40 }}>
            <UsersIcon />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          href="/properties"
          sx={{ 
            borderRadius: 1, 
            mb: 0.5, 
            backgroundColor: location === '/properties' ? '#eff6ff' : 'transparent', 
            color: location === '/properties' ? '#1e40af' : 'inherit',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          <ListItemIcon sx={{ color: location === '/properties' ? '#1e40af' : '#64748b', minWidth: 40 }}>
            <PropertiesIcon />
          </ListItemIcon>
          <ListItemText primary="Properties" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          href="/roi"
          sx={{ 
            borderRadius: 1, 
            mb: 0.5, 
            backgroundColor: location === '/roi' ? '#eff6ff' : 'transparent', 
            color: location === '/roi' ? '#1e40af' : 'inherit',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          <ListItemIcon sx={{ color: location === '/roi' ? '#1e40af' : '#64748b', minWidth: 40 }}>
            <ROIIcon />
          </ListItemIcon>
          <ListItemText primary="ROI Tracker" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          href="/investments"
          sx={{ 
            borderRadius: 1, 
            mb: 0.5, 
            backgroundColor: location === '/investments' ? '#eff6ff' : 'transparent', 
            color: location === '/investments' ? '#1e40af' : 'inherit',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          <ListItemIcon sx={{ color: location === '/investments' ? '#1e40af' : '#64748b', minWidth: 40 }}>
            <InvestmentsIcon />
          </ListItemIcon>
          <ListItemText primary="Investments" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          href="/messages"
          sx={{ 
            borderRadius: 1, 
            mb: 0.5, 
            backgroundColor: location === '/messages' ? '#eff6ff' : 'transparent', 
            color: location === '/messages' ? '#1e40af' : 'inherit',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          <ListItemIcon sx={{ color: location === '/messages' ? '#1e40af' : '#64748b', minWidth: 40 }}>
            <MessagesIcon />
          </ListItemIcon>
          <ListItemText primary="Messages" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          href="/settings"
          sx={{ 
            borderRadius: 1, 
            mb: 0.5, 
            backgroundColor: location === '/settings' ? '#eff6ff' : 'transparent', 
            color: location === '/settings' ? '#1e40af' : 'inherit',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          <ListItemIcon sx={{ color: location === '/settings' ? '#1e40af' : '#64748b', minWidth: 40 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button
          onClick={onLogout}
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{ textTransform: 'none' }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default MuiSidebar;