import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Skeleton,
  Button
} from '@mui/material';
import { 
  CompareArrows, 
  CallMade, 
  CallReceived, 
  AccountBalance,
  ArrowForward
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocation } from 'wouter';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  property?: string;
  cryptoType?: string;
  transactionHash?: string;
}

// Format transactions for display
const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return <CallReceived style={{ color: '#4caf50' }} />;
    case 'investment':
      return <AccountBalance style={{ color: '#673ab7' }} />;
    case 'withdrawal':
      return <CallMade style={{ color: '#f44336' }} />;
    case 'roi':
      return <CallReceived style={{ color: '#2196f3' }} />;
    case 'crypto_deposit':
      return <CallReceived style={{ color: '#ff9800' }} />;
    default:
      return <CompareArrows />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const RecentTransactions: React.FC = () => {
  const [location, navigate] = useLocation();

  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
    queryFn: async () => {
      const response = await axios.get('/api/transactions/recent', {
        params: { limit: 5 }
      });
      return response.data;
    },
    staleTime: 60000 // 1 minute
  });

  // Format amount with appropriate currency symbol
  const formatAmount = (transaction: Transaction): string => {
    if (transaction.currency === 'NGN') {
      return `₦${transaction.amount.toLocaleString()}`;
    } else if (transaction.cryptoType) {
      return `$${transaction.amount.toLocaleString()} ${transaction.cryptoType}`;
    } else {
      return `${transaction.currency} ${transaction.amount.toLocaleString()}`;
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (error) {
    console.error('Error fetching recent transactions:', error);
  }

  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 2,
      boxShadow: (theme) => theme.shadows[3]
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2" fontWeight="bold">
            Recent Transactions
          </Typography>
          <CompareArrows color="primary" />
        </Box>
        
        {isLoading ? (
          // Skeleton loading state
          <List sx={{ width: '100%', p: 0 }}>
            {[...Array(4)].map((_, index) => (
              <ListItem 
                key={index}
                alignItems="flex-start"
                sx={{ 
                  py: 1.5, 
                  px: 0, 
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none',
                  } 
                }}
              >
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Skeleton width={80} />
                      <Skeleton width={60} height={24} />
                    </Box>
                  }
                  secondary={
                    <>
                      <Skeleton width={150} />
                      <Skeleton width={100} />
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : transactions && transactions.length > 0 ? (
          <>
            <List sx={{ width: '100%', p: 0 }}>
              {transactions.map((transaction) => (
                <ListItem 
                  key={transaction.id}
                  alignItems="flex-start"
                  sx={{ 
                    py: 1.5, 
                    px: 0, 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none',
                    } 
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.paper' }}>
                      {getTransactionIcon(transaction.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight="medium">
                          {formatAmount(transaction)}
                        </Typography>
                        <Chip 
                          label={transaction.status} 
                          size="small"
                          color={getStatusColor(transaction.status) as any}
                          sx={{ height: 24 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {transaction.property 
                            ? `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} - ${transaction.property}`
                            : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" component="div">
                          {formatDate(transaction.date)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button 
                endIcon={<ArrowForward />} 
                size="small" 
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            </Box>
          </>
        ) : (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary">No recent transactions found</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;