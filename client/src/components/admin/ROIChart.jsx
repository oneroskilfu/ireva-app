import React from 'react';
import { Bar } from 'recharts';
import { 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="month" 
            axisLine={{ stroke: '#4B3B2A', strokeWidth: 1 }}
            tick={{ fill: '#4B3B2A' }}
          />
          <YAxis 
            tickFormatter={(value) => 
              new Intl.NumberFormat('en-NG', { 
                style: 'currency', 
                currency: 'NGN',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(value)
            }
            axisLine={{ stroke: '#4B3B2A', strokeWidth: 1 }}
            tick={{ fill: '#4B3B2A' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #4B3B2A' }}
            formatter={(value) => 
              new Intl.NumberFormat('en-NG', { 
                style: 'currency', 
                currency: 'NGN' 
              }).format(value)
            }
            labelStyle={{ color: '#4B3B2A', fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            iconType="circle"
          />
          <Bar 
            dataKey="amount" 
            name="ROI Distribution" 
            radius={[4, 4, 0, 0]}
            fill="#4B3B2A" 
            barSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ROIChart;