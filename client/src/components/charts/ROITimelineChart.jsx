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
import { format, parseISO } from 'date-fns';

/**
 * ROI Timeline Chart Component
 * 
 * Displays a user's return on investment over time with
 * interactive hover details and predicted future returns
 */
const ROITimelineChart = ({ data, predictions = [], height = 300 }) => {
  // Format tooltip value
  const formatTooltipValue = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Format X-axis date
  const formatXAxis = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Check if this is historical or predicted data
      const isPrediction = payload[0].payload.isPrediction;
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium text-sm">{formatXAxis(label)}</p>
          <div className="text-sm mt-1">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: isPrediction ? '#8884d8' : '#82ca9d' }}
              ></div>
              <span className="mr-2">{isPrediction ? 'Predicted ROI:' : 'Actual ROI:'}</span>
              <span className="font-medium">
                {formatTooltipValue(payload[0].value)}
              </span>
            </div>
            
            {payload[0].payload.investmentAmount && (
              <div className="mt-1">
                <span className="mr-2">Investment Amount:</span>
                <span className="font-medium">
                  ${parseFloat(payload[0].payload.investmentAmount).toFixed(2)}
                </span>
              </div>
            )}
            
            {payload[0].payload.returnAmount && (
              <div className="mt-1">
                <span className="mr-2">Return Amount:</span>
                <span className="font-medium">
                  ${parseFloat(payload[0].payload.returnAmount).toFixed(2)}
                </span>
              </div>
            )}
            
            {isPrediction && (
              <div className="mt-1 text-xs text-gray-500 italic">
                Prediction based on historical performance
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Combine historical and prediction data
  const combinedData = [
    ...data.map(item => ({
      ...item,
      isPrediction: false
    })),
    ...predictions.map(item => ({
      ...item,
      isPrediction: true
    }))
  ];
  
  // Find the date where predictions start
  const predictionStartDate = predictions.length > 0 ? predictions[0].date : null;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={combinedData}
        margin={{
          top: 5,
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
          tickFormatter={(value) => `${value}%`}
          domain={['auto', 'auto']}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Historical ROI line */}
        <Line
          type="monotone"
          dataKey="roi"
          name="Actual ROI"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
        
        {/* Predicted ROI line - only for prediction data points */}
        <Line
          type="monotone"
          dataKey="predictedRoi"
          name="Predicted ROI"
          stroke="#8884d8"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 4 }}
          connectNulls
        />
        
        {/* Reference line to separate actual from predicted */}
        {predictionStartDate && (
          <ReferenceLine
            x={predictionStartDate}
            stroke="#888"
            strokeDasharray="3 3"
            label={{ 
              value: 'Predictions Start', 
              position: 'insideTopRight',
              fill: '#888',
              fontSize: 12
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ROITimelineChart;