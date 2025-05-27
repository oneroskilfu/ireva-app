import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';

const LoginPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock role-based redirection logic
      // In a real app, this would come from your authentication service
      const mockUser = {
        email,
        role: email.includes('admin') ? 'admin' : 'investor'
      };

      // Role-based redirection to actual dashboards
      if (mockUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (mockUser.role === 'investor') {
        navigate('/investor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%231F6FEB' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.4
      }} />

      <div style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f1f5f9',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: '400' }}>i</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  fontFamily: 'IBM Plex Mono, monospace', 
                  fontWeight: '400', 
                  fontSize: '1.4rem',
                  color: '#0A192F'
                }}>i</span>
                <span style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontWeight: '300', 
                  fontSize: '1.4rem',
                  color: '#0A192F',
                  letterSpacing: '0.5px'
                }}>REVA</span>
              </div>
            </div>
          </Link>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#0A192F',
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            Sign in to access your investment portfolio and continue building wealth through Nigerian real estate.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '0.9rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#0A192F',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                background: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#0A192F',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                background: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: '#64748b',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#1F6FEB'
                }}
              />
              Remember me
            </label>
            <a href="#forgot-password" style={{
              color: '#1F6FEB',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading 
                ? '#94a3b8' 
                : 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '24px'
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '16px'
          }}>
            Don't have an account?{' '}
            <Link href="/register" style={{
              color: '#1F6FEB',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Create one here
            </Link>
          </p>
          
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px',
            fontSize: '0.8rem',
            color: '#94a3b8'
          }}>
            By signing in, you agree to our{' '}
            <a href="#terms" style={{ color: '#1F6FEB', textDecoration: 'none' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#privacy" style={{ color: '#1F6FEB', textDecoration: 'none' }}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;