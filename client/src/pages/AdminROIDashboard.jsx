import React from 'react';
import ROIOverview from '@/components/admin/ROIOverview';
import ROIChart from '@/components/admin/ROIChart';
import ROITable from '@/components/admin/ROITable';
import { Container, Typography } from '@mui/material';

const AdminROIDashboard = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>
      ROI Distribution Dashboard
    </Typography>
    <ROIOverview />
    <ROIChart />
    <ROITable />
  </Container>
);

export default AdminROIDashboard;