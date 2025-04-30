import { useState } from 'react';
import { Button, Box, Typography, Alert, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

interface DebugLoginProps {
  onLoginSuccess?: (userData: any) => void;
}

export default function DebugLogin({ onLoginSuccess }: DebugLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleDebugLogin = async (role: string = 'admin') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/debug/debug-login', { role });
      console.log('Debug login successful:', response.data);
      setSuccess(true);
      
      // Store the JWT token in localStorage for API requests
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        console.log('Auth token stored in localStorage');
      }
      
      if (onLoginSuccess) {
        onLoginSuccess(response.data.user);
      }
      
      // Reload the page after a short delay to refresh app state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Debug login error:', err);
      setError('Failed to create debug session. See console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Debug Authentication
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This component is for development purposes only. It allows bypassing normal authentication
        flow to test protected routes.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Debug login successful! Reloading the page...
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleDebugLogin('admin')}
          disabled={loading || success}
        >
          Login as Admin
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => handleDebugLogin('user')}
          disabled={loading || success}
        >
          Login as User
        </Button>
        
        {loading && <CircularProgress size={24} />}
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Note: This functionality is only available in development mode.
      </Typography>
    </Paper>
  );
}