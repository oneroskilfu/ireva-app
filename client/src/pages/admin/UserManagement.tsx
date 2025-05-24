import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs,
  Link,
  Container
} from '@mui/material';
import UserManagementComponent from '../../components/admin/UserManagement';
import AdminLayout from '../../components/admin/AdminLayout.jsx';

const UserManagement = () => {
  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/admin/dashboard">
            Admin Dashboard
          </Link>
          <Typography color="text.primary">User Management</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, view details, control account status, and monitor wallet transactions.
          </Typography>
        </Box>

        <UserManagementComponent />
      </Container>
    </AdminLayout>
  );
};

export default UserManagement;