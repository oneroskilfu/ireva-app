import * as React from 'react';
import { useState, useContext } from 'react';
import { useLocation } from 'wouter';
import { 
  Box, 
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Grid,
  Link,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { LockOutlined, Person, PersonAdd, Email, Phone } from '@mui/icons-material';
import { AuthContext } from '../App';
import { login, register, LoginCredentials, RegisterData } from '../api/authService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [, setLocation] = useLocation();
  const { setToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(loginData);
      setToken(result.token);
      setLocation('/simple-dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await register(registerData);
      setToken(result.token);
      setLocation('/simple-dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Grid container spacing={4}>
        {/* Left side - Auth forms */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
                REVA
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                Real Estate Value Assets
              </Typography>
            </Box>

            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth" 
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleLoginSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={loginData.username}
                  onChange={handleLoginChange}
                  InputProps={{
                    startAdornment: <Person color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  InputProps={{
                    startAdornment: <LockOutlined color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <form onSubmit={handleRegisterSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="register-username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  InputProps={{
                    startAdornment: <Person color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="register-email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  InputProps={{
                    startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="register-password"
                  label="Password"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  InputProps={{
                    startAdornment: <LockOutlined color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="register-fullName"
                  label="Full Name"
                  name="fullName"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  InputProps={{
                    startAdornment: <PersonAdd color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="register-phone"
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+234"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  InputProps={{
                    startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
              </form>
            </TabPanel>

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                <Link href="#" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Need help? <Link href="/support">Contact support</Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Hero section */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              p: 4,
            }}
          >
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Invest in Real Estate without the Hassle
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
              REVA makes real estate investing accessible to everyone in Nigeria.
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" paragraph>
                ✓ Start with as little as ₦100,000
              </Typography>
              <Typography variant="body1" paragraph>
                ✓ Earn up to 15% annual returns
              </Typography>
              <Typography variant="body1" paragraph>
                ✓ Own shares in premium properties in Lagos, Abuja and more
              </Typography>
              <Typography variant="body1">
                ✓ Track your investment performance in real-time
              </Typography>
            </Box>

            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => setTabValue(1)}
              sx={{ alignSelf: 'flex-start', mt: 2 }}
            >
              Get Started Now
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthPage;