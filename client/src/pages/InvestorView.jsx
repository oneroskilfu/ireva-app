import React from 'react';

const InvestorView = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div>
      <h1>Investor Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default InvestorView;