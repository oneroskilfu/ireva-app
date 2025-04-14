import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const data = await api.login(formData);
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Decode token to get user info
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      
      // Update parent component's user state
      setUser(payload);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h1>REVA Crowdfunding</h1>
          <h2>Welcome Back</h2>
          <p>Log in to your account to continue</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
      </div>
      
      <div className="login-info">
        <div className="info-content">
          <h2>Invest in Nigerian Real Estate</h2>
          <p>REVA allows you to invest in premium real estate properties with as little as ₦100,000</p>
          
          <ul className="feature-list">
            <li>Curated investment opportunities</li>
            <li>Transparent returns and fees</li>
            <li>Professional property management</li>
            <li>Track your investments in real time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;