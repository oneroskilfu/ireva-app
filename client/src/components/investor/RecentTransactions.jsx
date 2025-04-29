import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button
} from '@mui/material';
import { ArrowUpward, ArrowDownward, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { useLocation } from 'wouter';

const statusColors = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  processing: 'info'
};

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [_, navigate] = useLocation();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/transactions/recent');
        setTransactions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recent transactions:', err);
        setError('Failed to load transaction data');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleViewAll = () => {
    navigate('/investor/transactions');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          Recent Transactions
        </Typography>
        <Button 
          variant="text" 
          color="primary" 
          endIcon={<Visibility />}
          onClick={handleViewAll}
          size="small"
        >
          View All
        </Button>
      </Box>
      
      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {transaction.type === 'deposit' ? (
                        <ArrowUpward fontSize="small" color="success" sx={{ mr: 1 }} />
                      ) : (
                        <ArrowDownward fontSize="small" color="error" sx={{ mr: 1 }} />
                      )}
                      {transaction.description}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: transaction.type === 'deposit' ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.status} 
                      color={statusColors[transaction.status] || 'default'} 
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No recent transactions
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RecentTransactions;