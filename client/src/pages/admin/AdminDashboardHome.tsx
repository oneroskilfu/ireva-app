import React from 'react';
import { Box } from '@mui/material';
import AdminDashboardLayout from '@/components/layouts/AdminDashboardLayout';
import AdminAnalyticsOverview from '@/components/admin/AdminAnalyticsOverview';
import KycUserTable from '@/components/admin/KycUserTable';
import ProjectManagementPanel from '@/components/admin/ProjectManagementPanel';
import AdminWalletPanel from '@/components/admin/AdminWalletPanel';
import AdminNotifications from '@/components/admin/AdminNotifications';

const AdminDashboardHome: React.FC = () => {
  return (
    <AdminDashboardLayout>
      <Box sx={{ p: 0 }}>
        <AdminAnalyticsOverview />
        <KycUserTable />
        <ProjectManagementPanel />
        <AdminWalletPanel />
        <AdminNotifications />
      </Box>
    </AdminDashboardLayout>
  );
};

export default AdminDashboardHome;