import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface RequireAuthProps {
  children: ReactNode;
  role?: 'admin' | 'investor';
}

export default function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size="lg" />
          <p style={{ 
            marginTop: '16px',
            color: '#64748b',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // Check role-based access
  if (role && user.role !== role) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '50%',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '2rem'
          }}>
            🚫
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#dc2626',
            marginBottom: '16px'
          }}>
            Access Denied
          </h1>
          
          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            You don't have permission to access this area. This section requires {role} privileges.
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Go Home
            </button>
            
            <button
              onClick={() => window.history.back()}
              style={{
                padding: '12px 24px',
                background: '#f8fafc',
                color: '#64748b',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has correct role
  return <>{children}</>;
}