import React from 'react';
import { Switch, Route } from 'wouter';
import { AuthProvider } from './hooks/use-auth';
import RequireRole from './components/auth/RequireRole';
import UnauthorizedPage from './pages/UnauthorizedPage';
import './App.css';

// Placeholder components for demonstration
const HomePage = () => <div>Home Page (Public)</div>;
const LoginPage = () => <div>Login Page</div>;
const AdminDashboard = () => <div>Admin Dashboard (Admin Only)</div>;
const InvestorDashboard = () => <div>Investor Dashboard (Investor Only)</div>;
const SettingsPage = () => <div>Settings Page (Authentication Required)</div>;

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <h1>iREVA Platform</h1>
        </header>
        
        <main>
          <Switch>
            {/* Public routes */}
            <Route path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/unauthorized" component={UnauthorizedPage} />
            
            {/* Admin-only route */}
            <Route path="/admin">
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            </Route>
            
            {/* Investor-only route */}
            <Route path="/investor">
              <RequireRole role="investor">
                <InvestorDashboard />
              </RequireRole>
            </Route>
            
            {/* 404 route */}
            <Route>
              <div>Page Not Found</div>
            </Route>
          </Switch>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;