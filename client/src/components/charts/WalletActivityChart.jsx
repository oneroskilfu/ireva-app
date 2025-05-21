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
  LabelList
} from 'recharts';
import { format, parseISO } from 'date-fns';

/**
 * Wallet Activity Chart Component
 * 
 * Displays a user's wallet activity (deposits, withdrawals, investments)
 * over time with interactive details
 */
const WalletActivityChart = ({ data, height = 300 }) => {
  // Format tooltip value as currency
  const formatCurrency = (value) => {
    return `$${Number(value).toFixed(2)}`;
  };
  
  // Format X-axis date
  const formatXAxis = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM dd');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium text-sm">{formatXAxis(label)}</p>
          <div className="text-sm mt-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center mt-1">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="mr-2">{entry.name}:</span>
                <span className="font-medium">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
            
            {payload[0].payload.transactionCount && (
              <div className="mt-2 text-xs text-gray-500">
                {payload[0].payload.transactionCount} transaction{payload[0].payload.transactionCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        <Bar 
          dataKey="deposits" 
          name="Deposits" 
          fill="#4ade80" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="withdrawals" 
          name="Withdrawals" 
          fill="#f87171" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="investments" 
          name="Investments" 
          fill="#60a5fa" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WalletActivityChart;