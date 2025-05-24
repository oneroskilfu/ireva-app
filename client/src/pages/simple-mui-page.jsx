import React from 'react';
import { 
  Button, 
  Typography, 
  Box, 
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';

/**
 * Simple MUI Page
 * 
 * This component doesn't include its own ThemeProvider,
 * but instead relies on the top-level ThemeProvider in main.tsx
 */
function SimpleMuiPage() {
  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Simple Material UI Page
        </Typography>
        
        <Typography variant="subtitle1" component="p" align="center" sx={{ mb: 4 }}>
          This page uses the application's main ThemeProvider
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            UI Components
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
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
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Card Title
                </Typography>
                <Typography variant="body1">
                  This is a simple card component that demonstrates how Material UI 
                  components work within our application.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Theme Integration
                </Typography>
                <Typography variant="body1">
                  This page uses the application's top-level ThemeProvider rather than 
                  defining its own, which helps maintain consistency.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="secondary">
                  Details
                </Button>
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
  );
}

export default SimpleMuiPage;