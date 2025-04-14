import * as React from 'react';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

const SimpleDashboardPage: React.FC = () => {
  return (
    <SimpleLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Welcome to the REVA Real Estate Investment Platform
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Properties
                </Typography>
                <Typography variant="h4" color="primary">
                  12
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  Active Investments
                </Typography>
                <Typography variant="h4" color="primary">
                  48
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Investment
                </Typography>
                <Typography variant="h4" color="primary">
                  ₦24.5M
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  Average ROI
                </Typography>
                <Typography variant="h4" color="primary">
                  14.5%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </SimpleLayout>
  );
};

export default SimpleDashboardPage;