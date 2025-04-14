import React from 'react';

const InvestorView = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div>
      <h2>Investor Dashboard</h2>
      <div>
        <h4>Your Portfolio</h4>
        <ul>
          <li>Total Invested: ₦2.5M</li>
          <li>Active Investments: 3</li>
          <li>Total Returns: ₦320,000</li>
        </ul>
      </div>

      <div>
        <h4>Recent Properties</h4>
        <div className="property-list">
          <div className="property-card">
            <h5>Lagos Highrise</h5>
            <p>Commercial Property</p>
            <p>ROI: 15% annually</p>
            <button>View Details</button>
          </div>
          <div className="property-card">
            <h5>Abuja Residences</h5>
            <p>Residential Property</p>
            <p>ROI: 12% annually</p>
            <button>View Details</button>
          </div>
        </div>
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default InvestorView;