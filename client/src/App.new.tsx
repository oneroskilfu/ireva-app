import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';

// Auth Pages
import AuthPage from './pages/auth/AuthPage';

// Investor Pages
import InvestorDashboard from './pages/investor/Dashboard';
import InvestmentDetails from './pages/investor/InvestmentDetails';
import InvestorAnalytics from './pages/investor/Analytics';
import KYCPage from './pages/investor/KYCPage';
import PropertyListingPage from './pages/investor/PropertyListingPage';
import PropertyDetailsPage from './pages/investor/PropertyDetailsPage';
import UserProfilePage from './pages/investor/UserProfilePage';
import PaymentPage from './pages/investor/PaymentPage';

// Admin Pages
import AdminDashboard from './pages/admin/DashboardPage';
import KYCManagementPage from './pages/admin/KYCManagementPage';
import PropertyManagementPage from './pages/admin/PropertyManagementPage';
import InvestorManagementPage from './pages/admin/InvestorManagementPage';
import InvestmentManagementPage from './pages/admin/InvestmentManagementPage';

// Shared Pages
import NotFoundPage from './pages/shared/NotFoundPage';
import LandingPage from './pages/shared/LandingPage';

// Middleware
import { ProtectedRoute } from './middleware/AuthMiddleware';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          autoClose={5000} 
          hideProgressBar={false} 
          closeOnClick
          pauseOnHover
        />
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={LandingPage} />
          <Route path="/auth" component={AuthPage} />
          
          {/* Investor Routes */}
          <ProtectedRoute 
            path="/investor/dashboard" 
            component={InvestorDashboard} 
            roles={['user', 'admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/investor/investments/:id" 
            component={InvestmentDetails} 
            roles={['user', 'admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/investor/analytics" 
            component={InvestorAnalytics} 
            roles={['user', 'admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/investor/kyc" 
            component={KYCPage} 
            roles={['user', 'admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/investor/properties" 
            component={PropertyListingPage} 
            roles={['user', 'admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/investor/properties/:id" 
            component={PropertyDetailsPage} 
            roles={['user', 'admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/investor/profile" 
            component={UserProfilePage} 
            roles={['user', 'admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/investor/payment" 
            component={PaymentPage} 
            roles={['user', 'admin', 'super_admin']} 
          />
          
          {/* Admin Routes */}
          <ProtectedRoute 
            path="/admin/dashboard" 
            component={AdminDashboard} 
            roles={['admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/admin/kyc" 
            component={KYCManagementPage} 
            roles={['admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/admin/properties" 
            component={PropertyManagementPage} 
            roles={['admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/admin/investors" 
            component={InvestorManagementPage} 
            roles={['admin', 'super_admin']} 
          />
          <ProtectedRoute 
            path="/admin/investments" 
            component={InvestmentManagementPage} 
            roles={['admin', 'super_admin']} 
          />
          
          {/* Catch-all Route */}
          <Route component={NotFoundPage} />
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;