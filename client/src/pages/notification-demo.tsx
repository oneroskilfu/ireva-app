import React, { useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Grid, Card, CardContent, CardActions, Divider } from '@mui/material';
import notificationService from '../services/notificationService';
import { authService, propertyService } from '../services/api';

const NotificationDemoPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [loadingToastKey, setLoadingToastKey] = useState<string | null>(null);

  const showBasicNotifications = () => {
    notificationService.success('This is a success notification');
    setTimeout(() => {
      notificationService.info('This is an info notification');
    }, 1000);
    setTimeout(() => {
      notificationService.warning('This is a warning notification');
    }, 2000);
    setTimeout(() => {
      notificationService.error('This is an error notification');
    }, 3000);
  };

  const showCustomMessage = () => {
    if (!message) {
      notificationService.warning('Please enter a message first');
      return;
    }
    notificationService.success(message);
  };

  const simulateApiSuccess = () => {
    const toastKey = 'api-success-demo';
    notificationService.loading('Processing your request...', toastKey);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockResponse = {
        data: {
          message: 'Your investment was successfully processed!'
        }
      };
      notificationService.updateByKey(toastKey, 'success', mockResponse.data.message);
    }, 2000);
  };

  const simulateApiError = () => {
    const toastKey = 'api-error-demo';
    notificationService.loading('Processing your request...', toastKey);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockError = {
        response: {
          status: 500,
          data: {
            message: 'Unable to process investment at this time. Please try again later.'
          }
        }
      };
      notificationService.updateByKey(toastKey, 'error', mockError.response.data.message);
    }, 2000);
  };

  const simulateRealApiCall = async () => {
    const toastKey = 'real-api-call';
    notificationService.loading('Fetching user data...', toastKey);
    
    try {
      await authService.getProfile();
      notificationService.updateByKey(toastKey, 'success', 'User profile data retrieved successfully');
    } catch (error) {
      notificationService.updateByKey(toastKey, 'error', 'Failed to fetch user profile: Unauthorized');
    }
  };

  const dismissAllNotifications = () => {
    notificationService.dismissAll();
    notificationService.info('All notifications cleared');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Notification System Demo
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          This page demonstrates the notification system using React Toastify
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Display the standard notification types in sequence
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={showBasicNotifications}
                >
                  Show All Notification Types
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Custom Message
                </Typography>
                <TextField
                  label="Enter custom message"
                  variant="outlined"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  margin="normal"
                />
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={showCustomMessage}
                >
                  Show Custom Message
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              API Integration Examples
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Successful API Call
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Simulates a successful API response
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth
                  onClick={simulateApiSuccess}
                >
                  Simulate Success
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Failed API Call
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Simulates a failed API response
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="error" 
                  fullWidth
                  onClick={simulateApiError}
                >
                  Simulate Error
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Real API Call
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Makes an actual API request
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={simulateRealApiCall}
                >
                  Try Real API Call
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={dismissAllNotifications}
              >
                Dismiss All Notifications
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default NotificationDemoPage;