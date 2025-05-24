import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent
} from '@mui/material';
import SimpleAdminLayout from '../../components/layouts/SimpleAdminLayout';

const SimpleAdminPage = () => {
  return (
    <SimpleAdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Simple Admin Dashboard
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h3">1,245</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Properties</Typography>
                <Typography variant="h3">42</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Investment</Typography>
                <Typography variant="h3">₦350M</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            KYC Verification Requests
          </Typography>
          <Typography>
            There are 5 pending KYC verification requests that need your attention.
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Recent Transactions
          </Typography>
          <Typography>
            You have 8 transactions to review and approve.
          </Typography>
        </Paper>
      </Container>
    </SimpleAdminLayout>
  );
};

export default SimpleAdminPage;