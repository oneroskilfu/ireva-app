import React from 'react';
import { Box, Typography, Button, Container, Alert } from '@mui/material';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { Link } from 'wouter';

const UnauthorizedPage: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          py: 4
        }}
      >
        <ShieldAlert size={64} color="#f44336" />
        
        <Typography variant="h3" component="h1" fontWeight="bold" color="error" gutterBottom sx={{ mt: 2 }}>
          Access Denied
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
          You don't have permission to access this page or resource.
        </Typography>
        
        <Alert severity="info" sx={{ width: '100%', maxWidth: '600px', mb: 4 }}>
          {isAuthenticated ? (
            <>
              You are logged in as <strong>{user?.username}</strong> with role <strong>{role || "none"}</strong>, 
              but this area is restricted to <strong>admin</strong> users only.
            </>
          ) : (
            <>
              This page requires administrator privileges. Please log in with an admin account.
            </>
          )}
        </Alert>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowLeft />}
            component={Link}
            href="/login"
            sx={{ my: 1 }}
          >
            Back to Login
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<Home />}
            component={Link}
            href="/"
            sx={{ my: 1 }}
          >
            Go to Homepage
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;