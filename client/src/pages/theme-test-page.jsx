import React from 'react';
import { 
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
  Alert,
  createTheme,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { Helmet } from 'react-helmet-async';

// Create a standalone theme for this page only
const theme = createTheme({
  palette: {
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
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  }
});

function ThemeTestPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Helmet>
          <title>iREVA - Theme Test Page</title>
          <meta name="description" content="Testing the theme integration for iREVA" />
        </Helmet>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Theme Integration Test
          </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom align="center">
          This page tests Material UI components with our integrated theme provider
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
      </Box>
    </Container>
    </ThemeProvider>
  );
}

export default ThemeTestPage;