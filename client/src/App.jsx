import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InvestorView from './pages/InvestorView';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    }
  }, []);

  if (!user) return <Login setUser={setUser} />;

  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'investor') return <InvestorView />;
  return <h1>Unknown Role</h1>;
}

export default App;