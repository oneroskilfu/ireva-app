import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs
} from '@mui/material';
import {
  AccountBalance,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  FileDownload,
  Check,
  Cancel,
  MoreVert,
  CurrencyExchange
} from '@mui/icons-material';

// Transaction type
type TransactionType = 'deposit' | 'withdrawal' | 'roi_payment';
type TransactionStatus = 'pending' | 'completed' | 'failed';

// Transaction interface
interface Transaction {
  id: number;
  userId: number;
  userName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string;
  paymentMethod?: string;
}

// Sample transaction data
const sampleTransactions: Transaction[] = [
  {
    id: 1,
    userId: 105,
    userName: 'John Adebayo',
    type: 'deposit',
    amount: 5000000,
    status: 'completed',
    date: '2025-04-28',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 2,
    userId: 87,
    userName: 'Sarah Okonkwo',
    type: 'withdrawal',
    amount: 1500000,
    status: 'pending',
    date: '2025-04-28',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 3,
    userId: 142,
    userName: 'Michael Ibrahim',
    type: 'roi_payment',
    amount: 350000,
    status: 'completed',
    date: '2025-04-27',
    paymentMethod: 'Platform Wallet'
  },
  {
    id: 4,
    userId: 67,
    userName: 'Chioma Eze',
    type: 'deposit',
    amount: 2500000,
    status: 'completed',
    date: '2025-04-26',
    paymentMethod: 'Card Payment'
  },
  {
    id: 5,
    userId: 129,
    userName: 'David Nwachukwu',
    type: 'withdrawal',
    amount: 750000,
    status: 'failed',
    date: '2025-04-25',
    paymentMethod: 'Bank Transfer'
  },
];

const AdminWalletPanel: React.FC = () => {
  // State for transaction filter
  const [transactionFilter, setTransactionFilter] = useState<string | null>(null);
  
  // State for transaction approval dialog
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Filtered transactions based on selected filter
  const filteredTransactions = transactionFilter
    ? sampleTransactions.filter(transaction => 
        transactionFilter === 'all' ? true : transaction.type === transactionFilter
      )
    : sampleTransactions;
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };
  
  // Get total balance and pending amounts
  const totalBalance = 45000000; // Fixed for demo
  const pendingDeposits = sampleTransactions
    .filter(t => t.type === 'deposit' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingWithdrawals = sampleTransactions
    .filter(t => t.type === 'withdrawal' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get transaction chip color and icon based on type
  const getTransactionChip = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return {
          label: 'Deposit',
          color: 'success' as const,
          icon: <ArrowDownward fontSize="small" />
        };
      case 'withdrawal':
        return {
          label: 'Withdrawal',
          color: 'error' as const,
          icon: <ArrowUpward fontSize="small" />
        };
      case 'roi_payment':
        return {
          label: 'ROI Payment',
          color: 'primary' as const,
          icon: <CurrencyExchange fontSize="small" />
        };
      default:
        return {
          label: 'Unknown',
          color: 'default' as const,
          icon: null
        };
    }
  };
  
  // Get status chip color based on status
  const getStatusChip = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };
  
  // Handle opening the transaction approval dialog
  const handleApprovalOpen = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setApprovalDialogOpen(true);
  };
  
  // Handle closing the transaction approval dialog
  const handleApprovalClose = () => {
    setApprovalDialogOpen(false);
    setSelectedTransaction(null);
  };
  
  // Handle approving a transaction
  const handleApproveTransaction = () => {
    // Handle transaction approval logic here
    console.log('Approving transaction', selectedTransaction);
    setApprovalDialogOpen(false);
  };
  
  // Handle rejecting a transaction
  const handleRejectTransaction = () => {
    // Handle transaction rejection logic here
    console.log('Rejecting transaction', selectedTransaction);
    setApprovalDialogOpen(false);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Platform Wallet
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            sx={{ mr: 1 }}
          >
            Export Report
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Platform Balance Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    borderRadius: '50%', 
                    bgcolor: 'primary.light', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AccountBalance sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">Platform Balance</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(totalBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Last updated: Today, 10:24 AM
              </Typography>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Pending Deposits</Typography>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 'medium' }}>
                    {formatCurrency(pendingDeposits)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Pending Withdrawals</Typography>
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 'medium' }}>
                    {formatCurrency(pendingWithdrawals)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Actions Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              
              <Tabs 
                value={transactionFilter} 
                onChange={(e, newValue) => setTransactionFilter(newValue)}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ mb: 2 }}
              >
                <Tab label="All Transactions" value={null} />
                <Tab label="Deposits" value="deposit" />
                <Tab label="Withdrawals" value="withdrawal" />
                <Tab label="ROI Payments" value="roi_payment" />
              </Tabs>
              
              <Box sx={{ maxHeight: 245, overflow: 'auto' }}>
                {filteredTransactions.slice(0, 5).map((transaction) => {
                  const { icon, label, color } = getTransactionChip(transaction.type);
                  return (
                    <Box 
                      key={transaction.id} 
                      sx={{ 
                        py: 1.5, 
                        px: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        '&:not(:last-child)': {
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        },
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          icon={icon}
                          label={label}
                          color={color}
                          size="small"
                          sx={{ mr: 2 }}
                        />
                        <Box>
                          <Typography variant="body2">
                            {transaction.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.date}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={transaction.type === 'withdrawal' ? 'error.main' : 'success.main'}
                          sx={{ mr: 2 }}
                        >
                          {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </Typography>
                        {getStatusChip(transaction.status)}
                        <IconButton 
                          size="small" 
                          sx={{ ml: 1 }}
                          onClick={() => handleApprovalOpen(transaction)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button size="small" color="primary">
                  View All Transactions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Transaction Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={handleApprovalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Transaction Details
          {selectedTransaction && (
            <Typography variant="subtitle2" color="text.secondary">
              ID: {selectedTransaction.id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Transaction Type</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTransactionChip(selectedTransaction.type).icon}
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {getTransactionChip(selectedTransaction.type).label}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box>
                  {getStatusChip(selectedTransaction.status)}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">User</Typography>
                <Typography variant="body2">{selectedTransaction.userName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">User ID</Typography>
                <Typography variant="body2">{selectedTransaction.userId}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Amount</Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  color={selectedTransaction.type === 'withdrawal' ? 'error.main' : 'success.main'}
                >
                  {selectedTransaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(selectedTransaction.amount)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <Typography variant="body2">{selectedTransaction.date}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                <Typography variant="body2">{selectedTransaction.paymentMethod}</Typography>
              </Grid>
              
              {selectedTransaction.status === 'pending' && (
                <Grid item xs={12}>
                  <TextField
                    label="Admin Notes"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add notes about this transaction"
                    sx={{ mt: 2 }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApprovalClose}>
            Close
          </Button>
          
          {selectedTransaction && selectedTransaction.status === 'pending' && (
            <>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<Cancel />}
                onClick={handleRejectTransaction}
              >
                Reject
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<Check />}
                onClick={handleApproveTransaction}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWalletPanel;