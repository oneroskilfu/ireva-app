import React from 'react';
import { Container, Typography, Box, Grid, Paper, Button, Divider } from '@mui/material';
import { Building2, TrendingUp, DollarSign, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { useWelcomeDialog } from '../hooks/use-welcome-dialog';
import RoleBasedWelcome from '../components/welcome/RoleBasedWelcome';

const DashboardWithWelcome: React.FC = () => {
  const { user, role } = useAuth();
  const { isWelcomeOpen, closeWelcomeDialog, openWelcomeDialog, resetWelcomeStatus } = useWelcomeDialog();
  const isAdmin = role === 'admin';
  
  // Demo stats for the dashboard
  const adminStats = [
    { title: 'Total Users', value: '128', icon: <Users size={24} />, color: '#4CAF50' },
    { title: 'Properties', value: '36', icon: <Building2 size={24} />, color: '#2196F3' },
    { title: 'Total Investment', value: '₦24.5M', icon: <DollarSign size={24} />, color: '#FF9800' },
    { title: 'Avg. ROI', value: '14.2%', icon: <TrendingUp size={24} />, color: '#9C27B0' },
  ];
  
  const investorStats = [
    { title: 'Your Investments', value: '₦450,000', icon: <DollarSign size={24} />, color: '#4CAF50' },
    { title: 'Properties Owned', value: '2', icon: <Building2 size={24} />, color: '#2196F3' },
    { title: 'Current ROI', value: '12.5%', icon: <TrendingUp size={24} />, color: '#FF9800' },
    { title: 'Next Payout', value: '28 Days', icon: <RefreshCw size={24} />, color: '#9C27B0' },
  ];
  
  const stats = isAdmin ? adminStats : investorStats;
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Role-based welcome dialog */}
      <RoleBasedWelcome
        open={isWelcomeOpen}
        onClose={closeWelcomeDialog}
      />
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {isAdmin ? 'Admin Dashboard' : 'Investor Dashboard'}
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={openWelcomeDialog}
          size="small"
        >
          Show Welcome Guide
        </Button>
      </Box>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        {isAdmin 
          ? 'Manage and monitor the platform performance' 
          : `Welcome back, ${user?.username || 'Investor'}. Here's your investment summary.`
        }
      </Typography>
      
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item component="div" key={index} xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                borderTop: `4px solid ${stat.color}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  mr: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: stat.color
                }}>
                  {stat.icon}
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Admin or Investor Specific Content */}
      {isAdmin ? (
        <AdminDashboardContent />
      ) : (
        <InvestorDashboardContent />
      )}
      
      {/* Demo Controls */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Demo Controls
        </Typography>
        <Typography variant="body2" paragraph color="text.secondary">
          These controls are for demonstration purposes only.
        </Typography>
        <Button 
          variant="outlined" 
          onClick={resetWelcomeStatus}
          size="small"
          color="secondary"
          sx={{ mr: 2 }}
        >
          Reset Welcome Status
        </Button>
      </Paper>
    </Container>
  );
};

// Admin-specific dashboard content
const AdminDashboardContent: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item component="div" xs={12} md={8}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Platform Overview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body2" paragraph>
            The platform is currently running smoothly with no reported issues.
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', bgcolor: '#E8F5E9', p: 2, borderRadius: 1 }}>
            <AlertCircle size={20} style={{ color: '#2E7D32', marginRight: 8 }} />
            <Typography variant="body2" color="#2E7D32">
              All systems operational. Last server restart: 7 days ago
            </Typography>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item component="div" xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="outlined" fullWidth>
              Approve New Users
            </Button>
            <Button variant="outlined" fullWidth>
              Review KYC Submissions
            </Button>
            <Button variant="outlined" fullWidth>
              Process Payouts
            </Button>
            <Button variant="outlined" fullWidth>
              System Maintenance
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Investor-specific dashboard content
const InvestorDashboardContent: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Investment Portfolio
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mt: 3 }}>
            {[
              { 
                name: 'Premium Abuja Land', 
                amount: '₦250,000', 
                roi: '13.5%',
                type: 'Residential',
                date: 'Jan 15, 2023'
              },
              { 
                name: 'Lagos Commercial Plaza', 
                amount: '₦200,000', 
                roi: '11.2%',
                type: 'Commercial',
                date: 'Mar 22, 2023'
              }
            ].map((investment, index) => (
              <Box key={index} sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 1, 
                border: '1px solid #e0e0e0',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {investment.name}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {investment.amount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Type: {investment.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Since: {investment.date}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'medium' }}>
                    ROI: {investment.roi}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button variant="contained" color="primary">
              View All Investments
            </Button>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Account Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: 1, 
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Wallet Balance:</Typography>
              <Typography variant="body2" fontWeight="bold">₦125,000</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Total Invested:</Typography>
              <Typography variant="body2" fontWeight="bold">₦450,000</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Earnings to Date:</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ color: '#4CAF50' }}>₦57,250</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">KYC Status:</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ color: '#4CAF50' }}>Verified</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="contained" color="primary" fullWidth>
              Add Funds
            </Button>
            <Button variant="outlined" fullWidth>
              Withdraw Funds
            </Button>
            <Button variant="outlined" fullWidth>
              Investment History
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardWithWelcome;