import React from 'react';
import TenantManagementTable from '@/components/admin/TenantManagementTable';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect } from 'wouter';

const TenantManagementPage = () => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while authentication status is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth page if user is not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Redirect to home page if user is not an admin
  if (user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage and organize tenants on the iREVA platform
        </p>
      </div>

      <TenantManagementTable />
    </div>
  );
};

export default TenantManagementPage;