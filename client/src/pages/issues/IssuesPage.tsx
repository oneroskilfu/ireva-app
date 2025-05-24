import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Helmet } from 'react-helmet-async';
import IssueList from '@/components/issues/IssueList';
import AdminIssuesDashboard from '@/components/issues/AdminIssuesDashboard';

const IssuesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  return (
    <>
      <Helmet>
        <title>{isAdmin ? 'Issue Management | iREVA' : 'My Issues | iREVA'}</title>
      </Helmet>
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminIssuesDashboard />
        ) : (
          <IssueList />
        )}
      </div>
    </>
  );
};

export default IssuesPage;