import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { StatusToggle } from './StatusToggle';
import axios from 'axios';

interface User {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  kycStatus: string;
  phoneNumber?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | number | null;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  onClose,
  userId
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<{
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }>({});

  React.useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    } else {
      setUser(null);
      setError(null);
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/admin/users/${userId}`);
      setUser(response.data);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        phoneNumber: response.data.phoneNumber
      });
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      setError(err.response?.data?.error || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch(`/api/admin/users/${userId}`, formData);
      setUser(response.data);
      setEditing(false);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string | number, newStatus: string) => {
    try {
      const response = await axios.post(`/api/admin/users/${userId}/status`, { status: newStatus });
      setUser(prev => prev ? { ...prev, status: newStatus } : null);
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.response?.data?.error || 'Failed to update user status');
      return Promise.reject(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        User Details
        {user && (
          <Typography variant="subtitle1" color="textSecondary">
            {user.email}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!loading && user && (
          <>
            <Box mb={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    name="firstName"
                    value={editing ? formData.firstName || '' : user.firstName || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    name="lastName"
                    value={editing ? formData.lastName || '' : user.lastName || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    name="phoneNumber"
                    value={editing ? formData.phoneNumber || '' : user.phoneNumber || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="KYC Status"
                    fullWidth
                    value={user.kycStatus}
                    disabled
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Account Status
            </Typography>
            
            <Box mb={2}>
              <StatusToggle 
                userId={user.id} 
                currentStatus={user.status} 
                onStatusChange={handleStatusChange} 
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        {!loading && user && editing ? (
          <>
            <Button onClick={() => setEditing(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary" variant="contained">
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} color="inherit">
              Close
            </Button>
            {!loading && user && (
              <Button onClick={() => setEditing(true)} color="primary">
                Edit
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};