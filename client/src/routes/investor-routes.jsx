// client/src/routes/investor-routes.jsx
import React from 'react';
import { Route } from 'wouter';
import SimpleDashboard from '../pages/investor/SimpleDashboard';

export default function InvestorRoutes() {
  return (
    <>
      <Route path="/investor/dashboard" component={SimpleDashboard} />
      {/* Add more investor routes below */}
    </>
  );
}