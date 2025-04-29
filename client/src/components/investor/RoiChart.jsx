import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, ButtonGroup, Button } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

const timeRanges = [
  { label: '1M', value: 'month' },
  { label: '3M', value: 'quarter' },
  { label: '6M', value: 'half_year' },
  { label: '1Y', value: 'year' },
  { label: 'All', value: 'all' }
];

const RoiChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/investor/roi/chart?timeRange=${timeRange}`);
        setChartData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ROI chart data:', err);
        setError('Failed to load ROI data');
        setLoading(false);
      }
    };

    fetchChartData();
  }, [timeRange]);

  const handleRangeChange = (range) => {
    setTimeRange(range);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          Return on Investment
        </Typography>
        <ButtonGroup size="small" aria-label="time range">
          {timeRanges.map((range) => (
            <Button 
              key={range.value}
              variant={timeRange === range.value ? 'contained' : 'outlined'}
              onClick={() => handleRangeChange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => ['$' + value.toLocaleString(), 'Value']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="investment" 
              stroke="#8884d8" 
              name="Investment"
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="returns" 
              stroke="#82ca9d" 
              name="Returns"
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default RoiChart;