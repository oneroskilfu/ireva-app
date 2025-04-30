// client/src/components/admin/AdminSidebar.jsx
import React from 'react';
import { Link } from 'wouter';
import { 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard,
  VerifiedUser,
  Business,
  People,
  AccountBalance,
  Settings,
  BarChart,
  Logout,
  Wallet,
  PieChart,
  Payments
} from '@mui/icons-material';

export default function AdminSidebar() {
  return (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          iREVA Admin
        </Typography>
      </Box>
      
      <Divider />
      
      <List component="nav">
        <ListItemButton component={Link} href="/admin/dashboard">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        
        <ListItemButton component={Link} href="/admin/overview">
          <ListItemIcon>
            <BarChart />
          </ListItemIcon>
          <ListItemText primary="Analytics Overview" />
        </ListItemButton>
        
        <ListItemButton component={Link} href="/admin/kyc">
          <ListItemIcon>
            <VerifiedUser />
          </ListItemIcon>
          <ListItemText primary="KYC Management" />
        </ListItemButton>
        
        <ListItemButton component={Link} href="/admin/properties">
          <ListItemIcon>
            <Business />
          </ListItemIcon>
          <ListItemText primary="Properties" />
        </ListItemButton>
        
        <ListItemButton component={Link} href="/admin/investors">
          <ListItemIcon>
            <People />
          </ListItemIcon>
          <ListItemText primary="Investors" />
        </ListItemButton>
        
        <ListItemButton component={Link} href="/admin/investments">
          <ListItemIcon>
            <AccountBalance />
          </ListItemIcon>
          <ListItemText primary="Investment Management" />
        </ListItemButton>
        
        <ListItemButton component={Link} href="/admin/roi-management">
          <ListItemIcon>
            <Payments />
          </ListItemIcon>
          <ListItemText primary="ROI Management" />
        </ListItemButton>
        
        <ListItemButton component={Link} href="/admin/wallet">
          <ListItemIcon>
            <Wallet />
          </ListItemIcon>
          <ListItemText primary="Wallet Control Panel" />
        </ListItemButton>
        
        <ListItemButton component={Link} href="/admin/settings">
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
      
      <Divider />
      
      <List>
        <ListItemButton>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
}