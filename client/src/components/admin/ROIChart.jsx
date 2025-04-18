import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sampleData = [
  { month: 'Jan', roi: 1500000 },
  { month: 'Feb', roi: 1800000 },
  { month: 'Mar', roi: 1200000 },
  { month: 'Apr', roi: 2000000 },
];

const ROIChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={sampleData}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="roi" stroke="#3f51b5" />
    </LineChart>
  </ResponsiveContainer>
);

export default ROIChart;