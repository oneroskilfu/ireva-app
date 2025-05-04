import React from 'react';
import { Switch, Route } from 'wouter';
import { AuthProvider } from './hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from './components/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFound from './pages/not-found';
import AuthPage from './pages/AuthPage';
import Layout from './components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  DollarSign, 
  FileText
} from 'lucide-react';

// Import dashboard components
import AdminDashboardPage from './pages/admin/admin-dashboard';

// Placeholder components - these would be replaced by your actual components
const HomePage = () => (
  <div className="p-4">
    <h1 className="text-3xl font-bold mb-6">Welcome to iREVA Platform</h1>
    <p className="text-lg mb-4">Your gateway to real estate investments in Nigeria and beyond.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <div className="border rounded-lg p-6 bg-card">
        <Building className="h-10 w-10 text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Property Investments</h2>
        <p>Invest in vetted and profitable real estate properties.</p>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <DollarSign className="h-10 w-10 text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Secure Returns</h2>
        <p>Earn consistent ROI with our 5-year maturity investment model.</p>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <FileText className="h-10 w-10 text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Smart Contracts</h2>
        <p>Blockchain-based escrow services with automated milestone releases.</p>
      </div>
    </div>
  </div>
);

// The AdminDashboard component is now imported from './pages/admin/admin-dashboard'

const InvestorDashboard = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Investor Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-2">My Investments</h2>
        <p>View and manage your property investments.</p>
        <Button className="mt-4">View Investments</Button>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-2">Wallet</h2>
        <p>Manage your funds and transaction history.</p>
        <Button className="mt-4">Open Wallet</Button>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-2">Available Properties</h2>
        <p>Explore new investment opportunities.</p>
        <Button className="mt-4">Browse Properties</Button>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
    <div className="max-w-2xl border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input type="text" className="w-full p-2 border rounded" defaultValue="johndoe" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full p-2 border rounded" defaultValue="john@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input type="text" className="w-full p-2 border rounded" defaultValue="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input type="tel" className="w-full p-2 border rounded" defaultValue="+1234567890" />
        </div>
        <Button className="mt-2">Save Changes</Button>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/unauthorized" component={UnauthorizedPage} />
          
          {/* Protected routes using the new ProtectedRoute component */}
          <Route path="/admin" component={() => (
            <ProtectedRoute allowedRoles="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          )} />
          
          <Route path="/investor" component={() => (
            <ProtectedRoute allowedRoles="investor">
              <InvestorDashboard />
            </ProtectedRoute>
          )} />
          
          <Route path="/settings" component={() => (
            <ProtectedRoute allowedRoles={["admin", "investor"]}>
              <SettingsPage />
            </ProtectedRoute>
          )} />
          
          {/* 404 route - Fallback for unmatched routes */}
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </AuthProvider>
  );
}

export default App;