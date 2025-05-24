import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';

// Create the theme directly inside the component
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
});

function DirectMuiTestPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Direct Material UI Test Page
          </Typography>
          <Typography variant="body1" paragraph>
            This is a test page with Material UI components and theme defined directly in the component.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button variant="contained" color="primary">Primary Button</Button>
            <Button variant="contained" color="secondary">Secondary Button</Button>
            <Button variant="outlined" color="primary">Outlined Button</Button>
            <Button variant="text" color="primary">Text Button</Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Card Title 1
                  </Typography>
                  <Typography variant="body2">
                    This is a Material UI card component with some sample content.
                    Cards are surface elements that display content and actions on a single topic.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Card Title 2
                  </Typography>
                  <Typography variant="body2">
                    Cards are entry points to more detailed information or actions.
                    This is another example of a Material UI card component.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Card Title 3
                  </Typography>
                  <Typography variant="body2">
                    Cards can contain actions which should be placed at the bottom of the card.
                    This is a third example card with a Material UI button.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            component="a" 
            href="/"
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default DirectMuiTestPage;