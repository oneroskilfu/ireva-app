import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  Box,
  Chip,
  Link,
  CircularProgress
} from '@mui/material';
import { ExternalLink, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const WithdrawalHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchWithdrawalHistory();
  }, [user]);
  
  const fetchWithdrawalHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/withdrawals/investor');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load withdrawal history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get Explorer URL based on network and tx hash
  const getExplorerUrl = (network, txHash) => {
    if (!txHash) return null;
    
    switch (network) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`;
      case 'binance':
        return `https://bscscan.com/tx/${txHash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txHash}`;
      case 'solana':
        return `https://solscan.io/tx/${txHash}`;
      case 'avalanche':
        return `https://snowtrace.io/tx/${txHash}`;
      default:
        return null;
    }
  };
  
  // Get chip color and label based on status
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<Clock size={16} />} label="Pending" color="warning" size="small" />;
      case 'approved':
        return <Chip icon={<CheckCircle size={16} />} label="Approved" color="success" size="small" />;
      case 'processed':
        return <Chip icon={<CheckCircle size={16} />} label="Processed" color="success" size="small" />;
      case 'rejected':
        return <Chip icon={<XCircle size={16} />} label="Rejected" color="error" size="small" />;
      case 'failed':
        return <Chip icon={<AlertTriangle size={16} />} label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Format date as relative time
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (requests.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" mb={2}>Withdrawal History</Typography>
        <Typography variant="body1" color="text.secondary" align="center" py={4}>
          You have no withdrawal requests yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2, overflowX: 'auto' }}>
      <Typography variant="h6" mb={2}>Withdrawal History</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>Network</TableCell>
            <TableCell>Wallet</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Transaction</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((req) => {
            const explorerUrl = getExplorerUrl(req.network, req.txHash);
            
            return (
              <TableRow key={req.id} hover>
                <TableCell>{formatDate(req.requestedAt)}</TableCell>
                <TableCell>{req.amount}</TableCell>
                <TableCell>{req.currency}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {req.network}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {req.walletAddress}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(req.status)}</TableCell>
                <TableCell>
                  {req.txHash ? (
                    <Link
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      View <ExternalLink size={14} />
                    </Link>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default WithdrawalHistory;