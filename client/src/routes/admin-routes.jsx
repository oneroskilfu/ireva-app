// client/src/routes/admin-routes.jsx
import React from 'react';
import { Route, Redirect } from 'wouter';
import AdminAnalyticsOverviewJS from '../components/admin/AdminAnalyticsOverviewJS';
import EnhancedAdminDashboard from '../pages/admin/EnhancedAdminDashboard';

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin" component={() => <Redirect to="/admin/overview" />} />
      <Route path="/admin/dashboard" component={EnhancedAdminDashboard} />
      <Route path="/admin/overview" component={AdminAnalyticsOverviewJS} />
      {/* Add more admin routes below */}
    </>
  );
}