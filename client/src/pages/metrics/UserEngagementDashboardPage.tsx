import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import UserEngagementDashboard from '@/components/metrics/UserEngagementDashboard';

const UserEngagementDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // Redirect to homepage if not admin
  React.useEffect(() => {
    if (user && !isAdmin) {
      setLocation('/');
    }
  }, [user, isAdmin, setLocation]);
  
  if (!isAdmin) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <>
      <Helmet>
        <title>User Engagement Metrics | iREVA</title>
      </Helmet>
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <UserEngagementDashboard />
      </div>
    </>
  );
};

export default UserEngagementDashboardPage;