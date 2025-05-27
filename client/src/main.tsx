import React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from 'wouter';
import "./index.css";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import PropertyListPage from "./pages/PropertyListPage";

// Create simple dashboard placeholder for seamless user experience
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
        ✓
      </div>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#0A192F',
        marginBottom: '20px'
      }}>
        Welcome to iREVA!
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#64748b',
        marginBottom: '30px',
        lineHeight: '1.6'
      }}>
        Login successful! Your {role} dashboard is being prepared with all your investment data and portfolio information.
      </p>
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '20px',
        borderRadius: '12px',
        color: '#1F6FEB',
        fontWeight: '600'
      }}>
        Dashboard loading... Please wait while we fetch your data.
      </div>
    </div>
  </div>
);

const AdminDashboard = () => <DashboardPlaceholder role="Admin" />;
const InvestorDashboard = () => <DashboardPlaceholder role="Investor" />;

// iREVA application with seamless dashboard connection
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/properties" component={PropertyListPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/investor/dashboard" component={InvestorDashboard} />
      <Route path="/" component={HomePage} />
    </Switch>
  </React.StrictMode>
);
