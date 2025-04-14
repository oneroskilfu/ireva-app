import React, { useState, useContext } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container,
  Grid, 
  Link, 
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { VisibilityOff, Visibility, Login as LoginIcon } from '@mui/icons-material';
import { AuthContext } from '../App';
import API from '../api/axios';
import { useLocation } from 'wouter';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken } = useContext(AuthContext);
  const [, setLocation] = useLocation();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the API utility to make the POST request to the login endpoint
      const response = await API.post('/auth/login', { email, password });
      
      // Check if a token was returned in the response
      if (response.data && response.data.token) {
        // Use the setToken function from AuthContext to update auth state
        setToken(response.data.token);
        
        // Navigate to the dashboard after successful login
        setLocation('/dashboard');
      } else {
        setError('Login failed: No authentication token received');
      }
    } catch (err: any) {
      // Set meaningful error message based on the error response
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={2} sx={{ height: '100vh', alignItems: 'center' }}>
        {/* Login Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Sign in to continue to REVA Real Estate Investments
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{ mt: 2, mb: 2, py: 1.5 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
                <Link href="/auth" variant="body2">
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Hero Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Invest in Nigeria's Future
            </Typography>
            <Typography variant="body1" paragraph>
              REVA provides a secure and transparent platform for investing in premium Nigerian real estate properties.
            </Typography>
            <Typography variant="body1" paragraph>
              • Diverse portfolio of properties across Nigeria
            </Typography>
            <Typography variant="body1" paragraph>
              • Minimum investment starting at ₦100,000
            </Typography>
            <Typography variant="body1" paragraph>
              • Projected annual returns of 12-20%
            </Typography>
            <Typography variant="body1" paragraph>
              • Full transparency with real-time ROI tracking
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;