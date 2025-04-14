import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    axios.get('/api/investments', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setInvestments(res.data));
  }, [token]);

  return (
    <div>
      <h2>Investments</h2>
      {investments.map(inv => (
        <div key={inv._id}>
          {inv.project} - {inv.amount} - {new Date(inv.date).toLocaleDateString()}
        </div>
      ))}
    </div>
  );
};

export default Investments;