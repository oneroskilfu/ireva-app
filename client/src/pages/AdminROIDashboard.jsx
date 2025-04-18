import React, { useEffect, useState } from 'react';
import { 
  fetchStats, 
  fetchChartData,
  triggerPayout 
} from '@/services/roiService';
import ROIOverview from '@/components/admin/ROIOverview';
import ROIChart from '@/components/admin/ROIChart';
import ROITable from '@/components/admin/ROITable';
import { 
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const AdminROIDashboard = () => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutData, setPayoutData] = useState({
    projectId: 1,
    roiPercentage: 12.5,
    distributionPeriod: 'Q2 2025',
    notes: 'Quarterly ROI distribution'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch stats and chart data in parallel
        const [statsRes, chartRes] = await Promise.all([
          fetchStats(),
          fetchChartData()
        ]);
        
        setStats(statsRes.data.data || {});
        setChartData(chartRes.data.data || []);
      } catch (err) {
        console.error('Error fetching ROI dashboard data:', err);
        setError('Failed to load ROI dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePayoutDialogOpen = () => {
    setPayoutDialogOpen(true);
  };

  const handlePayoutDialogClose = () => {
    setPayoutDialogOpen(false);
  };

  const handlePayoutDataChange = (field) => (event) => {
    setPayoutData({
      ...payoutData,
      [field]: field === 'roiPercentage' ? Number(event.target.value) : event.target.value
    });
  };

  const handlePayoutTrigger = async () => {
    try {
      setPayoutSuccess(false);
      setPayoutDialogOpen(false);
      
      const result = await triggerPayout(payoutData);
      
      if (result.data.success) {
        setPayoutSuccess(true);
        // In a real app, we would refresh the data after a payout
      }
    } catch (err) {
      console.error('Error triggering payout:', err);
      setError('Failed to trigger ROI payout. Please try again later.');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ my: 3 }}>
        ROI Distribution Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {payoutSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ROI payout process initiated successfully!
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <Typography>Loading dashboard data...</Typography>
        </Box>
      ) : (
        <>
          {/* ROI Overview Cards */}
          <ROIOverview />
          
          {/* ROI Chart */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Monthly ROI Distribution
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handlePayoutDialogOpen}
              >
                Trigger ROI Payout
              </Button>
            </Box>
            <ROIChart />
          </Paper>
          
          {/* ROI Table - now using the enhanced component */}
          <ROITable />
          
          {/* Payout Dialog */}
          <Dialog open={payoutDialogOpen} onClose={handlePayoutDialogClose}>
            <DialogTitle>Trigger ROI Payout</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                This will initiate the ROI distribution process for the selected project. 
                Please confirm the details below.
              </DialogContentText>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={payoutData.projectId}
                  label="Project"
                  onChange={handlePayoutDataChange('projectId')}
                >
                  <MenuItem value={1}>Skyline Apartments</MenuItem>
                  <MenuItem value={2}>Palm Estate</MenuItem>
                  <MenuItem value={3}>Ocean View Residences</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="ROI Percentage"
                type="number"
                fullWidth
                value={payoutData.roiPercentage}
                onChange={handlePayoutDataChange('roiPercentage')}
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Distribution Period"
                fullWidth
                value={payoutData.distributionPeriod}
                onChange={handlePayoutDataChange('distributionPeriod')}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={payoutData.notes}
                onChange={handlePayoutDataChange('notes')}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePayoutDialogClose}>Cancel</Button>
              <Button 
                onClick={handlePayoutTrigger}
                variant="contained"
                color="primary"
              >
                Proceed with Payout
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default AdminROIDashboard;