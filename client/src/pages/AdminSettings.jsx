import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const AdminSettings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully!');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Box sx={{ maxWidth: 500, margin: 'auto', mt: 5, p: 2 }}>
        <Typography variant="h5" gutterBottom>Settings</Typography>

        <Box sx={{ mb: 4 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={darkMode} 
                onChange={() => {
                  setDarkMode(!darkMode);
                  toast.success(`${!darkMode ? 'Dark' : 'Light'} mode activated`);
                }} 
                color="primary"
                sx={{ 
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#e53e3e',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#e53e3e',
                  }
                }}
              />
            }
            label="Dark Mode"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Change Password</Typography>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Notifications</Typography>
          <FormControlLabel
            control={<Switch defaultChecked color="primary" />}
            label="Email Notifications"
          />
          <FormControlLabel
            control={<Switch color="primary" />}
            label="SMS Notifications"
          />
        </Box>

        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading}
          sx={{ 
            backgroundColor: '#e53e3e',
            '&:hover': {
              backgroundColor: '#c53030',
            },
          }}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </div>
  );
};

export default AdminSettings;