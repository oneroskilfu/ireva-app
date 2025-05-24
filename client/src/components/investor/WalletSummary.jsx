import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Divider, 
  IconButton, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  ArrowDownward, 
  ArrowUpward, 
  MoreVert, 
  History, 
  CreditCard,
  AccountBalance,
  Paid
} from '@mui/icons-material';

const WalletSummary = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleWithdrawOpen = () => {
    setWithdrawDialogOpen(true);
    handleMenuClose();
  };
  
  const handleWithdrawClose = () => {
    setWithdrawDialogOpen(false);
  };
  
  const handleDepositOpen = () => {
    setDepositDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDepositClose = () => {
    setDepositDialogOpen(false);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    // Handle withdrawal logic here
    handleWithdrawClose();
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    // Handle deposit logic here
    handleDepositClose();
  };

  return (
    <>
      <Card sx={{ 
        mt: 3, 
        boxShadow: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalanceWallet sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6">Wallet Balance</Typography>
            </Box>
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleDepositOpen}>
                <ArrowDownward fontSize="small" sx={{ mr: 1 }} />
                Deposit Funds
              </MenuItem>
              <MenuItem onClick={handleWithdrawOpen}>
                <ArrowUpward fontSize="small" sx={{ mr: 1 }} />
                Withdraw Funds
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <History fontSize="small" sx={{ mr: 1 }} />
                Transaction History
              </MenuItem>
            </Menu>
          </Box>
          
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>₦2,750,000</Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Last updated: Today, 10:24 AM
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Available</Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'medium' }}>₦2,750,000</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'medium' }}>₦0</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Locked</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'medium' }}>₦500,000</Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowDownward />}
              sx={{ flex: 1 }}
              onClick={handleDepositOpen}
            >
              Deposit
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowUpward />}
              sx={{ flex: 1 }}
              onClick={handleWithdrawOpen}
            >
              Withdraw
            </Button>
          </Stack>
        </CardContent>
      </Card>
      
      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onClose={handleWithdrawClose} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <form onSubmit={handleWithdrawSubmit}>
          <DialogContent>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Available Balance: <span style={{ fontWeight: 'bold' }}>₦2,750,000</span>
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                label="Amount to Withdraw"
                variant="outlined"
                type="number"
                fullWidth
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>,
                }}
              />
              
              <TextField
                label="Bank Account Number"
                variant="outlined"
                fullWidth
                required
              />
              
              <TextField
                label="Bank Name"
                variant="outlined"
                fullWidth
                required
                select
                defaultValue=""
              >
                <MenuItem value="access">Access Bank</MenuItem>
                <MenuItem value="gtb">GTBank</MenuItem>
                <MenuItem value="first">First Bank</MenuItem>
                <MenuItem value="zenith">Zenith Bank</MenuItem>
                <MenuItem value="uba">UBA</MenuItem>
              </TextField>
              
              <TextField
                label="Account Name"
                variant="outlined"
                fullWidth
                required
              />
            </Stack>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Withdrawals typically process within 1-3 business days. A verification SMS may be sent before processing large withdrawals.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleWithdrawClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Submit Withdrawal
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onClose={handleDepositClose} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 3 }}>
            Choose your preferred payment method:
          </Typography>
          
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <CreditCard sx={{ mr: 2, color: 'primary.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">Credit/Debit Card</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Instant deposit with Visa, Mastercard, or Verve
                  </Typography>
                </Box>
                <Chip label="Popular" color="primary" size="small" />
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">Bank Transfer</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manual transfer to our bank account
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Paid sx={{ mr: 2, color: 'primary.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">Cryptocurrency</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deposit using USDC, USDT, and other stablecoins
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDepositClose}>Cancel</Button>
          <Button variant="contained" color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletSummary;