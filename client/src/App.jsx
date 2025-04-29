import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { AuthProvider } from './hooks/use-auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';

// Pages
import HomePage from './pages/HomePage.jsx';
import AuthPage from './pages/auth-page';
import DashboardPage from './pages/investor/DashboardPage';
import VerificationPage from './pages/verification-page';
import KYCPage from './pages/investor/KYCPage';
import { ProtectedRoute } from './lib/protected-route';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={HomePage} />
            <Route path="/auth" component={AuthPage} />
            
            {/* Protected Routes */}
            <ProtectedRoute path="/investor/dashboard" component={DashboardPage} />
            <ProtectedRoute path="/verification" component={VerificationPage} />
            <ProtectedRoute path="/kyc" component={KYCPage} />
            
            {/* Redirect to home if no route matches */}
            <Route>
              <HomePage />
            </Route>
          </Switch>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;