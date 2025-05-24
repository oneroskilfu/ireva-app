import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Divider, 
  Switch, 
  FormControlLabel,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import MainLayout from '../components/layouts/MainLayout';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+2341234567890',
    address: '123 Main Street, Lagos',
    bio: 'Experienced real estate investor looking for new opportunities.'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    investmentUpdates: true,
    marketingEmails: false,
    roiAlerts: true,
    securityAlerts: true
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (e) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your API
    console.log('Profile update submitted:', profileForm);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would validate and send this data to your API
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Password update submitted');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSuccessMessage('Password updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your API
    console.log('Notification settings updated:', notificationSettings);
    setSuccessMessage('Notification preferences updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <MainLayout>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Account Settings
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profile Information" />
          <Tab label="Password" />
          <Tab label="Notifications" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    px: 4
                  }}
                >
                  Save Profile
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    px: 4
                  }}
                >
                  Update Password
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <form onSubmit={handleNotificationSubmit}>
            <Typography variant="h6" gutterBottom>
              Notification Channels
            </Typography>
            <Box sx={{ mb: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    name="emailNotifications"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onChange={handleNotificationChange}
                    name="smsNotifications"
                    color="primary"
                  />
                }
                label="SMS Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onChange={handleNotificationChange}
                    name="pushNotifications"
                    color="primary"
                  />
                }
                label="Push Notifications"
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.investmentUpdates}
                    onChange={handleNotificationChange}
                    name="investmentUpdates"
                    color="primary"
                  />
                }
                label="Investment Updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.roiAlerts}
                    onChange={handleNotificationChange}
                    name="roiAlerts"
                    color="primary"
                  />
                }
                label="ROI Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onChange={handleNotificationChange}
                    name="securityAlerts"
                    color="primary"
                  />
                }
                label="Security Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onChange={handleNotificationChange}
                    name="marketingEmails"
                    color="primary"
                  />
                }
                label="Marketing Emails"
              />
            </Box>
            
            <Button 
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ 
                mt: 4,
                borderRadius: 2,
                px: 4
              }}
            >
              Save Preferences
            </Button>
          </form>
        </TabPanel>
      </Paper>
    </MainLayout>
  );
}

export default SettingsPage;