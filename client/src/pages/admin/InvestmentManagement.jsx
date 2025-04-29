// client/src/pages/admin/InvestmentManagement.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import { 
  TrendingUp,
  MonetizationOn,
  Payment,
  WarningAmber
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import InvestmentManagementTable from '../../components/admin/InvestmentManagementTable';

export default function InvestmentManagement() {
  const statsCards = [
    { 
      title: 'Total Investment Volume', 
      value: '₦854,320,000', 
      icon: <MonetizationOn sx={{ fontSize: 40 }} color="primary" />,
      change: '+12.5%'
    },
    { 
      title: 'Pending Approvals', 
      value: '23', 
      icon: <WarningAmber sx={{ fontSize: 40 }} color="warning" />,
      change: '+5'
    },
    { 
      title: 'Confirmed This Month', 
      value: '145', 
      icon: <TrendingUp sx={{ fontSize: 40 }} color="success" />,
      change: '+18.2%'
    },
    { 
      title: 'Avg. Investment Size', 
      value: '₦5,890,000', 
      icon: <Payment sx={{ fontSize: 40 }} color="info" />,
      change: '+3.8%'
    }
  ];

  return (
    <AdminLayout title="Investment Management">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/admin/dashboard">
          Admin Dashboard
        </Link>
        <Typography color="text.primary">Investment Management</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Investment Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Review and manage all investment transactions. Confirm new investments and monitor transaction patterns.
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h5" component="div">
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color={card.change.startsWith('+') ? 'success.main' : 'error.main'}>
                      {card.change}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <InvestmentManagementTable />
    </AdminLayout>
  );
}