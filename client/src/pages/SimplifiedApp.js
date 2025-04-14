import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

// Placeholder Dashboard components
const AdminDashboard = () => (
  <div className="dashboard">
    <h1>Admin Dashboard</h1>
    <div className="dashboard-content">
      <div className="dashboard-card">
        <h2>Users</h2>
        <p>Manage platform users</p>
        <button>View Users</button>
      </div>
      <div className="dashboard-card">
        <h2>Projects</h2>
        <p>Manage investment properties</p>
        <button>View Projects</button>
      </div>
      <div className="dashboard-card">
        <h2>Investments</h2>
        <p>Track all investments</p>
        <button>View Investments</button>
      </div>
    </div>
    <button 
      className="logout-btn" 
      onClick={() => {
        localStorage.removeItem('token');
        window.location.reload();
      }}
    >
      Logout
    </button>
  </div>
);

const InvestorView = () => (
  <div className="dashboard">
    <h1>Investor Dashboard</h1>
    <div className="dashboard-content">
      <div className="dashboard-card">
        <h2>My Portfolio</h2>
        <p>Track your investments</p>
        <button>View Portfolio</button>
      </div>
      <div className="dashboard-card">
        <h2>Available Properties</h2>
        <p>Discover new investment opportunities</p>
        <button>Browse Properties</button>
      </div>
      <div className="dashboard-card">
        <h2>ROI Tracker</h2>
        <p>Monitor your returns</p>
        <button>View ROI</button>
      </div>
    </div>
    <button 
      className="logout-btn" 
      onClick={() => {
        localStorage.removeItem('token');
        window.location.reload();
      }}
    >
      Logout
    </button>
  </div>
);

const ProjectOwnerView = () => (
  <div className="dashboard">
    <h1>Project Owner Dashboard</h1>
    <div className="dashboard-content">
      <div className="dashboard-card">
        <h2>My Projects</h2>
        <p>Manage your properties</p>
        <button>View Projects</button>
      </div>
      <div className="dashboard-card">
        <h2>Add Property</h2>
        <p>List a new property</p>
        <button>Add New</button>
      </div>
      <div className="dashboard-card">
        <h2>Investors</h2>
        <p>View project investors</p>
        <button>View Investors</button>
      </div>
    </div>
    <button 
      className="logout-btn" 
      onClick={() => {
        localStorage.removeItem('token');
        window.location.reload();
      }}
    >
      Logout
    </button>
  </div>
);

function SimplifiedApp() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  if (!user) {
    if (isRegistering) {
      return (
        <div className="auth-container">
          <Register setUser={setUser} />
          <p>Already have an account? <button onClick={() => setIsRegistering(false)}>Login</button></p>
        </div>
      );
    }
    return (
      <div className="auth-container">
        <Login setUser={setUser} />
        <p>Don't have an account? <button onClick={() => setIsRegistering(true)}>Register</button></p>
      </div>
    );
  }

  // Route based on user role
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'investor') return <InvestorView />;
  if (user.role === 'project_owner') return <ProjectOwnerView />;
  
  return <h1>Unknown Role</h1>;
}

export default SimplifiedApp;