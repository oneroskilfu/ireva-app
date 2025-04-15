import React from 'react';
import { Box, Typography, Card, CardContent, Avatar } from '@mui/material';
import Navbar from '../components/Navbar';

const AdminProfile = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Box sx={{ maxWidth: 600, margin: 'auto', mt: 5, p: 2 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#e53e3e' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
              <Box>
                <Typography variant="h6">{user.name || 'Admin User'}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email || 'admin@example.com'}</Typography>
                <Typography variant="body2" sx={{ textTransform: 'uppercase', color: '#e53e3e', fontWeight: 'bold', mt: 0.5 }}>
                  Role: {user.role || 'Admin'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default AdminProfile;