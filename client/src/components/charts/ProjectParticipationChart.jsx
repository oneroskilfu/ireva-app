import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

/**
 * Project Participation Chart Component
 * 
 * Displays a user's investment distribution across different
 * properties with interactive details on hover
 */
const ProjectParticipationChart = ({ data, height = 300 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#45B39D', '#F4D03F', '#EB984E', '#5D6D7E'];
  
  // Handle active sector change
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  // Render active shape with details
  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value
    } = props;
    
    return (
      <g>
        <text x={cx} y={cy - 5} dy={8} textAnchor="middle" fill="#333" className="text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="#999" className="text-xs">
          ${value} ({(percent * 100).toFixed(1)}%)
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 8}
          fill={fill}
        />
      </g>
    );
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium text-sm">{data.name}</p>
          <div className="text-sm mt-1">
            <div className="flex items-center mt-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: payload[0].color }}
              ></div>
              <span className="mr-2">Amount:</span>
              <span className="font-medium">${data.value}</span>
            </div>
            {data.roi !== undefined && (
              <div className="flex items-center mt-1">
                <span className="mr-2">ROI:</span>
                <span className="font-medium">{data.roi}%</span>
              </div>
            )}
            {data.status && (
              <div className="flex items-center mt-1">
                <span className="mr-2">Status:</span>
                <span className="font-medium">{data.status}</span>
              </div>
            )}
            <div className="flex items-center mt-1">
              <span className="mr-2">Percentage:</span>
              <span className="font-medium">{(payload[0].percent * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Custom legend
  const renderColorfulLegendText = (value, entry) => {
    return (
      <span className="text-xs" style={{ color: '#333' }}>
        {value}
      </span>
    );
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
          onMouseEnter={onPieEnter}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={renderColorfulLegendText}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ProjectParticipationChart;