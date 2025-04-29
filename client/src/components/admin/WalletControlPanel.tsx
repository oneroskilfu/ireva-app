// client/src/components/admin/WalletControlPanel.tsx

import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead,
  TableRow, TableContainer, CircularProgress, Button, Stack
} from '@mui/material';
import axios from 'axios';

interface WalletData {
  id: string;
  type: 'main' | 'escrow' | 'rewards';
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed';
  date: string;
}

export default function WalletControlPanel() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [walletRes, txRes] = await Promise.all([
          axios.get('/api/admin/wallets'),
          axios.get('/api/admin/wallets/transactions')
        ]);
        setWallets(walletRes.data);
        setTransactions(txRes.data);
      } catch (err) {
        console.error('Wallet fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>Wallet Overview</Typography>
      <Stack direction="row" spacing={2} mb={4}>
        {wallets.map(wallet => (
          <Paper key={wallet.id} sx={{ p: 2, minWidth: 220 }}>
            <Typography variant="subtitle2" color="textSecondary">{wallet.type.toUpperCase()} Wallet</Typography>
            <Typography variant="h6">{wallet.currency} {wallet.balance.toLocaleString()}</Typography>
          </Paper>
        ))}
      </Stack>

      <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx.id}>
                <TableCell>{tx.type}</TableCell>
                <TableCell>₦{tx.amount.toLocaleString()}</TableCell>
                <TableCell>{tx.status}</TableCell>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  {tx.status === 'pending' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => alert(`Approve logic for ${tx.id}`)}
                    >
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}