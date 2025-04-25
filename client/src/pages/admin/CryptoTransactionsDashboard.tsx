import React from 'react';
import { Typography, Container, Box, Paper, Grid, Breadcrumbs, Link } from '@mui/material';
import AdminCryptoLog from '../../components/admin/AdminCryptoLog';
import CryptoInvestmentsByProject from '../../components/admin/CryptoInvestmentsByProject';
import { Dashboard as DashboardIcon, CurrencyBitcoin } from '@mui/icons-material';

export default function CryptoTransactionsDashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            href="/admin/dashboard"
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <CurrencyBitcoin sx={{ mr: 0.5 }} fontSize="inherit" />
            Crypto Transactions
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          Cryptocurrency Transaction Dashboard
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Monitor all cryptocurrency transactions across the platform.
          Use this dashboard to track payments, verify transactions, and analyze crypto activity.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CryptoInvestmentsByProject />
          </Grid>
          
          <Grid item xs={12}>
            <AdminCryptoLog />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}