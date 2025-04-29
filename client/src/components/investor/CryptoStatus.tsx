import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  Skeleton,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import { CurrencyBitcoin, OpenInNew, ArrowForward } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocation } from 'wouter';

interface CryptoBalance {
  usdcBalance: number;
  usdtBalance: number;
  totalUsdValue: number;
}

interface CryptoTransaction {
  id: number;
  type: string;
  amount: number;
  cryptoType: string;
  date: string;
  txHash: string;
  status: string;
  network: string;
}

// Format the transaction hash for display
const formatTxHash = (hash: string): string => {
  if (!hash) return '';
  return hash.length > 10 ? `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}` : hash;
};

// Format date to readable format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CryptoStatus: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [location, navigate] = useLocation();

  // Fetch crypto balance data
  const { data: balances, isLoading: balancesLoading, error: balancesError } = useQuery<CryptoBalance>({
    queryKey: ['/api/crypto/balances'],
    queryFn: async () => {
      const response = await axios.get('/api/crypto/balances');
      return response.data;
    },
    staleTime: 60000 // 1 minute
  });

  // Fetch crypto transactions data
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery<CryptoTransaction[]>({
    queryKey: ['/api/crypto/transactions/recent'],
    queryFn: async () => {
      const response = await axios.get('/api/crypto/transactions/recent', {
        params: { limit: 3 }
      });
      return response.data;
    },
    staleTime: 60000 // 1 minute
  });

  const isLoading = balancesLoading || transactionsLoading;
  const hasError = balancesError || transactionsError;

  if (hasError) {
    console.error('Error fetching crypto data:', balancesError || transactionsError);
  }

  // Format crypto amount for display
  const formatCryptoAmount = (amount: number, cryptoType: string): string => {
    return `${amount.toLocaleString()} ${cryptoType}`;
  };

  // Get color based on transaction status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'success.main';
      case 'pending':
      case 'processing':
        return 'warning.main';
      case 'failed':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  // Get blockchain explorer URL for transaction hash
  const getExplorerUrl = (txHash: string, network: string): string => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txHash}`;
      default:
        return `https://etherscan.io/tx/${txHash}`;
    }
  };

  // Card view for mobile displays
  const CryptoStatusCards = () => (
    <Box>
      {isLoading ? (
        // Skeleton loading state for cards
        [...Array(3)].map((_, index) => (
          <Box 
            key={index}
            sx={{
              p: 1.5,
              mb: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '&:last-child': { mb: 0 }
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Skeleton width={40} />
                <Skeleton width={60} />
              </Grid>
              <Grid item xs={6}>
                <Skeleton width={50} />
                <Skeleton width={70} />
              </Grid>
              <Grid item xs={6}>
                <Skeleton width={40} />
                <Skeleton width={80} />
              </Grid>
              <Grid item xs={6}>
                <Skeleton width={50} />
                <Skeleton width={70} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton width={60} />
                <Skeleton width={120} />
              </Grid>
            </Grid>
          </Box>
        ))
      ) : transactions && transactions.length > 0 ? (
        transactions.map((tx) => (
          <Box 
            key={tx.id}
            sx={{
              p: 1.5,
              mb: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '&:last-child': { mb: 0 }
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Amount</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatCryptoAmount(tx.amount, tx.cryptoType)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body1">{formatDate(tx.date)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography 
                  variant="body1" 
                  color={getStatusColor(tx.status)}
                >
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary">TX Hash</Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontFamily: 'monospace'
                      }}
                    >
                      {formatTxHash(tx.txHash)}
                    </Typography>
                  </Box>
                  <Tooltip title="View on blockchain explorer">
                    <IconButton 
                      size="small" 
                      onClick={() => window.open(getExplorerUrl(tx.txHash, tx.network), '_blank')}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ))
      ) : (
        <Box textAlign="center" py={2}>
          <Typography color="text.secondary">No crypto transactions found</Typography>
        </Box>
      )}
    </Box>
  );

  // Table view for desktop displays
  const CryptoStatusTable = () => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>TX Hash</TableCell>
            <TableCell>Status</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            // Skeleton loading state for table
            [...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={90} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={70} /></TableCell>
                <TableCell><Skeleton width={24} /></TableCell>
              </TableRow>
            ))
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </TableCell>
                <TableCell>{formatCryptoAmount(tx.amount, tx.cryptoType)}</TableCell>
                <TableCell>{formatDate(tx.date)}</TableCell>
                <TableCell 
                  sx={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                  }}
                >
                  {formatTxHash(tx.txHash)}
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color={getStatusColor(tx.status)}
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="View on blockchain explorer">
                    <IconButton 
                      size="small" 
                      onClick={() => window.open(getExplorerUrl(tx.txHash, tx.network), '_blank')}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="text.secondary">No crypto transactions found</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 2,
      boxShadow: (theme) => theme.shadows[3]
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2" fontWeight="bold">
            Crypto Status
          </Typography>
          <CurrencyBitcoin color="primary" />
        </Box>
        
        <Box mb={2}>
          <Grid container spacing={2}>
            {isLoading ? (
              // Skeleton loading state for balances
              <>
                <Grid item xs={6}>
                  <Skeleton width={100} />
                  <Skeleton width={90} height={40} />
                </Grid>
                <Grid item xs={6}>
                  <Skeleton width={100} />
                  <Skeleton width={90} height={40} />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    USDC Balance
                  </Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {balances ? formatCryptoAmount(balances.usdcBalance, 'USDC') : '0 USDC'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    USDT Balance
                  </Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {balances ? formatCryptoAmount(balances.usdtBalance, 'USDT') : '0 USDT'}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2">
            Recent Transactions
          </Typography>
          <Button 
            endIcon={<ArrowForward />} 
            size="small" 
            onClick={() => navigate('/crypto/transactions')}
          >
            View All
          </Button>
        </Box>
        
        {isMobile ? <CryptoStatusCards /> : <CryptoStatusTable />}
      </CardContent>
    </Card>
  );
};

export default CryptoStatus;