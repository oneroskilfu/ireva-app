import React from 'react';
import ProjectListAdmin from '@/components/ProjectListAdmin';
import AdminLayout from '@/components/layouts/AdminLayout';

const AdminProjectsPage = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <ProjectListAdmin />
      </div>
    </AdminLayout>
  );
};

export default AdminProjectsPage;