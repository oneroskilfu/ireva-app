import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Lock, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '../contexts/auth-context';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Box 
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3
          }}
        >
          <Lock size={40} color="#fff" />
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Access Denied
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Sorry, you don't have permission to access this page.
        </Typography>
        
        <Box 
          sx={{ 
            bgcolor: '#FFF9E6', 
            p: 3, 
            borderRadius: 2, 
            mt: 3, 
            mb: 4,
            textAlign: 'left'
          }}
        >
          <Typography variant="body1">
            {user ? (
              <>
                <strong>Current User:</strong> {user.username}<br />
                <strong>Role Required:</strong> Administrator<br />
                <strong>Your Role:</strong> {user.role || 'Investor'}<br />
              </>
            ) : (
              <>
                <strong>Status:</strong> Not Logged In<br />
                <strong>Role Required:</strong> Administrator<br />
              </>
            )}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            href="/"
            startIcon={<Home size={18} />}
          >
            Go to Home
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => window.history.back()}
            startIcon={<ArrowLeft size={18} />}
          >
            Go Back
          </Button>
          
          {!user && (
            <Button 
              variant="contained" 
              color="primary"
              component={Link} 
              href="/login"
            >
              Log In
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default UnauthorizedPage;