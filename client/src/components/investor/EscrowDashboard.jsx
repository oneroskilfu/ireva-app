import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  LinearProgress, 
  Chip, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress
} from '@mui/material';
import { AccessTime, Check, Close, Warning, ArrowUpward, Payments, AccountBalanceWallet } from '@mui/icons-material';
import escrowService from '../../services/escrowService';
import CustomSnackbar from '../../components/CustomSnackbar';
import { waitForTransaction } from '../../utils/web3Listeners';

// This should come from environment or blockchain config
const PROVIDER_URL = process.env.VITE_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key';

const EscrowDashboard = ({ userWalletAddress }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [investorData, setInvestorData] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [isInvesting, setIsInvesting] = useState(false);
  const [investAmount, setInvestAmount] = useState('100');
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (userWalletAddress) {
      fetchEscrowData();
    } else {
      setIsLoading(false);
    }
  }, [userWalletAddress]);

  const fetchEscrowData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get campaign status
      const campaignStatus = await escrowService.getCampaignStatus();
      setCampaignData(campaignStatus);

      // Get investor details if wallet is connected
      if (userWalletAddress) {
        const investorDetails = await escrowService.getInvestorDetails(userWalletAddress);
        setInvestorData(investorDetails);
      }

      // Get milestones
      const milestonesData = await escrowService.getMilestones();
      if (milestonesData && Array.isArray(milestonesData)) {
        setMilestones(milestonesData);
      } else {
        // Use mock milestones if API fails
        setMilestones([
          {
            id: 1,
            title: "Property Acquisition",
            description: "Initial funds released for property acquisition",
            amount: "30%",
            isApproved: true,
            isReleased: true,
            releaseDate: "Mar 15, 2023"
          },
          {
            id: 2,
            title: "Construction Progress",
            description: "Funds released at 50% construction completion",
            amount: "40%",
            isApproved: true,
            isReleased: false,
            releaseDate: "Sep 15, 2023"
          },
          {
            id: 3,
            title: "Project Completion",
            description: "Final funds released upon project completion",
            amount: "30%",
            isApproved: false,
            isReleased: false,
            releaseDate: "Mar 15, 2024"
          }
        ]);
      }
    } catch (err) {
      console.error("Error fetching escrow data:", err);
      setError(err.message || "Failed to fetch escrow data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!userWalletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsInvesting(true);
      setError(null);
      
      // Show processing notification
      setSnackbar({
        open: true,
        message: "Processing your investment...",
        severity: "info"
      });

      // Submit investment
      const result = await escrowService.invest(investAmount, userWalletAddress);
      console.log("Investment result:", result);
      
      if (result.transactionHash) {
        try {
          // Wait for the transaction to be mined
          await waitForTransaction(PROVIDER_URL, result.transactionHash);
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Successfully invested ${investAmount} USDC in this property!`,
            severity: "success"
          });
        } catch (txError) {
          console.error("Transaction error:", txError);
          setSnackbar({
            open: true,
            message: "Transaction failed to confirm!",
            severity: "error"
          });
        }
      }

      // Refetch data after investment
      await fetchEscrowData();
      setShowInvestForm(false);
    } catch (err) {
      console.error("Error investing:", err);
      setError(err.message || "Failed to invest");
      setSnackbar({
        open: true,
        message: "Investment failed: " + (err.message || "Unknown error"),
        severity: "error"
      });
    } finally {
      setIsInvesting(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!userWalletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsRefunding(true);
      setError(null);
      
      // Show processing notification
      setSnackbar({
        open: true,
        message: "Processing refund request...",
        severity: "info"
      });

      const result = await escrowService.claimRefund(userWalletAddress);
      console.log("Refund result:", result);
      
      if (result.transactionHash) {
        try {
          // Wait for the transaction to be mined
          await waitForTransaction(PROVIDER_URL, result.transactionHash);
          
          // Show success message
          setSnackbar({
            open: true,
            message: "Refund request processed successfully! Funds will be credited to your wallet soon.",
            severity: "success"
          });
        } catch (txError) {
          console.error("Transaction error:", txError);
          setSnackbar({
            open: true,
            message: "Transaction failed to confirm!",
            severity: "error"
          });
        }
      }

      // Refetch data after refund
      await fetchEscrowData();
    } catch (err) {
      console.error("Error claiming refund:", err);
      setError(err.message || "Failed to claim refund");
      setSnackbar({
        open: true,
        message: "Refund request failed: " + (err.message || "Unknown error"),
        severity: "error"
      });
    } finally {
      setIsRefunding(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userWalletAddress) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Connect your wallet to view your escrow investment details.
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!campaignData) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No active escrow campaign found.
      </Alert>
    );
  }

  const calculateProgress = () => {
    if (!campaignData) return 0;
    return Math.min(100, (parseFloat(campaignData.raised) / parseFloat(campaignData.goal)) * 100);
  };

  const getCampaignStatus = () => {
    if (!campaignData) return 'Unknown';
    if (!campaignData.isFinalized) return 'Active';
    return campaignData.isSuccessful ? 'Successful' : 'Failed';
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Active':
        return <Chip icon={<AccessTime />} label="Active" color="primary" size="small" />;
      case 'Successful':
        return <Chip icon={<Check />} label="Successful" color="success" size="small" />;
      case 'Failed':
        return <Chip icon={<Close />} label="Failed" color="error" size="small" />;
      default:
        return <Chip icon={<Warning />} label="Unknown" color="default" size="small" />;
    }
  };

  const getRemainingTimeText = () => {
    if (!campaignData || campaignData.isFinalized) return 'Campaign ended';
    
    const secondsRemaining = campaignData.remainingTimeInSeconds;
    if (secondsRemaining <= 0) return 'Ended, awaiting finalization';
    
    const days = Math.floor(secondsRemaining / 86400);
    const hours = Math.floor((secondsRemaining % 86400) / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Campaign Summary */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>Campaign Status</Typography>
            {getStatusChip(getCampaignStatus())}
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {`${calculateProgress().toFixed(1)}% Funded`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`${campaignData.raised} / ${campaignData.goal} USDC`}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={calculateProgress()} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Time Remaining:</Typography>
              <Typography variant="body1">{getRemainingTimeText()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Status:</Typography>
              <Typography variant="body1">{getCampaignStatus()}</Typography>
            </Grid>
          </Grid>
          
          {!campaignData.isFinalized && !showInvestForm && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<ArrowUpward />}
              fullWidth 
              sx={{ mt: 2 }}
              onClick={() => setShowInvestForm(true)}
            >
              Invest in This Property
            </Button>
          )}
          
          {showInvestForm && (
            <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Invest in Property Escrow</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <input 
                  type="number" 
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    marginRight: '8px',
                    width: '100%'
                  }}
                  min="1"
                  step="1"
                />
                <Typography sx={{ ml: 1, mr: 2 }}>USDC</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled={isInvesting || !investAmount} 
                  onClick={handleInvest}
                  sx={{ flex: 1 }}
                >
                  {isInvesting ? 'Processing...' : 'Confirm Investment'}
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => setShowInvestForm(false)}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
          
          {campaignData.isFinalized && !campaignData.isSuccessful && investorData && parseFloat(investorData.amount) > 0 && !investorData.refunded && (
            <Button 
              variant="contained" 
              color="warning" 
              startIcon={<AccountBalanceWallet />}
              fullWidth 
              sx={{ mt: 2 }}
              onClick={handleClaimRefund}
              disabled={isRefunding}
            >
              {isRefunding ? 'Processing...' : 'Claim Refund'}
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Investor Summary */}
      {investorData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Your Investment</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Amount Invested:</Typography>
                <Typography variant="h6">{investorData.amount} USDC</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Status:</Typography>
                <Typography variant="h6">
                  {investorData.refunded ? 'Refunded' : (campaignData.isSuccessful ? 'Active' : 'Awaiting Result')}
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Your Wallet:</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {userWalletAddress}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Milestones */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Project Milestones</Typography>
          
          <List>
            {milestones.map((milestone, index) => (
              <React.Fragment key={milestone.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{milestone.title}</Typography>
                        <Box>
                          {milestone.isApproved ? (
                            <Chip 
                              size="small" 
                              icon={<Check />} 
                              label="Approved" 
                              color="success"
                              sx={{ mr: 1 }}
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              icon={<AccessTime />} 
                              label="Pending" 
                              color="default"
                              sx={{ mr: 1 }}
                            />
                          )}
                          
                          {milestone.isReleased ? (
                            <Chip 
                              size="small" 
                              icon={<Payments />} 
                              label="Released" 
                              color="info"
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              icon={<AccessTime />} 
                              label="Upcoming" 
                              color="default"
                            />
                          )}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                          {milestone.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Amount: {milestone.amount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Release Date: {milestone.releaseDate}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
      
      {/* Snackbar for transaction feedback */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Box>
  );
};

export default EscrowDashboard;