import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { AdminPanelSettings, CheckCircle, PendingActions, Error } from '@mui/icons-material';
import axios from 'axios';
import CustomSnackbar from '../../components/CustomSnackbar';
import { waitForTransaction } from '../../utils/web3Listeners';

// This should come from environment or blockchain config
const PROVIDER_URL = process.env.VITE_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key';

function EscrowWalletDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState({
    usdc: '0',
    eth: '0'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [releasingFunds, setReleasingFunds] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchWalletBalance();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/escrow-projects');
      setProjects(data.projects || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching escrow projects:', err);
      setError('Failed to load escrow projects. Please try again.');
      // Use mock data for development
      if (process.env.NODE_ENV === 'development') {
        setProjects(getMockProjects());
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const { data } = await axios.get('/api/admin/escrow-wallet-balance');
      setWalletBalance(data.balance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      // Use mock data for development
      if (process.env.NODE_ENV === 'development') {
        setWalletBalance({
          usdc: '3,750,000',
          eth: '1.25'
        });
      }
    }
  };

  const handleReleaseFunds = async (projectId, milestoneId) => {
    try {
      setReleasingFunds(true);
      
      // Show initial processing notification
      setSnackbar({
        open: true,
        message: "Processing fund release transaction...",
        severity: "info"
      });
      
      // First, interact directly with the smart contract if we have web3 enabled
      // Import the smart contract service
      const smartContractService = await import('../../services/smartContractService').then(module => module.default);
      
      if (smartContractService && smartContractService.getInitializationStatus()) {
        // Use the smart contract service to release funds
        const txResult = await smartContractService.releaseFunds(projectId, milestoneId);
        console.log('Smart contract transaction result:', txResult);
        
        // Get transaction hash from the blockchain transaction
        const txHash = txResult?.transactionHash;
        
        if (txHash) {
          try {
            // Wait for transaction to be mined (smart contract service might already handle this)
            await waitForTransaction(PROVIDER_URL, txHash);
            
            // Notify the backend about the fund release
            await axios.post('/api/admin/release-escrow-funds', {
              projectId,
              milestoneId,
              transactionHash: txHash
            });
            
            // Show success message
            setSnackbar({
              open: true,
              message: "Funds released successfully!",
              severity: "success"
            });
          } catch (txError) {
            console.error('Transaction error:', txError);
            setSnackbar({
              open: true,
              message: "Transaction failed to confirm!",
              severity: "error"
            });
          }
        }
      } else {
        // Fallback to API-only approach if web3 is not available
        console.log('Smart contract service not available, using API only');
        
        // Call API to release funds
        const response = await axios.post('/api/admin/release-escrow-funds', {
          projectId,
          milestoneId
        });
        
        // Get transaction hash from response
        const txHash = response?.data?.transactionHash;
        
        if (txHash) {
          try {
            // Wait for transaction to be mined
            await waitForTransaction(PROVIDER_URL, txHash);
            
            // Show success message
            setSnackbar({
              open: true,
              message: "Funds released successfully!",
              severity: "success"
            });
          } catch (txError) {
            console.error('Transaction error:', txError);
            setSnackbar({
              open: true,
              message: "Transaction failed to confirm!",
              severity: "error"
            });
          }
        }
      }
      
      // Refresh projects after releasing funds
      fetchProjects();
      fetchWalletBalance();
    } catch (err) {
      console.error('Error releasing funds:', err);
      setError('Failed to release funds. Please try again.');
      setSnackbar({
        open: true,
        message: "Failed to release funds: " + (err.response?.data?.error || err.message),
        severity: "error"
      });
    } finally {
      setReleasingFunds(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip icon={<PendingActions />} label="Active" color="primary" size="small" />;
      case 'successful':
        return <Chip icon={<CheckCircle />} label="Successful" color="success" size="small" />;
      case 'failed':
        return <Chip icon={<Error />} label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Mock data for development only
  const getMockProjects = () => {
    return [
      {
        id: 1,
        name: "Lagos Heights Residential Tower",
        goal: "5,000,000",
        raised: "3,750,000",
        status: "active",
        percentComplete: 75,
        nextMilestone: {
          id: 2,
          title: "Construction Phase 2",
          amount: "1,500,000",
          releaseDate: "2023-09-15",
          status: "pending"
        }
      },
      {
        id: 2,
        name: "Abuja Commercial Plaza",
        goal: "2,500,000",
        raised: "2,500,000",
        status: "successful",
        percentComplete: 100,
        nextMilestone: {
          id: 3,
          title: "Final Completion",
          amount: "750,000",
          releaseDate: "2023-07-30",
          status: "ready"
        }
      },
      {
        id: 3,
        name: "Port Harcourt Business Hub",
        goal: "3,200,000",
        raised: "1,250,000",
        status: "failed",
        percentComplete: 39,
        nextMilestone: null
      }
    ];
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Escrow Wallet Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Wallet Balance Cards */}
      <Typography variant="h5" sx={{ mb: 2 }}>Wallet Overview</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                USDC Balance
              </Typography>
              <Typography variant="h4">
                {walletBalance.usdc} USDC
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                ETH Balance
              </Typography>
              <Typography variant="h4">
                {walletBalance.eth} ETH
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table */}
      <Typography variant="h5" sx={{ mb: 2 }}>Active Escrow Projects</Typography>
      <Paper sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Goal (USDC)</TableCell>
              <TableCell>Current Raised (USDC)</TableCell>
              <TableCell>Completion</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No escrow projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.goal}</TableCell>
                  <TableCell>{project.raised}</TableCell>
                  <TableCell>{project.percentComplete}%</TableCell>
                  <TableCell>{getStatusChip(project.status)}</TableCell>
                  <TableCell>
                    {project.nextMilestone && project.nextMilestone.status === 'ready' && (
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleReleaseFunds(project.id, project.nextMilestone.id)}
                        disabled={releasingFunds}
                      >
                        {releasingFunds ? 'Processing...' : 'Release Funds'}
                      </Button>
                    )}
                    {project.nextMilestone && project.nextMilestone.status === 'pending' && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        disabled
                      >
                        Pending Release
                      </Button>
                    )}
                    {(!project.nextMilestone) && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        disabled
                      >
                        No Action
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Pending Milestone Releases */}
      <Typography variant="h5" sx={{ mb: 2 }}>Pending Milestone Releases</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Milestone</TableCell>
              <TableCell>Amount (USDC)</TableCell>
              <TableCell>Release Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {projects.filter(p => p.nextMilestone && p.nextMilestone.status === 'ready').length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No pending releases at this time
                </TableCell>
              </TableRow>
            ) : (
              projects
                .filter(p => p.nextMilestone && p.nextMilestone.status === 'ready')
                .map((project) => (
                  <TableRow key={`milestone-${project.id}`}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.nextMilestone.title}</TableCell>
                    <TableCell>{project.nextMilestone.amount}</TableCell>
                    <TableCell>{project.nextMilestone.releaseDate}</TableCell>
                    <TableCell>
                      <Button 
                        variant="contained" 
                        color="success"
                        size="small"
                        onClick={() => handleReleaseFunds(project.id, project.nextMilestone.id)}
                        disabled={releasingFunds}
                      >
                        {releasingFunds ? 'Processing...' : 'Approve & Release'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Snackbar for transaction feedback */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Box>
  );
}

export default EscrowWalletDashboard;