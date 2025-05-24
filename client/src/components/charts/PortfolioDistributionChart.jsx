import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  '#0088FE', // blue
  '#00C49F', // teal
  '#FFBB28', // yellow
  '#FF8042', // orange
  '#8884D8', // purple
  '#82CA9D', // green
  '#FFC658', // light orange
  '#8DD1E1', // light blue
  '#A4DE6C', // light green
  '#D0ED57'  // lime
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-sm">
          <span className="font-medium">Amount:</span> ${Number(payload[0].value).toLocaleString()}
        </p>
        <p className="text-sm">
          <span className="font-medium">Percentage:</span> {payload[0].payload.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

const PortfolioDistributionChart = ({ data, title, showLegend = true, height = 300 }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + Number(item.value), 0);
  
  // Add percentage to each item
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((Number(item.value) / total) * 100).toFixed(1)
  }));
  
  return (
    <div className="h-full">
      {title && <h3 className="text-base font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value, entry, index) => (
                <span className="text-sm">{value} ({dataWithPercentage[index].percentage}%)</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioDistributionChart;