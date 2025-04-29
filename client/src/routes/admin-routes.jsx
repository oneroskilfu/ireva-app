// client/src/routes/admin-routes.jsx
import React from 'react';
import { Route, Redirect } from 'wouter';
import AdminAnalyticsOverviewJS from '../components/admin/AdminAnalyticsOverviewJS';
import EnhancedAdminDashboard from '../pages/admin/EnhancedAdminDashboard';
import KycManagement from '../pages/admin/KycManagement';
import KycDetail from '../pages/admin/KycDetail';
import InvestmentManagement from '../pages/admin/InvestmentManagement';
import WalletManagement from '../pages/admin/WalletManagement';

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin" component={() => <Redirect to="/admin/overview" />} />
      <Route path="/admin/dashboard" component={EnhancedAdminDashboard} />
      <Route path="/admin/overview" component={AdminAnalyticsOverviewJS} />
      <Route path="/admin/kyc" component={KycManagement} />
      <Route path="/admin/kyc/:id" component={KycDetail} />
      <Route path="/admin/investments" component={InvestmentManagement} />
      <Route path="/admin/wallet" component={WalletManagement} />
      {/* Add more admin routes below */}
    </>
  );
}