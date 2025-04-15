import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, propertyService, investmentService } from '../services/api';
import MessagePanel from '../components/MessagePanel';
import ProjectTable from '../components/ProjectTable';
import InvestmentChart from '../components/InvestmentChart';
import SearchFilter from '../components/SearchFilter';

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
      status: 'Active',
      fundingProgress: 65
    },
    {
      id: 2,
      name: 'OceanBay Estate',
      location: 'Victoria Island, Lagos',
      amount: 850000,
      roi: 15,
      status: 'Active',
      fundingProgress: 78
    },
    {
      id: 3,
      name: 'Golden Terraces',
      location: 'Abuja',
      amount: 750000,
      roi: 13,
      status: 'Pending',
      fundingProgress: 42
    }
  ]);

  const [messages, setMessages] = useState([
    { sender: 'Admin', text: 'Welcome to REVA Investments' },
    { sender: 'System', text: 'Your KYC verification is complete' },
    { sender: 'Support', text: 'New investment opportunity available' }
  ]);
  
  // State for loading indicators and errors
  const [loading, setLoading] = useState({
    user: false,
    investments: false,
    properties: false
  });
  const [error, setError] = useState(null);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);

  useEffect(() => {
    // Set initial loading states
    setLoading(prev => ({ ...prev, user: true, investments: true }));
    
    // Fetch user profile
    authService.getProfile()
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch user profile:', error);
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, user: false }));
      });
    
    // Fetch user investments
    investmentService.getUserInvestments()
      .then(response => {
        const investmentsData = response.data;
        setInvestments(investmentsData);
        setFilteredInvestments(investmentsData);
      })
      .catch(error => {
        console.error('Failed to fetch investments:', error);
        setError('Failed to load investments. Please try again later.');
        // Keep the mock data in case of error for demo purposes
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, investments: false }));
      });
      
    // Fetch featured properties
    setLoading(prev => ({ ...prev, properties: true }));
    propertyService.getFeaturedProperties()
      .then(response => {
        setFeaturedProperties(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch featured properties:', error);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, properties: false }));
      });
  }, []);
  
  // Handle filtered investments when using the search filter
  const handleFilterInvestments = (filtered) => {
    setFilteredInvestments(filtered);
  };

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

      <div className="dashboard-row">
        <div className="dashboard-column main-column">
          <div className="chart-section">
            <InvestmentChart />
          </div>
          
          <div className="projects-section">
            <h2>Your Investments</h2>
            <ProjectTable projects={investments} />
          </div>
        </div>
        
        <div className="dashboard-column side-column">
          <div className="messages-section">
            <MessagePanel messages={messages} />
          </div>
        </div>
      </div>
      
      <div className="properties-container">
        <h2>Featured Properties</h2>
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