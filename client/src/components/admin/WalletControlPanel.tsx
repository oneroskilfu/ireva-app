import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon, 
  Paid as PaidIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { AdminLayout } from './AdminLayout';

// Define the wallet interface
interface Wallet {
  id: string;
  type: 'main' | 'escrow' | 'rewards';
  balance: number;
  currency: string;
}

// Define the transaction interface
interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed';
  date: string;
}

const WalletControlPanel = () => {
  // State for wallets and transactions
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // State for loading and error handling
  const [walletsLoading, setWalletsLoading] = useState<boolean>(true);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch wallet data
  const fetchWallets = async () => {
    setWalletsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/wallets');
      setWallets(response.data);
    } catch (err) {
      setError('Failed to load wallet data. Please try again later.');
      console.error('Error fetching wallets:', err);
    } finally {
      setWalletsLoading(false);
    }
  };

  // Function to fetch transaction data
  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/wallets/transactions');
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transaction data. Please try again later.');
      console.error('Error fetching transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Function to approve a transaction
  const approveTransaction = async (id: string) => {
    try {
      await axios.post(`/api/admin/wallets/transactions/${id}/approve`);
      
      // Update the transaction status in the UI without fetching again
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id 
            ? { ...transaction, status: 'completed' } 
            : transaction
        )
      );
    } catch (err) {
      setError('Failed to approve transaction. Please try again.');
      console.error('Error approving transaction:', err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, []);

  // Format currency for display
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency}${amount.toLocaleString('en-NG')}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get appropriate color for wallet type
  const getWalletTypeColor = (type: string) => {
    switch(type) {
      case 'main': return '#4CAF50';
      case 'escrow': return '#2196F3';
      case 'rewards': return '#FF9800';
      default: return '#757575';
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Platform Wallet Control Panel
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" gutterBottom sx={{ fontWeight: '500', mt: 2 }}>
          Wallet Overview
          <Button 
            startIcon={<RefreshIcon />} 
            size="small" 
            sx={{ ml: 2 }}
            onClick={() => fetchWallets()}
          >
            Refresh
          </Button>
        </Typography>

        {walletsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {wallets.map((wallet) => (
              <Grid item xs={12} sm={4} key={wallet.id}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    borderTop: `4px solid ${getWalletTypeColor(wallet.type)}`,
                    borderRadius: '8px',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        bgcolor: getWalletTypeColor(wallet.type), 
                        p: 1, 
                        borderRadius: '50%', 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AccountBalanceIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {wallet.type} Wallet
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {formatCurrency(wallet.balance, wallet.currency)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Wallet ID: {wallet.id}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Typography variant="h6" gutterBottom sx={{ fontWeight: '500', mt: 4 }}>
          Recent Platform Transactions
          <Button 
            startIcon={<RefreshIcon />} 
            size="small" 
            sx={{ ml: 2 }}
            onClick={() => fetchTransactions()}
          >
            Refresh
          </Button>
        </Typography>

        {transactionsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography sx={{ py: 2 }}>No transactions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PaidIcon 
                          sx={{ 
                            mr: 1, 
                            color: transaction.type === 'deposit' ? 'success.main' : 'info.main' 
                          }} 
                        />
                        <Typography sx={{ textTransform: 'capitalize' }}>
                          {transaction.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      ₦{transaction.amount.toLocaleString('en-NG')}
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={transaction.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      {transaction.status === 'pending' ? (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => approveTransaction(transaction.id)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          disabled
                        >
                          Completed
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Production Implementation Notes
          </Typography>
          <Paper sx={{ p: 2, bgcolor: '#f5f7ff' }}>
            <Typography variant="body2">
              <strong>For Production Environment:</strong>
              <ul>
                <li>Implement proper role-based access control for wallet management</li>
                <li>Add multi-factor authentication for transaction approvals</li>
                <li>Implement transaction logging for audit purposes</li>
                <li>Add withdrawal limits and approval thresholds</li>
                <li>Set up real-time notifications for high-value transactions</li>
                <li>Implement reconciliation tools for platform wallets</li>
              </ul>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default WalletControlPanel;