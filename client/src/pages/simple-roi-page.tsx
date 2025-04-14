import * as React from 'react';
import SimpleLayout from '../components/layout/SimpleLayout';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';
import { getUserROI, getROIMetrics } from '../services/roiService';

// For chart, we would typically use a library like Recharts
// but we'll create a simple component for demonstration
const SimpleChart: React.FC<{ data: number[], labels: string[] }> = ({ data, labels }) => {
  const maxValue = Math.max(...data) * 1.1; // Add 10% padding
  
  return (
    <Box sx={{ height: 300, width: '100%', position: 'relative', mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          position: 'relative',
          pb: 4, // Space for labels
        }}
      >
        {data.map((value, index) => (
          <Box
            key={index}
            sx={{
              width: `${100 / data.length - 2}%`,
              height: `${(value / maxValue) * 100}%`,
              bgcolor: 'primary.main',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: -24,
                color: 'text.primary',
              }}
            >
              ₦{value.toLocaleString()}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -24,
                color: 'text.secondary',
              }}
            >
              {labels[index]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const SimpleRoiPage: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState('monthly');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [roiData, setRoiData] = React.useState<{ returns: number[], labels: string[] } | null>(null);
  const [metrics, setMetrics] = React.useState<{ totalReturn: number, averageROI: number } | null>(null);
  
  // Load ROI data when timeframe changes
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch ROI data from the API
        const data = await getUserROI(timeframe);
        
        // Fetch ROI metrics
        const metricsData = await getROIMetrics();
        
        // Transform API response to the format we need
        const formattedData = {
          returns: data.returns || [],
          labels: data.labels || []
        };
        
        // Update state with fetched data
        setRoiData(formattedData);
        setMetrics({
          totalReturn: metricsData.totalReturn || 0,
          averageROI: metricsData.averageROI || 0
        });
      } catch (err) {
        console.error('Error fetching ROI data:', err);
        setError('Failed to load ROI data. Please try again later.');
        
        // Fallback to empty data
        setRoiData({ returns: [], labels: [] });
        setMetrics({ totalReturn: 0, averageROI: 0 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeframe]);
  
  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
  };
  
  // Fallback data for demonstration when API returns no data
  const fallbackData = {
    monthly: {
      returns: [120000, 135000, 142000, 150000, 165000, 180000],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    quarterly: {
      returns: [410000, 460000, 520000, 580000],
      labels: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    yearly: {
      returns: [1800000, 2200000, 2600000],
      labels: ['2021', '2022', '2023']
    }
  };
  
  // Use the fallback data if API returns no data
  const currentData = roiData && roiData.returns.length > 0 
    ? roiData 
    : fallbackData[timeframe as keyof typeof fallbackData];
  
  return (
    <SimpleLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ROI Tracker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Track your investment returns over time
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Total Returns
              </Typography>
              <Typography variant="h4" color="primary">
                ₦{calculateTotal().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Average ROI
              </Typography>
              <Typography variant="h4" color="primary">
                {calculateAverageROI()}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              Return History
            </Typography>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
              <Select
                labelId="timeframe-select-label"
                id="timeframe-select"
                value={timeframe}
                label="Timeframe"
                onChange={handleTimeframeChange}
                size="small"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <SimpleChart
            data={currentData.returns}
            labels={currentData.labels}
          />
        </CardContent>
      </Card>
    </SimpleLayout>
  );
};

export default SimpleRoiPage;