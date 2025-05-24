import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Link,
  IconButton,
  Tooltip,
  CircularProgress,
  Skeleton,
  Badge,
  Alert
} from '@mui/material';
import { 
  Launch, 
  ContentCopy, 
  CheckCircle, 
  AccessTime, 
  Error as ErrorIcon,
  CurrencyExchange
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FaEthereum } from 'react-icons/fa';
import { SiTether } from 'react-icons/si';

// On-chain transaction type
interface OnChainTransaction {
  id: string;
  txHash: string;
  blockNumber?: number;
  timestamp: Date;
  network: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;
  gasUsed?: string;
  gasPrice?: string;
  fee?: string;
  nonce?: number;
  propertyId?: number;
  propertyName?: string;
  type: 'investment' | 'roi' | 'refund' | 'other';
  url?: string;
}

interface OnChainTransactionsProps {
  userId: number;
  limit?: number;
  showPropertyDetails?: boolean;
}

const OnChainTransactions: React.FC<OnChainTransactionsProps> = ({
  userId,
  limit = 5,
  showPropertyDetails = true
}) => {
  const { toast } = useToast();
  
  // Fetch user transactions
  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/crypto/transactions', userId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/crypto/transactions?userId=${userId}&limit=${limit}`);
      return await res.json();
    }
  });
  
  // Get explorer URL for a transaction
  const getExplorerUrl = (network: string, txHash: string): string => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txHash}`;
      case 'binance':
        return `https://bscscan.com/tx/${txHash}`;
      default:
        return '#';
    }
  };
  
  // Copy transaction hash to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
      variant: "default"
    });
  };
  
  // Get status chip config
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          icon: <CheckCircle fontSize="small" />, 
          color: 'success' as const,
          label: 'Confirmed'
        };
      case 'pending':
        return { 
          icon: <AccessTime fontSize="small" />, 
          color: 'warning' as const,
          label: 'Pending'
        };
      case 'failed':
        return { 
          icon: <ErrorIcon fontSize="small" />, 
          color: 'error' as const,
          label: 'Failed'
        };
      default:
        return { 
          icon: <AccessTime fontSize="small" />, 
          color: 'default' as const,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };
  
  // Format transaction timestamp
  const formatTimestamp = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get currency icon
  const getCurrencyIcon = (currency: string) => {
    switch (currency.toUpperCase()) {
      case 'ETH':
        return <FaEthereum />;
      case 'USDT':
      case 'USDC':
        return <SiTether />;
      default:
        return <CurrencyExchange />;
    }
  };
  
  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Render loading skeleton
  const renderSkeleton = () => {
    return Array(limit).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
      </TableRow>
    ));
  };
  
  // Main render
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            On-Chain Transactions
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <CurrencyExchange />
            </IconButton>
          </Tooltip>
        </Box>
        
        {error ? (
          <Alert severity="error">Failed to load transaction data</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Network</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                renderSkeleton()
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx: OnChainTransaction) => {
                  const statusChip = getStatusChip(tx.status);
                  const explorerUrl = getExplorerUrl(tx.network, tx.txHash);
                  
                  return (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Box display="flex" flexDirection="column">
                          <Typography variant="body2" fontFamily="monospace">
                            {formatAddress(tx.txHash)}
                          </Typography>
                          {showPropertyDetails && tx.propertyName && (
                            <Typography variant="caption" color="text.secondary">
                              {tx.type === 'investment' ? 'Investment in ' : 
                               tx.type === 'roi' ? 'ROI from ' : 
                               tx.type === 'refund' ? 'Refund from ' : ''}
                              {tx.propertyName}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTimestamp(tx.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={tx.network === 'ethereum' ? <FaEthereum /> : <FaEthereum />}
                          label={tx.network}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getCurrencyIcon(tx.currency)}
                          <Typography variant="body2" ml={0.5}>
                            {tx.amount} {tx.currency}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusChip.icon}
                          label={statusChip.label}
                          color={statusChip.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex">
                          <Tooltip title="Copy transaction hash">
                            <IconButton size="small" onClick={() => copyToClipboard(tx.txHash)}>
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View on blockchain explorer">
                            <IconButton 
                              size="small" 
                              component="a"
                              href={explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Launch fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>
                      No on-chain transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default OnChainTransactions;