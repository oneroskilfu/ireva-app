import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { Container, Box, Typography } from '@mui/material';
import SafeThemeProvider from './components/SafeThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage.jsx';
import SimpleDashboard from './pages/investor/SimpleDashboard';
import AdminDashboardSimple from './pages/admin/AdminDashboardSimple';
import Navigation from './components/Navigation';

function MainApp() {
  return (
    <SafeThemeProvider>
      <CssBaseline />
      <Navigation />
      <Router>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/investor/dashboard" component={SimpleDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboardSimple} />
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