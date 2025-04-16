import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import KYCApproval from '@/components/admin/KYCApproval';

const AdminKYCPage: React.FC = () => {
  const { user } = useAuth();

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">KYC Management</h1>
      <p className="text-muted-foreground mb-8">
        Review and manage KYC submissions from investors on the platform.
      </p>
      
      <KYCApproval />
    </div>
  );
};

export default AdminKYCPage;