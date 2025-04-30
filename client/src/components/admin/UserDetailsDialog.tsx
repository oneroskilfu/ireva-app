import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  Divider
} from '@mui/material';
import { toast } from '../../lib/toast';

// Define User interface
interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  status: 'active' | 'inactive' | 'suspended';
  kycStatus: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin' | 'super_admin' | 'investor';
  walletBalance: string;
  createdAt: string;
  phone?: string;
}

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (userData: Partial<User> & { id: string }) => void;
  isUpdating: boolean;
}

const UserDetailsDialog = ({ 
  open, 
  onClose, 
  user,
  onUpdateUser,
  isUpdating
}: UserDetailsDialogProps) => {
  // State for editable fields
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [role, setRole] = useState(user.role);
  const [kycStatus, setKycStatus] = useState(user.kycStatus);

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }

    onUpdateUser({
      id: user.id,
      email,
      fullName: fullName || undefined,
      phone: phone || undefined,
      role,
      kycStatus
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Edit User Details
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                User ID: {user.id}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Created: {new Date(user.createdAt).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                fullWidth
                value={user.username}
                disabled
                margin="normal"
                helperText="Username cannot be changed"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Account Settings
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value as User['role'])}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="investor">Investor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>KYC Status</InputLabel>
                <Select
                  value={kycStatus}
                  label="KYC Status"
                  onChange={(e) => setKycStatus(e.target.value as User['kycStatus'])}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Current Status: <strong>{user.status}</strong> 
                <br />
                <em>Note: To change user status, use the status buttons in the user list.</em>
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Wallet Balance: <strong>${parseFloat(user.walletBalance).toFixed(2)}</strong> 
                <br />
                <em>Note: To see transaction history, use the wallet button in the user list.</em>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <CircularProgress size={24} />
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog;