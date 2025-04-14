import React, { useState } from 'react';
import { useNavigate } from 'wouter';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [user, setUser] = useState(null);
  const [_, navigate] = useNavigate();

  // Redirect to dashboard if user is logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        
        <div className="auth-content">
          {activeTab === 'login' ? (
            <Login setUser={setUser} />
          ) : (
            <Register setUser={setUser} />
          )}
        </div>
      </div>
      
      <div className="auth-hero">
        <h1>REVA Crowdfunding</h1>
        <p>Invest in Nigerian real estate with as little as ₦100,000</p>
        <ul>
          <li>Browse curated real estate investment opportunities</li>
          <li>Invest in fractional real estate with low minimum investment</li>
          <li>Track your investments and returns in real-time</li>
          <li>Get started in minutes with our simple verification process</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthPage;