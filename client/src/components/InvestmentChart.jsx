import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const InvestmentChart = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'ROI',
        data: [5, 10, 8, 12],
        borderColor: 'green',
        backgroundColor: 'lightgreen',
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      <h4>ROI Growth</h4>
      <Line data={data} />
    </div>
  );
};

export default InvestmentChart;