import React, { lazy, Suspense } from "react";
import { Switch, Route, Router } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "@/contexts/unified-auth-context";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from './theme';
import { HelmetProvider } from 'react-helmet-async';
// @ts-ignore: Import JSX file without type definitions
import LegalUpdateModal from "@/components/legal/LegalUpdateModal";
import PWAInstallToast from "@/components/PWAInstallToast";

// Lazy load page components
const HomePage = lazy(() => import("@/pages/home-page"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));

// Simple Router component
function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Separate component to access auth context - this ensures hooks are used properly
function AppContent({ isDevelopment }: { isDevelopment: boolean }) {
  // useAuth is now safely called within a component that's wrapped by AuthProvider
  const { user } = useAuth();
  
  return (
    <>
      <AppRouter />
      <Toaster />
      <PWAInstallToast />
      {user && <LegalUpdateModal />}
      
      {/* Add any debugging components for development */}
      {isDevelopment && (
        <div style={{ position: 'fixed', bottom: 10, right: 10, padding: 10, 
                     background: 'rgba(0,0,0,0.8)', color: 'white', borderRadius: 5,
                     fontSize: 12, zIndex: 9999 }}>
          <p>Dev Mode: {process.env.NODE_ENV}</p>
          <p>User: {user ? `${user.username} (${user.role})` : 'Not logged in'}</p>
        </div>
      )}
    </>
  );
}

// Main App component with proper provider nesting
export default function App() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <HelmetProvider>
      <Router base="">
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
              <AuthProvider>
                <Suspense fallback={<LoadingSpinner />}>
                  <AppContent isDevelopment={isDevelopment} />
                </Suspense>
              </AuthProvider>
            </ErrorBoundary>
          </QueryClientProvider>
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  );
}

// Error Boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("Error caught by boundary:", error, errorInfo);
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          maxWidth: '800px', 
          margin: '0 auto', 
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#fff1f0',
          border: '1px solid #ff4d4f',
          borderRadius: '8px'
        }}>
          <h1 style={{ color: '#cf1322' }}>Something went wrong</h1>
          <p>We've encountered an error rendering the application.</p>
          <details style={{ marginBottom: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error details
            </summary>
            <pre style={{ 
              overflow: 'auto', 
              background: '#f5f5f5', 
              padding: '1rem',
              borderRadius: '4px'
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Simple loading spinner
function LoadingSpinner() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          margin: '20px auto',
          border: '4px solid rgba(0,0,0,0.1)',
          borderRadius: '50%',
          borderTop: '4px solid #1890ff',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
        <p style={{ fontFamily: 'Arial', color: '#333' }}>Loading iREVA...</p>
      </div>
    </div>
  );
}