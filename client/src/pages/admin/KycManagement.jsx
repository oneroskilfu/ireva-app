// client/src/pages/admin/KycManagement.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs,
  Link,
  Grid,
  Paper
} from '@mui/material';
import KycManagementTable from '../../components/admin/KycManagementTable';
import AdminLayout from '../../components/admin/AdminLayout';

export default function KycManagement() {
  return (
    <AdminLayout title="KYC Verification Management">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/admin/dashboard">
          Admin Dashboard
        </Link>
        <Typography color="text.primary">KYC Management</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        KYC Verification Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Review and manage customer KYC verification requests. Approve or reject based on the provided documentation.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification Guidelines
            </Typography>
            <Typography variant="body2">
              • Ensure all ID documents are clear and legible<br />
              • Verify that the name matches across all documents<br />
              • Confirm that proof of address is recent (within last 3 months)<br />
              • Check for signs of document tampering<br />
              • For high-value investors, additional verification may be required
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <KycManagementTable />
        </Grid>
      </Grid>
    </AdminLayout>
  );
}