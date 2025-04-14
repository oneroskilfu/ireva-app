// Properly import React for JSX compatibility
import * as React from 'react';
import MuiLayout from '../components/layout/MuiLayout';
import Dashboard from '../components/Dashboard';

function MuiDashboardPage() {
  return (
    <MuiLayout>
      <Dashboard />
    </MuiLayout>
  );
}

export default MuiDashboardPage;