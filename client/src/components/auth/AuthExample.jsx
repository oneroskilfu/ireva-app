import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuthExample = () => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    }
  }, []);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', loginData);
      
      // Save token and user data
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setToken(token);
      setUser(user);
      
      // Fetch projects with the new token
      fetchProjects(token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken('');
    setUser(null);
    setProjects([]);
  };

  const fetchUserData = async (authToken) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUser(response.data);
      fetchProjects(authToken);
    } catch (err) {
      setError('Session expired. Please login again.');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (authToken) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/projects', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-example">
      <h2>Authentication Example</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {!user ? (
        <div className="login-form">
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username or Email:</label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <div className="user-profile">
          <h3>Welcome, {user.name || user.username}</h3>
          <p>Role: {user.role}</p>
          <p>Email: {user.email}</p>
          <p>KYC Status: {user.kycStatus || (user.kycVerified ? 'Verified' : 'Not Verified')}</p>
          
          <button onClick={handleLogout}>Logout</button>
          
          <div className="projects-section">
            <h3>Projects</h3>
            {loading ? (
              <p>Loading projects...</p>
            ) : projects.length > 0 ? (
              <ul>
                {projects.map(project => (
                  <li key={project.id || project._id}>
                    <strong>{project.name}</strong>
                    <p>{project.description}</p>
                    <p>Location: {project.location}</p>
                    <p>Funding: ₦{project.currentFunding.toLocaleString()} / ₦{project.totalFunding.toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No projects found</p>
            )}
          </div>
        </div>
      )}
      
      <div className="token-display">
        <h4>JWT Token:</h4>
        <textarea
          readOnly
          value={token || 'No token available'}
          rows={4}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default AuthExample;