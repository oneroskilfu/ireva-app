import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

const TestAuth: React.FC = () => {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [storedUser, setStoredUser] = useState<any>(null);
  const [directLoginOutput, setDirectLoginOutput] = useState<string>('');

  useEffect(() => {
    // Check localStorage on mount
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setStoredUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      
      const data = await res.json();
      setResponse(data);
      
      if (res.ok) {
        // Convert isAdmin to role for consistency
        const userWithRole = {
          ...data,
          role: data.isAdmin ? 'admin' : 'investor'
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userWithRole));
        localStorage.setItem('token', 'session-auth-token');
        
        // Update the stored user state
        setStoredUser(userWithRole);
      } else {
        setError(`Error: ${res.status} - ${data?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async () => {
    setDirectLoginOutput('Testing direct login...');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      
      const data = await res.json();
      setDirectLoginOutput(JSON.stringify({
        status: res.status,
        statusText: res.statusText,
        cookies: document.cookie,
        data
      }, null, 2));
    } catch (err) {
      setDirectLoginOutput(`Error: ${err}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setStoredUser(null);
    setResponse(null);
  };

  const boxStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Authentication Test Page</h1>
      
      <div style={boxStyle}>
        <h2>Login Form</h2>
        <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                background: '#3182ce',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
            <button 
              type="button"
              onClick={handleDirectLogin}
              style={{
                background: '#38a169',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                marginLeft: '10px',
                cursor: 'pointer',
              }}
            >
              Test Direct API
            </button>
          </div>
        </form>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold' }}>
            {error}
          </div>
        )}
        
        {response && (
          <div>
            <h3>Response:</h3>
            <pre style={{ backgroundColor: '#eee', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {directLoginOutput && (
          <div>
            <h3>Direct API Test:</h3>
            <pre style={{ backgroundColor: '#eee', padding: '10px', overflow: 'auto' }}>
              {directLoginOutput}
            </pre>
          </div>
        )}
      </div>
      
      <div style={boxStyle}>
        <h2>LocalStorage User</h2>
        {storedUser ? (
          <div>
            <p><strong>Username:</strong> {storedUser.username}</p>
            <p><strong>Role:</strong> {storedUser.role || (storedUser.isAdmin ? 'admin' : 'user')}</p>
            <pre style={{ backgroundColor: '#eee', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(storedUser, null, 2)}
            </pre>
            <button 
              onClick={handleLogout}
              style={{
                background: '#e53e3e',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
            <button 
              onClick={() => setLocation(storedUser.isAdmin || storedUser.role === 'admin' ? '/admin' : '/dashboard')}
              style={{
                background: '#805ad5',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                marginLeft: '10px',
                cursor: 'pointer',
              }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <p>No user data in localStorage</p>
        )}
      </div>
      
      <div style={boxStyle}>
        <h2>Debug Info</h2>
        <p><strong>Current URL:</strong> {window.location.href}</p>
        <p><strong>Current cookies:</strong> {document.cookie || 'No cookies'}</p>
      </div>
    </div>
  );
};

export default TestAuth;