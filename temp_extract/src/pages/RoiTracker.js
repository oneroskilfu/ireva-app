import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale);

const RoiTracker = () => {
  const [roiData, setRoiData] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    axios.get('/api/investments/roi', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRoiData(res.data));
  }, [token]);

  const data = {
    labels: roiData.map(d => d.date),
    datasets: [{
      label: 'ROI %',
      data: roiData.map(d => d.roi),
      borderColor: 'green',
      tension: 0.3
    }]
  };

  return (
    <div>
      <h2>ROI Tracker</h2>
      <Line data={data} />
    </div>
  );
};

export default RoiTracker;