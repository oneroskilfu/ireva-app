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
  Chip
} from '@mui/material';
import { 
  CompareArrows, 
  CallMade, 
  CallReceived, 
  AccountBalance
} from '@mui/icons-material';

// Sample transaction data
const transactions = [
  {
    id: 1,
    type: 'deposit',
    amount: '₦250,000',
    date: 'Apr 18, 2025',
    status: 'completed'
  },
  {
    id: 2,
    type: 'investment',
    amount: '₦500,000',
    date: 'Apr 12, 2025',
    property: 'Westfield Retail Center',
    status: 'completed'
  },
  {
    id: 3,
    type: 'roi',
    amount: '₦45,000',
    date: 'Apr 5, 2025',
    property: 'Lagos Heights',
    status: 'completed'
  },
  {
    id: 4,
    type: 'crypto_deposit',
    amount: '$850 USDC',
    date: 'Mar 28, 2025',
    status: 'completed'
  }
];

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
                      {transaction.amount}
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
                      {transaction.date}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;