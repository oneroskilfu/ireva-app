import { useState } from 'react';
import { useLocation } from 'wouter';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast, toast } from '../components/ui/Toast';
import { apiClient } from '../lib/api';

export default function EnhancedLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toasts } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.login({ email, password });
      
      toast.success(`Welcome back, ${response.user.firstName || response.user.email}!`);
      
      // Role-based redirection with smooth transition
      setTimeout(() => {
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (response.user.role === 'investor') {
          navigate('/investor/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
      
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'investor') => {
    setIsLoading(true);
    
    try {
      // Demo credentials for testing
      const demoCredentials = {
        admin: { email: 'admin@ireva.ng', password: 'admin123' },
        investor: { email: 'investor@ireva.ng', password: 'investor123' }
      };
      
      const credentials = demoCredentials[role];
      setEmail(credentials.email);
      setPassword(credentials.password);
      
      const response = await apiClient.login(credentials);
      toast.success(`Demo login successful! Welcome, ${role}!`);
      
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin/dashboard' : '/investor/dashboard');
      }, 1000);
      
    } catch (err: any) {
      toast.error('Demo login failed. Please try manual login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A192F 0%, #1a365d 50%, #0A192F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Toast Notifications */}
      {toasts}
      
      {/* Main Login Container */}
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
            borderRadius: '16px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>i</span>
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#0A192F',
            marginBottom: '8px'
          }}>
            Welcome to iREVA
          </h1>
          
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            margin: 0
          }}>
            Sign in to your investment account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: isLoading ? '#f9fafb' : '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: isLoading ? '#f9fafb' : '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: isLoading 
                ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                : 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Login Buttons */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
            fontSize: '0.9rem',
            color: '#64748b'
          }}>
            Quick Demo Access
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleDemoLogin('investor')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f8fafc',
                color: '#1F6FEB',
                border: '2px solid #1F6FEB',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#1F6FEB';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#1F6FEB';
                }
              }}
            >
              Demo Investor
            </button>
            
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f8fafc',
                color: '#00B894',
                border: '2px solid #00B894',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#00B894';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#00B894';
                }
              }}
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          <span>Don't have an account? </span>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1F6FEB',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Create Account
          </button>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px' 
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}