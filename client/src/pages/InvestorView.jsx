import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Property Card Component
const PropertyCard = ({ property }) => {
  // Format currency in Naira
  const formatCurrency = (amount) => {
    return `₦${parseInt(amount).toLocaleString('en-NG')}`;
  };

  // Calculate funding progress percentage
  const progressPercent = Math.min(
    100, 
    Math.round((property.currentFunding / property.totalFunding) * 100)
  );

  return (
    <div className="property-card">
      <img 
        src={property.imageUrl || 'https://via.placeholder.com/300x200'} 
        alt={property.name} 
        className="property-image"
      />
      <div className="property-type-badge">{property.type}</div>
      
      <div className="property-content">
        <h3 className="property-title">{property.name}</h3>
        <p className="property-location">{property.location}</p>
        
        <div className="property-stats">
          <div className="stat">
            <span className="stat-label">Return</span>
            <span className="stat-value">{property.targetReturn}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Min Investment</span>
            <span className="stat-value">{formatCurrency(property.minimumInvestment)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Term</span>
            <span className="stat-value">{property.term} months</span>
          </div>
        </div>
        
        <div className="funding-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span>{formatCurrency(property.currentFunding)} raised</span>
            <span>{property.daysLeft} days left</span>
          </div>
        </div>
        
        <button className="invest-button">Invest Now</button>
      </div>
    </div>
  );
};

// InvestorView Component
const InvestorView = () => {
  const [properties, setProperties] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch available properties
        const propertiesData = await api.getProperties();
        setProperties(propertiesData);
        
        // Fetch user's investments
        const investmentsData = await api.getInvestments();
        setInvestments(investmentsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Format currency in Naira
  const formatCurrency = (amount) => {
    return `₦${parseInt(amount).toLocaleString('en-NG')}`;
  };

  // Calculate investment metrics
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = investments.reduce((sum, inv) => sum + (inv.earnings || 0), 0);
  const totalPortfolioValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="investor-view">
      {/* Header */}
      <header className="investor-header">
        <h1>REVA Crowdfunding</h1>
        <div className="user-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="investor-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-item ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button 
          className={`nav-item ${activeTab === 'investments' ? 'active' : ''}`}
          onClick={() => setActiveTab('investments')}
        >
          My Investments
        </button>
        <button 
          className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          Wallet
        </button>
      </nav>
      
      {/* Main Content */}
      <main className="investor-main">
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view">
            <h2>Dashboard</h2>
            
            <div className="portfolio-summary">
              <div className="summary-card">
                <h3>Total Invested</h3>
                <p className="summary-value">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="summary-card">
                <h3>Portfolio Value</h3>
                <p className="summary-value">{formatCurrency(totalPortfolioValue)}</p>
              </div>
              <div className="summary-card">
                <h3>Total Earnings</h3>
                <p className="summary-value">{formatCurrency(totalEarnings)}</p>
              </div>
            </div>
            
            <div className="dashboard-section">
              <h3>Recent Investments</h3>
              {investments.length > 0 ? (
                <div className="recent-investments">
                  {investments.slice(0, 3).map(investment => (
                    <div key={investment.id} className="investment-card">
                      <h4>{investment.property?.name || 'Property'}</h4>
                      <p className="investment-amount">{formatCurrency(investment.amount)}</p>
                      <p className="investment-date">Invested on: {new Date(investment.date).toLocaleDateString()}</p>
                      <div className="investment-status">{investment.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">You haven't made any investments yet.</p>
              )}
            </div>
            
            <div className="dashboard-section">
              <h3>Featured Properties</h3>
              <div className="featured-properties">
                {properties.slice(0, 3).map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Properties View */}
        {activeTab === 'properties' && (
          <div className="properties-view">
            <h2>Available Properties</h2>
            
            <div className="properties-grid">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}
        
        {/* Investments View */}
        {activeTab === 'investments' && (
          <div className="investments-view">
            <h2>My Investments</h2>
            
            {investments.length > 0 ? (
              <div className="investments-list">
                {investments.map(investment => (
                  <div key={investment.id} className="investment-detail-card">
                    <div className="investment-header">
                      <h3>{investment.property?.name || 'Property'}</h3>
                      <span className={`status-badge status-${investment.status.toLowerCase()}`}>
                        {investment.status}
                      </span>
                    </div>
                    
                    <div className="investment-details">
                      <div className="detail-item">
                        <span className="detail-label">Invested Amount</span>
                        <span className="detail-value">{formatCurrency(investment.amount)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Current Value</span>
                        <span className="detail-value">{formatCurrency(investment.currentValue || investment.amount)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Earnings</span>
                        <span className="detail-value">{formatCurrency(investment.earnings || 0)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Investment Date</span>
                        <span className="detail-value">{new Date(investment.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <button className="view-details-button">View Details</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't made any investments yet.</p>
                <button 
                  className="cta-button"
                  onClick={() => setActiveTab('properties')}
                >
                  Browse Properties
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Wallet View */}
        {activeTab === 'wallet' && (
          <div className="wallet-view">
            <h2>My Wallet</h2>
            
            <div className="wallet-balance-card">
              <h3>Wallet Balance</h3>
              <p className="wallet-balance">{formatCurrency(5000)}</p>
              <div className="wallet-actions">
                <button className="wallet-button fund">Fund Wallet</button>
                <button className="wallet-button withdraw">Withdraw</button>
              </div>
            </div>
            
            <div className="transaction-history">
              <h3>Transaction History</h3>
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2023-04-10</td>
                    <td>Wallet funding</td>
                    <td className="amount positive">+₦250,000</td>
                    <td className="status completed">Completed</td>
                  </tr>
                  <tr>
                    <td>2023-04-05</td>
                    <td>Investment in Lagos Heights</td>
                    <td className="amount negative">-₦150,000</td>
                    <td className="status completed">Completed</td>
                  </tr>
                  <tr>
                    <td>2023-03-22</td>
                    <td>Wallet funding</td>
                    <td className="amount positive">+₦100,000</td>
                    <td className="status completed">Completed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="investor-footer">
        <p>&copy; 2023 REVA Crowdfunding. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InvestorView;