import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { Loader2 } from 'lucide-react';

// Lazy-loaded admin components
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminActivityLogs = lazy(() => import('@/pages/admin/AdminActivityLogs'));
const KYCManagement = lazy(() => import('@/pages/admin/KYCManagement'));
const PropertyManagement = lazy(() => import('@/pages/admin/PropertyManagement'));
const ROIDistribution = lazy(() => import('@/pages/admin/ROIDistribution'));
const ROIManagement = lazy(() => import('@/pages/admin/ROIManagement'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));

// Loading component for suspense fallback
const AdminPageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium">Loading admin section...</p>
    </div>
  </div>
);

const AdminRoutes: React.FC = () => {
  return (
    <Suspense fallback={<AdminPageLoader />}>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/activity-logs" component={AdminActivityLogs} />
        <Route path="/admin/kyc" component={KYCManagement} />
        <Route path="/admin/properties" component={PropertyManagement} />
        <Route path="/admin/roi" component={ROIDistribution} />
        <Route path="/admin/roi-management" component={ROIManagement} />
        <Route path="/admin/users" component={UserManagement} />
        {/* Add additional admin routes here */}
      </Switch>
    </Suspense>
  );
};

export default AdminRoutes;