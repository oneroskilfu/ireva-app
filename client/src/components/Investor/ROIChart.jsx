import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Paper, Typography, Box, Skeleton } from '@mui/material';
import { fetchRoiChartData } from '../../services/investorRoiService';
import { toast } from 'react-toastify';

const ROIChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        const data = await fetchRoiChartData();
        setChartData(data);
      } catch (error) {
        console.error('Failed to load ROI chart data:', error);
        toast.error('Failed to load ROI chart data');
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  return (
    <Paper sx={{ p: 3, mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#4B3B2A' }}>
        Monthly ROI Distribution
      </Typography>
      <Box sx={{ width: '100%', height: 350 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Box>
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer>
            <BarChart
              data={chartData}
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
                name="ROI Amount" 
                radius={[4, 4, 0, 0]}
                fill="#4B3B2A" 
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              No ROI distribution data available
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ROIChart;