import React from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, ListItemIcon, Divider, Link } from '@mui/material';
import { Settings, Users, LayoutDashboard, CreditCard, FileText, BarChart2, AlertTriangle } from 'lucide-react';
import SimpleAdminComponent from '../components/SimpleAdminComponent';
import { useAuth } from '../contexts/auth-context';
import { Link as WouterLink } from 'wouter';

/**
 * A simple admin page that demonstrates using the direct role checking pattern
 */
const SimpleAdminPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Simple Admin Access Control
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        This page demonstrates the simpler role-checking pattern for protecting admin content
      </Typography>
      
      <SimpleAdminComponent title="Admin Dashboard Controls">
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            Welcome, <strong>{user?.username || 'Admin'}</strong>! This section is only visible to administrators.
          </Typography>
          
          <Typography variant="body1">
            The access control is implemented using a simple role check pattern:
          </Typography>
          
          <Box 
            sx={{ 
              bgcolor: 'background.paper', 
              p: 2, 
              borderRadius: 1, 
              my: 2,
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap',
              overflowX: 'auto'
            }}
          >
            {`// Simple role-based access control pattern
const { role } = useAuth();
if (role !== 'admin') {
  setLocation('/unauthorized');
  return null;
}`}
          </Box>
          
          <Typography variant="body1" paragraph>
            This pattern is simpler than using a wrapper component in many cases, especially for standalone admin pages.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Admin Quick Links
        </Typography>
        
        <List>
          <ListItem>
            <WouterLink href="/admin">
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemIcon>
                  <LayoutDashboard size={24} />
                </ListItemIcon>
                <ListItemText primary="Main Admin Dashboard" />
              </div>
            </WouterLink>
          </ListItem>
          
          <ListItem>
            <WouterLink href="/admin/settings">
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemIcon>
                  <Settings size={24} />
                </ListItemIcon>
                <ListItemText primary="Platform Settings" />
              </div>
            </WouterLink>
          </ListItem>
          
          <ListItem>
            <WouterLink href="/users">
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemIcon>
                  <Users size={24} />
                </ListItemIcon>
                <ListItemText primary="User Management" />
              </div>
            </WouterLink>
          </ListItem>
          
          <ListItem>
            <WouterLink href="/projects">
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemIcon>
                  <FileText size={24} />
                </ListItemIcon>
                <ListItemText primary="Project Management" />
              </div>
            </WouterLink>
          </ListItem>
          
          <ListItem>
            <WouterLink href="/investments">
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemIcon>
                  <CreditCard size={24} />
                </ListItemIcon>
                <ListItemText primary="Investment Tracking" />
              </div>
            </WouterLink>
          </ListItem>
          
          <ListItem>
            <WouterLink href="/analytics">
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemIcon>
                  <BarChart2 size={24} />
                </ListItemIcon>
                <ListItemText primary="Analytics & Reports" />
              </div>
            </WouterLink>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ bgcolor: '#FFF9E6', p: 2, borderRadius: 1, display: 'flex', alignItems: 'center' }}>
          <AlertTriangle size={24} color="#F59E0B" style={{ marginRight: 12 }} />
          <Typography variant="body2">
            Remember to log out when you're done to maintain security. This admin section contains 
            sensitive information and controls.
          </Typography>
        </Box>
      </SimpleAdminComponent>
    </Container>
  );
};

export default SimpleAdminPage;