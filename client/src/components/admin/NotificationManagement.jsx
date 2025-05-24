import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Chip
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import axios from 'axios';

const NotificationManagement = () => {
  const [formState, setFormState] = useState({
    title: '',
    body: '',
    link: '',
    selectedUsers: []
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [stats, setStats] = useState(null);

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelectChange = (event) => {
    setFormState(prev => ({
      ...prev,
      selectedUsers: event.target.value
    }));
  };

  const handleSendToAllChange = (event) => {
    setSendToAll(event.target.checked);
    // Clear selected users when switching to "send to all"
    if (event.target.checked) {
      setFormState(prev => ({
        ...prev,
        selectedUsers: []
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Determine API endpoint based on whether we're sending to all or specific users
      const endpoint = sendToAll 
        ? '/api/send-push' 
        : '/api/send-push';
      
      // Prepare request payload
      const payload = {
        title: formState.title,
        body: formState.body,
        link: formState.link || undefined
      };
      
      // Add userIds only if we're not sending to all
      if (!sendToAll && formState.selectedUsers.length > 0) {
        payload.userIds = formState.selectedUsers;
      }
      
      // Send the notification
      const response = await axios.post(endpoint, payload);
      
      // Set stats for display
      setStats(response.data);
      setSuccess(true);
      
      // Reset form on success
      setFormState({
        title: '',
        body: '',
        link: '',
        selectedUsers: []
      });
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.response?.data?.message || 'Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <NotificationsActiveIcon fontSize="large" sx={{ color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1">
            Send Push Notifications
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={sendToAll} 
                      onChange={handleSendToAllChange} 
                    />
                  } 
                  label="Send to all users" 
                />
              </FormGroup>
            </Grid>
          
            {!sendToAll && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="users-select-label">Select Users</InputLabel>
                  <Select
                    labelId="users-select-label"
                    id="users-select"
                    multiple
                    value={formState.selectedUsers}
                    onChange={handleUserSelectChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((userId) => {
                          const user = users.find(u => u.id === userId);
                          return (
                            <Chip 
                              key={userId} 
                              label={user ? user.username || user.email : userId} 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.username || user.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Notification Title"
                name="title"
                value={formState.title}
                onChange={handleChange}
                variant="outlined"
                placeholder="Enter notification title"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Notification Body"
                name="body"
                value={formState.body}
                onChange={handleChange}
                multiline
                rows={4}
                variant="outlined"
                placeholder="Enter notification message"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Redirect Link (Optional)"
                name="link"
                value={formState.link}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g., /properties/123"
                helperText="Where to send users when they click the notification"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || !formState.title || !formState.body}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NotificationsActiveIcon />}
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {stats && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Total Recipients
                    </Typography>
                    <Typography variant="h5">
                      {stats.tokensCount || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Successful
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {stats.successCount || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Failed
                    </Typography>
                    <Typography variant="h5" color="error.main">
                      {stats.failureCount || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Paper>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Notification sent successfully!
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationManagement;