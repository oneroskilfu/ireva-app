import React, { useEffect, useState } from 'react';
import { 
  fetchStats, 
  fetchChartData,
  triggerPayout 
} from '@/services/roiService';
import ROIOverview from '@/components/admin/ROIOverview';
import ROIChart from '@/components/admin/ROIChart';
import ROITable from '@/components/admin/ROITable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
        toast.success('ROI payout successfully triggered!');
        // In a real app, we would refresh the data after a payout
      }
    } catch (err) {
      console.error('Error triggering payout:', err);
      setError('Failed to trigger ROI payout. Please try again later.');
      toast.error('Error triggering ROI payout.');
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
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                    <line x1="9" y1="2" x2="9" y2="22"></line>
                    <path d="M14 9.5L17 6"></path>
                    <path d="M14 14.5L17 18"></path>
                    <path d="M3 6h6"></path>
                    <path d="M3 10h6"></path>
                    <path d="M3 14h6"></path>
                    <path d="M3 18h6"></path>
                  </svg>
                </Box>
                Monthly ROI Distribution
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handlePayoutDialogOpen}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
                  boxShadow: '0 3px 5px 2px rgba(75, 59, 42, .3)'
                }}
              >
                <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </Box>
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
                sx={{ 
                  background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
                  boxShadow: '0 3px 5px 2px rgba(75, 59, 42, .3)'
                }}
              >
                <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                </Box>
                Proceed with Payout
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Toast Container */}
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </>
      )}
    </Container>
  );
};

export default AdminROIDashboard;