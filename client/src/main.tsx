import React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from 'wouter';
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import EnhancedLoginPage from "./pages/EnhancedLoginPage";
import PropertyListPage from "./pages/PropertyListPage";

// Create secure dashboard placeholders with role-based protection
const DashboardPlaceholder = ({ role }: { role: string }) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '80px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif'
  }}>
    <div style={{
      background: '#fff',
      borderRadius: '20px',
      padding: '60px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: '600px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
        borderRadius: '50%',
        margin: '0 auto 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '2rem'
      }}>
        🎯
      </div>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#0A192F',
        marginBottom: '20px'
      }}>
        {role} Dashboard
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#64748b',
        marginBottom: '30px',
        lineHeight: '1.6'
      }}>
        Welcome to your secure {role.toLowerCase()} portal. Your dashboard is ready with real-time investment data and portfolio analytics.
      </p>
      <div style={{
        background: 'linear-gradient(135deg, #1F6FEB 10%, #00B894 90%)',
        padding: '20px',
        borderRadius: '12px',
        color: '#fff',
        fontWeight: '600'
      }}>
        🔒 Authenticated & Protected
      </div>
    </div>
  </div>
);

const AdminDashboard = () => <DashboardPlaceholder role="Admin" />;
const InvestorDashboard = () => <DashboardPlaceholder role="Investor" />;

// Secure iREVA application with authentication and role-based protection
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Switch>
        <Route path="/login" component={EnhancedLoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/properties" component={PropertyListPage} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard">
          <RequireAuth role="admin">
            <AdminDashboard />
          </RequireAuth>
        </Route>
        
        {/* Protected Investor Routes */}
        <Route path="/investor/dashboard">
          <RequireAuth role="investor">
            <InvestorDashboard />
          </RequireAuth>
        </Route>
        
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
      </Switch>
    </AuthProvider>
  </React.StrictMode>
);
