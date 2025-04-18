import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { Trending, Calendar, MoveUpRight, CircleDollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ROIDistribution {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    location: string;
    type: string;
  };
  investmentId: string;
  amount: number;
  distributionDate: string;
  status: string;
}

interface ROIChartData {
  name: string;
  amount: number;
}

const ROITracking: React.FC = () => {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState<ROIDistribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ROIChartData[]>([]);

  useEffect(() => {
    if (user) {
      fetchROIDistributions();
    }
  }, [user]);

  const fetchROIDistributions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/roi-distribution/investor/${user?.id}`);
      setDistributions(response.data);
      
      // Process data for chart
      processChartData(response.data);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching ROI distributions:', error);
      setError('Failed to fetch ROI distributions. Please try again later.');
      setIsLoading(false);
    }
  };

  const processChartData = (data: ROIDistribution[]) => {
    // Group by month
    const monthlyData = data.reduce((acc, curr) => {
      const date = new Date(curr.distributionDate);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      
      acc[monthYear] += curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to chart format
    const chartDataArray = Object.entries(monthlyData).map(([name, amount]) => ({
      name,
      amount
    }));
    
    // Sort by date
    chartDataArray.sort((a, b) => {
      const [monthA, yearA] = a.name.split(' ');
      const [monthB, yearB] = b.name.split(' ');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    setChartData(chartDataArray);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getTotalROI = () => {
    return distributions.reduce((total, dist) => total + dist.amount, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectROITotal = () => {
    const projectTotals = distributions.reduce((acc, curr) => {
      const projectId = curr.projectId._id;
      if (!acc[projectId]) {
        acc[projectId] = {
          name: curr.projectId.name,
          total: 0
        };
      }
      acc[projectId].total += curr.amount;
      return acc;
    }, {} as Record<string, { name: string; total: number }>);
    
    return Object.values(projectTotals).sort((a, b) => b.total - a.total);
  };

  const getAverageMonthlyROI = () => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, data) => sum + data.amount, 0);
    return total / chartData.length;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ROI Tracking & Analysis
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : distributions.length === 0 ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No ROI Distributions Yet
            </Typography>
            <Typography variant="body1">
              You have not received any ROI distributions yet. As your investments mature, 
              you will see your returns here.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <>
          {/* ROI Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Total ROI Received
                    </Typography>
                  </Box>
                  <Typography variant="h5">{formatCurrency(getTotalROI())}</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Trending className="h-5 w-5 mr-2 text-primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Average Monthly Return
                    </Typography>
                  </Box>
                  <Typography variant="h5">{formatCurrency(getAverageMonthlyROI())}</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Distribution
                    </Typography>
                  </Box>
                  <Typography variant="h5">
                    {distributions.length > 0 ? 
                      formatDate(distributions[0].distributionDate) : 
                      'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoveUpRight className="h-5 w-5 mr-2 text-primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Distributions
                    </Typography>
                  </Box>
                  <Typography variant="h5">{distributions.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* ROI Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly ROI Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `₦${value.toLocaleString()}`} 
                    />
                    <Tooltip 
                      formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Amount']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="ROI Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    Not enough data to generate chart
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
          
          {/* Project-wise ROI Distribution */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ROI by Project
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell align="right">Total ROI</TableCell>
                    <TableCell align="right">% of Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getProjectROITotal().map((project, index) => (
                    <TableRow key={index}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell align="right">{formatCurrency(project.total)}</TableCell>
                      <TableCell align="right">
                        {(project.total / getTotalROI() * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          {/* Distribution History */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ROI Distribution History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {distributions.map((distribution) => (
                    <TableRow key={distribution._id}>
                      <TableCell>{formatDate(distribution.distributionDate)}</TableCell>
                      <TableCell>{distribution.projectId.name}</TableCell>
                      <TableCell>{formatCurrency(distribution.amount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={distribution.status} 
                          color={distribution.status === 'Completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ROITracking;