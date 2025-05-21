import React, { Suspense, lazy } from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { AppProvider, useApp } from './providers/AppProvider';
import { ErrorBoundaryWithMonitoring } from './components/ErrorBoundary';
import useAuth from './hooks/useAuth';

// Lazy-load pages for better performance
const HomePage = lazy(() => import('./pages/home-page'));
const AuthPage = lazy(() => import('./pages/auth-page'));
const NotFound = lazy(() => import('./pages/not-found'));
const AdminDashboard = lazy(() => import('./pages/admin/dashboard'));
const InvestorDashboard = lazy(() => import('./pages/investor/dashboard'));
const AuditTrail = lazy(() => import('./pages/admin/AuditTrail'));
const FinancialLedger = lazy(() => import('./pages/admin/FinancialLedger'));
const TransactionHistory = lazy(() => import('./pages/wallet/TransactionHistory'));
const InsightsDashboard = lazy(() => import('./pages/insights/InsightsDashboard'));

// Loading component for suspense fallback
function LoadingPage() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

// Protected route component that requires authentication
function ProtectedRoute({ path, component: Component, requiredRole }) {
  const { user, isLoading } = useAuth();
  
  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <Route path={path}>
        <LoadingPage />
      </Route>
    );
  }
  
  // If not authenticated, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // If role is required and user doesn't have it, redirect
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Route path={path}>
        <Redirect to="/unauthorized" />
      </Route>
    );
  }
  
  // User is authenticated and has the required role
  return <Component />;
}

// Main router component
function Router() {
  const { isReady } = useApp();
  
  // Show loading page until app is ready
  if (!isReady) {
    return <LoadingPage />;
  }
  
  return (
    <Suspense fallback={<LoadingPage />}>
      <Switch>
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        
        {/* Protected routes */}
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} requiredRole="admin" />
        <ProtectedRoute path="/admin/audit" component={AuditTrail} requiredRole="admin" />
        <ProtectedRoute path="/admin/financials" component={FinancialLedger} requiredRole="admin" />
        <ProtectedRoute path="/investor/dashboard" component={InvestorDashboard} requiredRole="investor" />
        <ProtectedRoute path="/wallet/transactions" component={TransactionHistory} />
        <ProtectedRoute path="/insights" component={InsightsDashboard} />
        
        {/* Fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// Main App component
export default function App() {
  return (
    <AppProvider>
      <ErrorBoundaryWithMonitoring componentName="Router">
        <Router />
      </ErrorBoundaryWithMonitoring>
    </AppProvider>
  );
}