import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={`value-${index}`} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> ${Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatYAxis = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const formatTooltipDate = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const PerformanceLineChart = ({ 
  data, 
  title, 
  height = 300, 
  showGrid = true,
  showLegend = true,
  baselineLabel = null,
  baselineValue = null,
  lines = [
    { dataKey: 'value', name: 'Portfolio Value', color: '#0088FE' }
  ]
}) => {
  return (
    <div className="h-full">
      {title && <h3 className="text-base font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} labelFormatter={formatTooltipDate} />
          {showLegend && <Legend />}
          
          {baselineValue !== null && (
            <ReferenceLine 
              y={baselineValue} 
              stroke="#ff7300" 
              strokeDasharray="3 3" 
              label={baselineLabel ? { value: baselineLabel, position: 'insideBottomLeft' } : null} 
            />
          )}
          
          {lines.map((line, index) => (
            <Line
              key={`line-${index}`}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceLineChart;