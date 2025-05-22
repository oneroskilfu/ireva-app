import React from 'react';
import { Route, Switch } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import InvestorLayout from './components/layouts/InvestorLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Auth Pages
import AuthPage from './pages/auth/auth-page';
import { ProtectedRoute } from './components/ProtectedRoute';

// Homepage
import StandaloneIREVAHome from './pages/standalone-ireva-home';

// Investor Pages
import InvestorDashboard from './pages/investor/Dashboard';
import WalletPage from './pages/investor/WalletPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import InvestorReportDashboard from './pages/insights/reports/InvestorReportDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/dashboard';

// Error Pages
import NotFound from './pages/not-found';

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
          
          {/* Homepage Route */}
          <Route path="/" component={() => (
            <div style={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px' }}>
                Building Wealth Together: Real Estate, Reimagined
              </h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '30px', maxWidth: '800px' }}>
                Join 5,000+ investors transforming the real estate investment landscape through innovative technology and transparent processes.
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button 
                  onClick={() => window.location.href = '/auth'}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '15px 30px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Start Investing
                </button>
                <button 
                  onClick={() => window.location.href = '/auth'}
                  style={{
                    background: 'transparent',
                    color: 'white',
                    padding: '15px 30px',
                    border: '2px solid white',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Learn More
                </button>
              </div>
              <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', maxWidth: '1200px', width: '100%' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>🏢 Premium Properties</h3>
                  <p>Carefully vetted real estate opportunities with verified returns and transparent reporting.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>💎 Crypto-Enabled</h3>
                  <p>Seamless cryptocurrency integration for modern investment strategies.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>📊 AI Insights</h3>
                  <p>Advanced analytics and AI-powered market predictions to optimize your portfolio.</p>
                </div>
              </div>
            </div>
          )} />
          
          {/* 404 - Not Found */}
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;