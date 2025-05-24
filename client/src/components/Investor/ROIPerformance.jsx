import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  LinearProgress,
  Skeleton,
  Chip
} from '@mui/material';
import { fetchInvestmentPerformance } from '../../services/investorRoiService';
import { toast } from 'react-toastify';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const ROIPerformance = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        setLoading(true);
        const data = await fetchInvestmentPerformance();
        setPerformanceData(data);
      } catch (error) {
        console.error('Failed to load investment performance data:', error);
        toast.error('Failed to load performance metrics');
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPerformanceColor = (performanceRatio, targetReturn) => {
    if (parseFloat(performanceRatio) >= parseFloat(targetReturn)) {
      return '#4caf50'; // Green for good performance
    } else if (parseFloat(performanceRatio) >= parseFloat(targetReturn) * 0.75) {
      return '#ff9800'; // Amber for medium performance
    } else {
      return '#f44336'; // Red for poor performance
    }
  };

  return (
    <Paper sx={{ p: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#4B3B2A' }}>
        Investment Performance Analysis
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#F3F3F3' }}>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell>Target Return</TableCell>
              <TableCell>Total Invested</TableCell>
              <TableCell>Total Returns</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(3)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton variant="rectangular" height={20} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                </TableRow>
              ))
            ) : performanceData.length > 0 ? (
              performanceData.map((property) => (
                <TableRow 
                  key={property.id}
                  sx={{ '&:nth-of-type(even)': { backgroundColor: '#F9F9F9' } }}
                >
                  <TableCell>{property.name}</TableCell>
                  <TableCell>{property.targetReturn}%</TableCell>
                  <TableCell>{formatCurrency(property.totalInvested)}</TableCell>
                  <TableCell>{formatCurrency(property.totalReturns)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(parseFloat(property.performanceRatio), 100)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getPerformanceColor(property.performanceRatio, property.targetReturn)
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: '50px' }}>
                        {property.performanceRatio}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {parseFloat(property.performanceRatio) >= parseFloat(property.targetReturn) ? (
                      <Chip 
                        icon={<TrendingUpIcon />} 
                        label="On Target" 
                        size="small" 
                        color="success" 
                      />
                    ) : parseFloat(property.performanceRatio) >= parseFloat(property.targetReturn) * 0.75 ? (
                      <Chip 
                        label="Average" 
                        size="small" 
                        color="warning" 
                      />
                    ) : (
                      <Chip 
                        icon={<TrendingDownIcon />} 
                        label="Below Target" 
                        size="small" 
                        color="error" 
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No performance data available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Make investments in properties to see performance metrics
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          * Performance is calculated as the percentage of returns relative to investment amount
        </Typography>
        <Typography variant="body2" color="text.secondary">
          * Target Return represents the annual projected ROI for each property
        </Typography>
      </Box>
    </Paper>
  );
};

export default ROIPerformance;