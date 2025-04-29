import React from 'react';
import { Route, Switch } from 'wouter';
import { Container, Box, Typography } from '@mui/material';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/investor/DashboardPage';
import Navigation from './components/Navigation';

// Basic App component with routing
export default function BasicApp() {
  return (
    <>
      <Navigation />
      
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/investor/dashboard" component={DashboardPage} />
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
    </>
  );
}