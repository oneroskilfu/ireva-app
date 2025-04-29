import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { Container, Box, Typography } from '@mui/material';
import SafeThemeProvider from './components/SafeThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage.jsx';
import Navigation from './components/Navigation';
import AdminRoutes from './routes/admin-routes';
import InvestorRoutes from './routes/investor-routes';

function MainApp() {
  return (
    <SafeThemeProvider>
      <CssBaseline />
      <Navigation />
      <Router>
        <Switch>
          <Route path="/" component={HomePage} />
          <InvestorRoutes />
          <AdminRoutes />
          <Route path="/:rest*">
            {(params) => (
              <Container>
                <Box sx={{ my: 4, textAlign: 'center' }}>
                  <Typography variant="h4" component="h1">
                    Page Not Found
                  </Typography>
                  <Typography>
                    The page {params.rest} could not be found.
                  </Typography>
                </Box>
              </Container>
            )}
          </Route>
        </Switch>
      </Router>
    </SafeThemeProvider>
  );
}

export default MainApp;