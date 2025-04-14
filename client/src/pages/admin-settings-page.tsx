import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Paper, Switch, FormControlLabel, Divider } from '@mui/material';
import AdminOnlyComponent from '../components/AdminOnlyComponent';
import { useAdminCheck } from '../hooks/use-admin-check';

const AdminSettingsPage: React.FC = () => {
  // This will redirect to unauthorized page if not admin
  useAdminCheck();
  
  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState({
    minInvestmentAmount: 100000,
    maxInvestmentAmount: 10000000,
    platformFeePercentage: 2.5,
    enableReferrals: true,
    referralBonusAmount: 5000,
    enableAutoInvestment: false,
    kycRequired: true,
    maintenanceMode: false
  });
  
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    setPlatformSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the settings
    console.log('Updated settings:', platformSettings);
    alert('Platform settings updated successfully!');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Platform Administration
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Manage global platform settings and configurations
      </Typography>
      
      <AdminOnlyComponent title="Global Platform Settings">
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Investment Parameters
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <TextField
                  fullWidth
                  label="Minimum Investment (₦)"
                  name="minInvestmentAmount"
                  type="number"
                  value={platformSettings.minInvestmentAmount}
                  onChange={handleSettingChange}
                  margin="normal"
                  InputProps={{ 
                    startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography> 
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Maximum Investment (₦)"
                  name="maxInvestmentAmount"
                  type="number"
                  value={platformSettings.maxInvestmentAmount}
                  onChange={handleSettingChange}
                  margin="normal"
                  InputProps={{ 
                    startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography> 
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Platform Fee (%)"
                  name="platformFeePercentage"
                  type="number"
                  value={platformSettings.platformFeePercentage}
                  onChange={handleSettingChange}
                  margin="normal"
                  InputProps={{ 
                    endAdornment: <Typography sx={{ ml: 1 }}>%</Typography> 
                  }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Platform Features
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={platformSettings.enableReferrals}
                      onChange={handleSettingChange}
                      name="enableReferrals"
                    />
                  }
                  label="Enable Referral Program"
                  sx={{ mb: 2, display: 'block' }}
                />
                
                {platformSettings.enableReferrals && (
                  <TextField
                    fullWidth
                    label="Referral Bonus Amount (₦)"
                    name="referralBonusAmount"
                    type="number"
                    value={platformSettings.referralBonusAmount}
                    onChange={handleSettingChange}
                    margin="normal"
                    InputProps={{ 
                      startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography> 
                    }}
                    sx={{ mb: 2 }}
                  />
                )}
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={platformSettings.enableAutoInvestment}
                      onChange={handleSettingChange}
                      name="enableAutoInvestment"
                    />
                  }
                  label="Enable Auto-Investment"
                  sx={{ mb: 2, display: 'block' }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={platformSettings.kycRequired}
                      onChange={handleSettingChange}
                      name="kycRequired"
                    />
                  }
                  label="Require KYC Verification"
                  sx={{ mb: 2, display: 'block' }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={platformSettings.maintenanceMode}
                      onChange={handleSettingChange}
                      name="maintenanceMode"
                    />
                  }
                  label="Maintenance Mode"
                  sx={{ mb: 2, display: 'block' }}
                />
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Button 
              type="button" 
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Reset to Defaults
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
            >
              Save Platform Settings
            </Button>
          </Box>
        </Box>
      </AdminOnlyComponent>
    </Container>
  );
};

export default AdminSettingsPage;