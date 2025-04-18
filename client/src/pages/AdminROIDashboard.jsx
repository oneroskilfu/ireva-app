import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';
import ROIOverview from '@/components/admin/ROIOverview';
import ROITable from '@/components/admin/ROITable';
import ROIChart from '@/components/admin/ROIChart';
import ROIDistributionForm from '@/components/admin/ROIDistributionForm';
import { distributeROI } from '@/services/roiService';

const AdminROIDashboard = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch projects here
    setProjects([
      { id: '1', name: 'Skyline Apartments' },
      { id: '2', name: 'Green Valley Estate' },
      { id: '3', name: 'Oceanview Residences' },
      { id: '4', name: 'Central Business District' },
      { id: '5', name: 'Palm Heights' },
      { id: '6', name: 'Eagle Crest Villas' },
    ]);
  }, []);

  const handleOpenDistributionForm = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDistributeROI = async (formData) => {
    try {
      setLoading(true);
      const result = await distributeROI(formData);
      
      toast({
        title: "ROI Distributed",
        description: `Successfully distributed ${formData.roiPercentage}% ROI to investors`,
        variant: "success",
      });
      
      setOpen(false);
      setRefreshData(prev => !prev); // Trigger data refresh
    } catch (error) {
      console.error('Error distributing ROI:', error);
      toast({
        title: "Distribution Failed",
        description: error.message || "Failed to distribute ROI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDistributionDetails = (distribution) => {
    setSelectedDistribution(distribution);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedDistribution(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          ROI Distribution Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDistributionForm}
        >
          Distribute ROI
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box mb={4}>
        <ROIOverview />
      </Box>

      {/* Chart Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>Monthly ROI Distribution Trend</Typography>
        <ROIChart />
      </Paper>

      {/* Distributions Table */}
      <ROITable 
        projects={projects} 
        refresh={refreshData} 
        onViewDetails={handleViewDistributionDetails} 
      />

      {/* Distribution Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Distribute ROI to Investors</DialogTitle>
        <DialogContent>
          <ROIDistributionForm 
            projects={projects} 
            onSubmit={handleDistributeROI} 
            loading={loading} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Distribute ROI'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Distribution Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Distribution Details</DialogTitle>
        <DialogContent>
          {selectedDistribution ? (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Project</Typography>
                  <Typography variant="body1" gutterBottom>{selectedDistribution.projectName || 'Unknown Project'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Distribution Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedDistribution.distributionDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(selectedDistribution.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">ROI Percentage</Typography>
                  <Typography variant="body1" gutterBottom>{selectedDistribution.roiPercentage}%</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Typography variant="body1" gutterBottom>{selectedDistribution.status}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Reference</Typography>
                  <Typography variant="body1" gutterBottom>{selectedDistribution.transactionReference}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                  <Typography variant="body1" gutterBottom>{selectedDistribution.notes || 'No notes provided'}</Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>Loading distribution details...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminROIDashboard;