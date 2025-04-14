import React from 'react';

const InvestorDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div>
      <h2>Welcome to Your Dashboard</h2>
      <div>
        <h4>Your Investments</h4>
        <ul>
          <li>CityView Park: ₦1,200,000 - ROI: 12%</li>
          <li>OceanBay Estate: ₦850,000 - ROI: 15%</li>
        </ul>
      </div>

      <div>
        <h4>Actions</h4>
        <button>Track ROI</button>
        <button>Invest Now</button>
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default InvestorDashboard;