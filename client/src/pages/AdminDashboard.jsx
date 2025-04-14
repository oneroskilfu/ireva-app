import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch admin dashboard data
        const [usersData, propertiesData, investmentsData] = await Promise.all([
          api.getUsers(),
          api.getProperties(),
          api.getInvestments()
        ]);
        
        setUsers(usersData);
        setProperties(propertiesData);
        setInvestments(investmentsData);
        
        // Extract KYC requests from users data
        const pendingKycRequests = usersData.filter(user => user.kycStatus === 'pending');
        setKycRequests(pendingKycRequests);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin dashboard. Please try again later.');
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

  // Calculate key metrics
  const totalUsers = users.length;
  const totalInvestors = users.filter(user => user.isInvestor).length;
  const totalProperties = properties.length;
  const totalInvestments = investments.length;
  const totalInvestmentAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);

  const approveKyc = async (userId) => {
    try {
      await api.updateKycStatus(userId, 'approve');
      
      // Update KYC requests list
      setKycRequests(kycRequests.filter(req => req.id !== userId));
      
      // Update the user in the users list
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, kycStatus: 'verified' } 
          : user
      ));
    } catch (err) {
      console.error('Error approving KYC:', err);
      alert('Failed to approve KYC request');
    }
  };

  const rejectKyc = async (userId) => {
    try {
      await api.updateKycStatus(userId, 'reject');
      
      // Update KYC requests list
      setKycRequests(kycRequests.filter(req => req.id !== userId));
      
      // Update the user in the users list
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, kycStatus: 'rejected' } 
          : user
      ));
    } catch (err) {
      console.error('Error rejecting KYC:', err);
      alert('Failed to reject KYC request');
    }
  };
  
  // Update user role
  const updateUserRole = async (userId, role) => {
    try {
      await api.updateUserRole(userId, role);
      
      // Update user in the users list
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role } 
          : user
      ));
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role');
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <h1>REVA Admin Dashboard</h1>
        <div className="admin-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="admin-nav">
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
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
          Investments
        </button>
        <button 
          className={`nav-item ${activeTab === 'kyc' ? 'active' : ''}`}
          onClick={() => setActiveTab('kyc')}
        >
          KYC Requests
        </button>
      </nav>
      
      {/* Main Content */}
      <main className="admin-main">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h2>Dashboard Overview</h2>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Total Users</h3>
                <p className="metric-value">{totalUsers}</p>
              </div>
              <div className="metric-card">
                <h3>Investors</h3>
                <p className="metric-value">{totalInvestors}</p>
              </div>
              <div className="metric-card">
                <h3>Properties</h3>
                <p className="metric-value">{totalProperties}</p>
              </div>
              <div className="metric-card">
                <h3>Total Investments</h3>
                <p className="metric-value">{totalInvestments}</p>
              </div>
              <div className="metric-card">
                <h3>Investment Volume</h3>
                <p className="metric-value">{formatCurrency(totalInvestmentAmount)}</p>
              </div>
              <div className="metric-card">
                <h3>Pending KYC</h3>
                <p className="metric-value">{kycRequests.length}</p>
              </div>
            </div>
            
            <div className="recent-activities">
              <h3>Recent Activities</h3>
              {/* This would be populated with actual activity data */}
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-time">Today, 10:45 AM</span>
                  <span className="activity-description">New user registered</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">Today, 09:30 AM</span>
                  <span className="activity-description">New investment made in Lagos Heights property</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">Yesterday, 2:15 PM</span>
                  <span className="activity-description">KYC request approved for user ID #1042</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <h2>User Management</h2>
            
            <div className="table-controls">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="search-input"
              />
              <button className="add-button">Add New User</button>
            </div>
            
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>KYC Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <select 
                          value={user.role || 'investor'} 
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                        >
                          <option value="investor">Investor</option>
                          <option value="admin">Admin</option>
                          <option value="project_owner">Project Owner</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge status-${user.kycStatus || 'not_started'}`}>
                          {user.kycStatus || 'Not Started'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button className="action-button view">View</button>
                        <button className="action-button edit">Edit</button>
                        <button className="action-button delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="properties-tab">
            <h2>Property Management</h2>
            
            <div className="table-controls">
              <input 
                type="text" 
                placeholder="Search properties..." 
                className="search-input"
              />
              <button className="add-button">Add New Property</button>
            </div>
            
            <div className="properties-table-container">
              <table className="properties-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Target Return</th>
                    <th>Funding Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => {
                    const fundingProgress = Math.round(
                      (property.currentFunding / property.totalFunding) * 100
                    );
                    
                    return (
                      <tr key={property.id}>
                        <td>{property.id}</td>
                        <td>{property.name}</td>
                        <td>{property.location}</td>
                        <td>{property.type}</td>
                        <td>{property.targetReturn}%</td>
                        <td>
                          <div className="progress-bar-small">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${fundingProgress}%` }}
                            ></div>
                            <span className="progress-text">{fundingProgress}%</span>
                          </div>
                        </td>
                        <td className="actions-cell">
                          <button className="action-button view">View</button>
                          <button className="action-button edit">Edit</button>
                          <button className="action-button delete">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div className="investments-tab">
            <h2>Investment Management</h2>
            
            <div className="table-controls">
              <input 
                type="text" 
                placeholder="Search investments..." 
                className="search-input"
              />
              <select className="filter-dropdown">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="investments-table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Investor</th>
                    <th>Property</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(investment => (
                    <tr key={investment.id}>
                      <td>{investment.id}</td>
                      <td>{investment.userId}</td>
                      <td>{investment.propertyId}</td>
                      <td>{formatCurrency(investment.amount)}</td>
                      <td>
                        <span className={`status-badge status-${investment.status.toLowerCase()}`}>
                          {investment.status}
                        </span>
                      </td>
                      <td>{new Date(investment.date).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button className="action-button view">View</button>
                        <button className="action-button edit">Edit</button>
                        <button className="action-button delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* KYC Requests Tab */}
        {activeTab === 'kyc' && (
          <div className="kyc-tab">
            <h2>KYC Verification Requests</h2>
            
            {kycRequests.length > 0 ? (
              <div className="kyc-requests-container">
                {kycRequests.map(request => (
                  <div key={request.id} className="kyc-request-card">
                    <div className="kyc-user-info">
                      <h3>{request.username}</h3>
                      <p>Email: {request.email}</p>
                      <p>Phone: {request.phoneNumber}</p>
                      <p>ID Type: {request.kycIdType}</p>
                      <p>ID Number: {request.kycIdNumber}</p>
                      <p>Submitted: {new Date(request.kycVerificationDate || request.updatedAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="kyc-actions">
                      <button 
                        className="kyc-button approve"
                        onClick={() => approveKyc(request.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="kyc-button reject"
                        onClick={() => rejectKyc(request.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No pending KYC verification requests.</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="admin-footer">
        <p>&copy; 2023 REVA Admin Panel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;