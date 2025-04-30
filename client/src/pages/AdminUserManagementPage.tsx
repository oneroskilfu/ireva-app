import React from 'react';
import { UserManagement } from '../components/admin/UserManagement';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

const AdminUserManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<ChevronRight fontSize="small" />}>
          <Link color="inherit" href="/admin/dashboard">
            Admin Dashboard
          </Link>
          <Typography color="text.primary">User Management</Typography>
        </Breadcrumbs>
      </Box>
      
      <UserManagement />
    </Box>
  );
};

export default AdminUserManagementPage;