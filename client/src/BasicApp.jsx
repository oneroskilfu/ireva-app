import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  Paper,
  CssBaseline
} from '@mui/material';
import { Route, Router, Switch } from 'wouter';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/investor/DashboardPage';
import Navigation from './components/Navigation';

// Basic App component with Router setup
export default function BasicApp() {
  return (
    <>
      <CssBaseline />
      <Navigation />
      
      <Router>
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
      </Router>
    </>
  );
}