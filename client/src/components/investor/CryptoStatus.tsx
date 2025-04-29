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
  useMediaQuery
} from '@mui/material';
import { CurrencyBitcoin } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Sample crypto wallet data
const cryptoTransactions = [
  {
    id: 1,
    type: 'deposit',
    amount: '500 USDC',
    date: 'Apr 18, 2025',
    txHash: '0x71C...F3a2',
    status: 'confirmed'
  },
  {
    id: 2,
    type: 'deposit',
    amount: '250 USDC',
    date: 'Mar 22, 2025',
    txHash: '0x38D...B6c4',
    status: 'confirmed'
  },
  {
    id: 3,
    type: 'deposit',
    amount: '130 USDT',
    date: 'Mar 5, 2025',
    txHash: '0x56E...A7d9',
    status: 'confirmed'
  }
];

// Card view for mobile displays
const CryptoStatusCards = () => (
  <Box>
    {cryptoTransactions.map((tx) => (
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
            <Typography variant="body1" fontWeight="medium">{tx.amount}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Date</Typography>
            <Typography variant="body1">{tx.date}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Typography 
              variant="body1" 
              color={tx.status === 'confirmed' ? 'success.main' : 'warning.main'}
            >
              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">TX Hash</Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'monospace'
              }}
            >
              {tx.txHash}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    ))}
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
        </TableRow>
      </TableHead>
      <TableBody>
        {cryptoTransactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
            </TableCell>
            <TableCell>{tx.amount}</TableCell>
            <TableCell>{tx.date}</TableCell>
            <TableCell 
              sx={{ 
                fontFamily: 'monospace',
                fontSize: '0.75rem'
              }}
            >
              {tx.txHash}
            </TableCell>
            <TableCell>
              <Typography 
                variant="body2" 
                color={tx.status === 'confirmed' ? 'success.main' : 'warning.main'}
              >
                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const CryptoStatus: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                USDC Balance
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                750 USDC
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                USDT Balance
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                130 USDT
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Recent Transactions
        </Typography>
        
        {isMobile ? <CryptoStatusCards /> : <CryptoStatusTable />}
      </CardContent>
    </Card>
  );
};

export default CryptoStatus;