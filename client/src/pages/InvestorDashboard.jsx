import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [investments, setInvestments] = useState([
    {
      id: 1,
      name: 'CityView Park',
      location: 'Lekki, Lagos',
      amount: 1200000,
      roi: 12,
      fundingProgress: 65
    },
    {
      id: 2,
      name: 'OceanBay Estate',
      location: 'Victoria Island, Lagos',
      amount: 850000,
      roi: 15,
      fundingProgress: 78
    },
    {
      id: 3,
      name: 'Golden Terraces',
      location: 'Abuja',
      amount: 750000,
      roi: 13,
      fundingProgress: 42
    }
  ]);
  
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = JSON.parse(atob(token.split('.')[1]));
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      handleLogout();
    }
    
    // In a real application, we would fetch real investment data
    // API.get('/investments').then(res => setInvestments(res.data)).catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0);
  const averageROI = investments.length 
    ? investments.reduce((sum, investment) => sum + investment.roi, 0) / investments.length 
    : 0;
  const monthlyReturns = totalInvested * (averageROI / 100) / 12;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>REVA Investor Dashboard</h1>
        <div className="user-welcome">
          <span>Welcome, {userData.username || 'Investor'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="statistics">
        <div className="stat-box">
          <h3>Properties Invested</h3>
          <p className="stat-value">{investments.length}</p>
        </div>
        <div className="stat-box">
          <h3>Total Investment</h3>
          <p className="stat-value">₦{totalInvested.toLocaleString()}</p>
        </div>
        <div className="stat-box">
          <h3>Monthly Returns</h3>
          <p className="stat-value">₦{Math.round(monthlyReturns).toLocaleString()}</p>
        </div>
        <div className="stat-box">
          <h3>Average ROI</h3>
          <p className="stat-value">{averageROI.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="properties-container">
        <h2>Your Investments</h2>
        <div className="properties-grid">
          {investments.map(investment => (
            <div className="property-card" key={investment.id}>
              <h3>{investment.name}</h3>
              <p>Location: {investment.location}</p>
              <p>Invested: ₦{investment.amount.toLocaleString()}</p>
              <p>Monthly Returns: ₦{Math.round(investment.amount * (investment.roi / 100) / 12).toLocaleString()}</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${investment.fundingProgress}%` }}></div>
              </div>
              <p>{investment.fundingProgress}% Funded</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="dashboard-actions">
        <button className="action-btn primary">Explore Properties</button>
        <button className="action-btn secondary">View ROI History</button>
        <button className="action-btn secondary">Manage Portfolio</button>
      </div>
    </div>
  );
};

export default InvestorDashboard;