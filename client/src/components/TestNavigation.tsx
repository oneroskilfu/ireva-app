import React from 'react';
import { Link, useLocation } from 'wouter';

const TestNavigation: React.FC = () => {
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [, navigate] = useLocation();
  
  // Listen for localStorage changes to update user state
  React.useEffect(() => {
    const checkUserData = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserInfo(user);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      } else {
        setUserInfo(null);
      }
    };
    
    // Check initially
    checkUserData();
    
    // Set up storage event listener
    window.addEventListener('storage', checkUserData);
    
    // Clean up
    return () => window.removeEventListener('storage', checkUserData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUserInfo(null);
    navigate('/');
  };

  // Simple style for navigation bar
  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ddd',
    marginBottom: '20px',
  };

  const linkStyle: React.CSSProperties = {
    margin: '0 10px',
    textDecoration: 'none',
    color: '#333',
  };

  return (
    <div style={navStyle}>
      <div>
        <Link href="/" style={linkStyle}>Home</Link>
        {userInfo ? (
          <>
            {userInfo.role === 'admin' || userInfo.isAdmin ? (
              <Link href="/admin" style={linkStyle}>Admin Dashboard</Link>
            ) : (
              <Link href="/dashboard" style={linkStyle}>User Dashboard</Link>
            )}
          </>
        ) : (
          <>
            <Link href="/login" style={linkStyle}>Login</Link>
            <Link href="/auth" style={linkStyle}>Register</Link>
          </>
        )}
        <Link href="/test-auth" style={linkStyle}>Test Auth</Link>
      </div>
      <div>
        {userInfo && (
          <>
            <span style={{ marginRight: '10px' }}>
              Hello, {userInfo.username} ({userInfo.role || (userInfo.isAdmin ? 'admin' : 'user')})
            </span>
            <button 
              onClick={handleLogout}
              style={{
                background: '#e53e3e',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TestNavigation;