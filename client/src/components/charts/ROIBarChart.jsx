import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={`value-${index}`} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ROIBarChart = ({ 
  data, 
  title, 
  height = 300, 
  showGrid = true,
  barKey = 'roi',
  nameKey = 'name',
  threshold = 0,
  positiveColor = '#4CAF50',
  negativeColor = '#F44336',
  averageValue = null,
  averageLabel = 'Average ROI'
}) => {
  // Sort data by ROI value if needed
  // const sortedData = [...data].sort((a, b) => b[barKey] - a[barKey]);
  
  return (
    <div className="h-full">
      {title && <h3 className="text-base font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
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
            dataKey={nameKey}
            tick={{ fontSize: 12 }}
            interval={0}
            tickMargin={8}
            angle={-45}
            textAnchor="end"
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            domain={['auto', 'auto']} // This ensures the domain adapts to the data
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {averageValue !== null && (
            <ReferenceLine
              y={averageValue}
              stroke="#FF8C00"
              strokeDasharray="3 3"
              label={{ 
                value: `${averageLabel} (${averageValue.toFixed(1)}%)`, 
                position: 'insideTopRight',
                fill: '#FF8C00',
                fontSize: 12
              }}
            />
          )}
          
          <Bar dataKey={barKey} name="ROI" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={Number(entry[barKey]) >= threshold ? positiveColor : negativeColor} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ROIBarChart;