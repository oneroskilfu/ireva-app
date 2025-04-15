import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InvestmentChart = ({ data = null }) => {
  // Default chart data if none provided
  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    investments: [250000, 350000, 500000, 650000, 800000, 950000],
    returns: [15000, 21000, 30000, 39000, 48000, 57000]
  };

  const chartData = data || defaultData;

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Investment Performance'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₦' + value.toLocaleString();
          }
        }
      }
    }
  };

  const chartDataConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Total Investment',
        data: chartData.investments,
        borderColor: '#1e40af',
        backgroundColor: 'rgba(30, 64, 175, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Returns',
        data: chartData.returns,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
      }
    ],
  };

  return (
    <div className="chart-container">
      <Line options={options} data={chartDataConfig} />
    </div>
  );
};

export default InvestmentChart;