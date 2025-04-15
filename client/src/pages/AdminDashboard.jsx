import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 320,
    ongoingProjects: 12,
    roiPaid: 24000000,
    totalInvestments: 156000000
  });
  
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'user_register', user: 'john_doe', time: '2 hours ago' },
    { id: 2, type: 'investment', user: 'sarah_j', amount: 500000, property: 'Hilltop Residences', time: '4 hours ago' },
    { id: 3, type: 'roi_payment', amount: 1500000, time: '1 day ago' },
    { id: 4, type: 'property_added', property: 'Lakeside Apartments', time: '2 days ago' },
    { id: 5, type: 'kyc_verification', user: 'michael_t', status: 'pending', time: '2 days ago' }
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
    
    // In a real application, we would fetch real stats
    // API.get('/admin/stats').then(res => setStats(res.data)).catch(err => console.error(err));
    // API.get('/admin/activities').then(res => setRecentActivities(res.data)).catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Function to get appropriate activity description
  const getActivityDescription = (activity) => {
    switch(activity.type) {
      case 'user_register':
        return <span><strong>{activity.user}</strong> registered</span>;
      case 'investment':
        return <span><strong>{activity.user}</strong> invested ₦{activity.amount.toLocaleString()} in <strong>{activity.property}</strong></span>;
      case 'roi_payment':
        return <span>ROI payment of ₦{activity.amount.toLocaleString()} processed</span>;
      case 'property_added':
        return <span>New property added: <strong>{activity.property}</strong></span>;
      case 'kyc_verification':
        return <span>KYC verification for <strong>{activity.user}</strong> is {activity.status}</span>;
      default:
        return <span>Unknown activity</span>;
    }
  };

  return (
    <div className="dashboard admin-dashboard">
      <header className="dashboard-header">
        <h1>iREVA Admin Dashboard</h1>
        <div className="user-welcome">
          <span>Welcome, {userData.username || 'Admin'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="statistics">
        <div className="stat-box">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-box">
          <h3>Ongoing Projects</h3>
          <p className="stat-value">{stats.ongoingProjects}</p>
        </div>
        <div className="stat-box">
          <h3>Total ROI Paid</h3>
          <p className="stat-value">₦{(stats.roiPaid / 1000000).toFixed(1)}M</p>
        </div>
        <div className="stat-box">
          <h3>Total Investments</h3>
          <p className="stat-value">₦{(stats.totalInvestments / 1000000).toFixed(1)}M</p>
        </div>
      </div>
      
      <div className="admin-sections">
        <div className="admin-section">
          <h2>Recent Activities</h2>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div className="activity-item" key={activity.id}>
                {getActivityDescription(activity)}
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="admin-section">
          <h2>Admin Tools</h2>
          <div className="admin-tools">
            <button className="admin-tool-btn">
              <span className="tool-icon">👥</span>
              <span>Manage Users</span>
            </button>
            <button className="admin-tool-btn">
              <span className="tool-icon">🏢</span>
              <span>Manage Properties</span>
            </button>
            <button className="admin-tool-btn">
              <span className="tool-icon">📊</span>
              <span>View Analytics</span>
            </button>
            <button className="admin-tool-btn">
              <span className="tool-icon">💰</span>
              <span>ROI Payments</span>
            </button>
            <button className="admin-tool-btn">
              <span className="tool-icon">📝</span>
              <span>KYC Verifications</span>
            </button>
            <button className="admin-tool-btn">
              <span className="tool-icon">⚙️</span>
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;