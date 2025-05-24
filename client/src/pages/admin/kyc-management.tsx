import React from 'react';
import KYCApproval from '@/components/admin/KYCApproval';
import AdminLayout from '@/components/layouts/AdminLayout';

const KYCManagementPage = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">KYC Management</h1>
        <KYCApproval />
      </div>
    </AdminLayout>
  );
};

export default KYCManagementPage;