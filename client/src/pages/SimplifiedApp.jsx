import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import AdminDashboard from './AdminDashboard';
import InvestorView from './InvestorView';

const SimplifiedApp = () => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Parse the token to get user info
      try {
        // Verify if the token is expired
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= expiryTime) {
          // Token is expired
          console.log('Token expired');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(tokenData);
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Determine which component to render based on user role
  if (!user) {
    return (
      <div className="auth-container">
        {isLogin ? (
          <div>
            <Login setUser={setUser} />
            <p className="toggle-auth">
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsLogin(false)}>
                Register
              </button>
            </p>
          </div>
        ) : (
          <div>
            <Register setUser={setUser} />
            <p className="toggle-auth">
              Already have an account?{' '}
              <button type="button" onClick={() => setIsLogin(true)}>
                Login
              </button>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <InvestorView />;
};

export default SimplifiedApp;