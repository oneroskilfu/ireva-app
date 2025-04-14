import React from 'react';

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <h4>Quick Stats</h4>
        <ul>
          <li>Total Users: 320</li>
          <li>Ongoing Projects: 12</li>
          <li>Total ROI Paid: ₦24M</li>
        </ul>
      </div>

      <div>
        <h4>Admin Tools</h4>
        <button>Manage Users</button>
        <button>Manage Properties</button>
        <button>View Analytics</button>
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;