import React from 'react';
import { 
  createTheme, 
  ThemeProvider, 
  CssBaseline,
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  TextField,
  Alert
} from '@mui/material';

// Create a completely standalone theme
const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#3730A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#B91C1C',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#B45309',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          padding: '0.5rem 1.25rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
        },
      },
    },
  },
});

// Completely standalone component that uses its own MUI ThemeProvider
function StandaloneMuiComponent() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Standalone MUI Component
          </Typography>
          
          <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            This component has its own ThemeProvider and doesn't depend on any external context
          </Typography>
          
          <Paper elevation={3} sx={{ p: 3, my: 4 }}>
            <Typography variant="h6" gutterBottom>
              Color Palette Test
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" color="primary" fullWidth>
                  Primary Button
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" color="secondary" fullWidth>
                  Secondary Button
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" color="error" fullWidth>
                  Error Button
                </Button>
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" color="primary" fullWidth>
                  Outlined Primary
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" color="secondary" fullWidth>
                  Outlined Secondary
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Input Components
                  </Typography>
                  <TextField 
                    label="Standard Input" 
                    variant="outlined" 
                    fullWidth 
                    margin="normal"
                  />
                  <TextField 
                    label="With Helper Text" 
                    helperText="Some important helper text" 
                    variant="outlined" 
                    fullWidth 
                    margin="normal"
                  />
                  <TextField 
                    error
                    label="Error State" 
                    helperText="This field has an error" 
                    variant="outlined" 
                    fullWidth 
                    margin="normal"
                  />
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Alert Components
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    This is a success alert — check it out!
                  </Alert>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This is an info alert — check it out!
                  </Alert>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    This is a warning alert — check it out!
                  </Alert>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    This is an error alert — check it out!
                  </Alert>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" color="primary" size="large" href="/">
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default StandaloneMuiComponent;