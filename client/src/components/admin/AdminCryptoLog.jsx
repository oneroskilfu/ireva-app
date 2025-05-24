import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Chip
} from '@mui/material';
import axios from 'axios';

const statusColors = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  expired: 'error',
  canceled: 'default',
  new: 'info',
  paid: 'success',
  confirmed: 'success',
  invalid: 'error'
};

export default function AdminCryptoLog() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/crypto/transactions')
      .then(res => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load crypto transactions. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">Loading crypto transactions...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Crypto Transaction Logs</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Txn ID</TableCell>
              <TableCell>Investor</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Wallet</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No crypto transactions found</TableCell>
              </TableRow>
            ) : (
              transactions.map(txn => (
                <TableRow key={txn._id || txn.txnId}>
                  <TableCell>{txn.txnId}</TableCell>
                  <TableCell>{txn.investorName}</TableCell>
                  <TableCell>{txn.amount}</TableCell>
                  <TableCell>{txn.currency}</TableCell>
                  <TableCell>
                    <Chip 
                      label={txn.status} 
                      color={statusColors[txn.status] || 'default'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {txn.walletAddress ? (
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '120px'
                      }}>
                        {txn.walletAddress}
                      </Typography>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(txn.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}