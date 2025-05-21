import React from 'react';
import { Route, Switch } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import InvestorLayout from './components/layouts/InvestorLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Auth Pages
import AuthPage from './pages/auth/AuthPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Investor Pages
import InvestorDashboard from './pages/investor/Dashboard';
import WalletPage from './pages/investor/WalletPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import InvestorReportDashboard from './pages/insights/reports/InvestorReportDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Error Pages
import NotFound from './pages/NotFound';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          {/* Auth Routes */}
          <Route path="/auth" component={AuthPage} />
          
          {/* Investor Routes */}
          <ProtectedRoute 
            path="/investor/dashboard" 
            component={() => (
              <InvestorLayout>
                <InvestorDashboard />
              </InvestorLayout>
            )} 
          />
          
          <ProtectedRoute 
            path="/investor/wallet" 
            component={() => (
              <InvestorLayout>
                <WalletPage />
              </InvestorLayout>
            )} 
          />
          
          {/* New Notification Route */}
          <ProtectedRoute 
            path="/investor/notifications" 
            component={() => (
              <InvestorLayout>
                <NotificationsPage />
              </InvestorLayout>
            )} 
          />
          
          {/* New Investment Reports Route */}
          <ProtectedRoute 
            path="/investor/insights/reports" 
            component={() => (
              <InvestorLayout>
                <InvestorReportDashboard />
              </InvestorLayout>
            )} 
          />
          
          {/* Admin Routes */}
          <ProtectedRoute 
            path="/admin/dashboard" 
            component={() => (
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            )} 
            requiredRole="admin"
          />
          
          {/* Redirect root to dashboard */}
          <Route path="/">
            {() => {
              window.location.href = '/investor/dashboard';
              return null;
            }}
          </Route>
          
          {/* 404 - Not Found */}
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;