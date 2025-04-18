import React from 'react';
import { Bar } from 'recharts';
import { 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LinearGradient,
  defs
} from 'recharts';

const data = [
  { month: 'Jan', amount: 2400000 },
  { month: 'Feb', amount: 1800000 },
  { month: 'Mar', amount: 3200000 },
  { month: 'Apr', amount: 2780000 },
  { month: 'May', amount: 1890000 },
  { month: 'Jun', amount: 3390000 },
];

const ROIChart = () => {
  return (
    <div style={{ width: '100%', height: 300, marginBottom: '2rem' }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis 
            tickFormatter={(value) => 
              new Intl.NumberFormat('en-NG', { 
                style: 'currency', 
                currency: 'NGN',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(value)
            }
          />
          <Tooltip 
            formatter={(value) => 
              new Intl.NumberFormat('en-NG', { 
                style: 'currency', 
                currency: 'NGN' 
              }).format(value)
            }
          />
          <Legend />
          <Bar dataKey="amount" name="ROI Distribution" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ROIChart;