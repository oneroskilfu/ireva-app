import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider, AuthErrorBoundary } from './contexts/unified-auth-context';
import { Toaster } from './components/ui/toaster';

// Components
import MainLayout from './components/layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyPage from './pages/PropertyPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import InvestmentsPage from './pages/InvestmentsPage';
import InvestmentPage from './pages/InvestmentPage';
import NotificationPage from './pages/NotificationPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminKYCPage from './pages/admin/AdminKYCPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import LegalPage from './pages/LegalPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// App Content Component (uses auth context safely)
const AppContent = () => {
  return (
    <MainLayout>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/properties" component={PropertiesPage} />
        <Route path="/property/:id" component={PropertyPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms-of-service" component={TermsOfServicePage} />
        <Route path="/legal" component={LegalPage} />
        
        {/* Protected Investor Routes */}
        <ProtectedRoute path="/dashboard" component={DashboardPage} roles={['investor', 'admin']} />
        <ProtectedRoute path="/profile" component={ProfilePage} roles={['investor', 'admin']} />
        <ProtectedRoute path="/wallet" component={WalletPage} roles={['investor', 'admin']} />
        <ProtectedRoute path="/investments" component={InvestmentsPage} roles={['investor', 'admin']} />
        <ProtectedRoute path="/investment/:id" component={InvestmentPage} roles={['investor', 'admin']} />
        <ProtectedRoute path="/notifications" component={NotificationPage} roles={['investor', 'admin']} />
        <ProtectedRoute path="/settings" component={SettingsPage} roles={['investor', 'admin']} />
        
        {/* Protected Admin Routes */}
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} roles={['admin']} />
        <ProtectedRoute path="/admin/users" component={AdminUsersPage} roles={['admin']} />
        <ProtectedRoute path="/admin/properties" component={AdminPropertiesPage} roles={['admin']} />
        <ProtectedRoute path="/admin/kyc" component={AdminKYCPage} roles={['admin']} />
        
        {/* Not Found */}
        <Route component={NotFoundPage} />
      </Switch>
    </MainLayout>
  );
};

// Main App Component with providers
function App() {
  return (
    <HelmetProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <AuthErrorBoundary>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </AuthErrorBoundary>
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;