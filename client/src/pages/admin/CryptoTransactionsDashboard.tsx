import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Card, CardContent, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Chip, TextField, MenuItem, IconButton,
  Alert, Tabs, Tab, Divider, CircularProgress, Grid as MuiGrid
} from '@mui/material';
import { 
  Download, Search, FilterList, Refresh, 
  AttachMoney, ShowChart, AccountBalanceWallet,
  WarningAmber, CheckCircle, Cancel, 
  CurrencyBitcoin
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatDistance } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Status colors for transactions
const statusColors: Record<string, string> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  confirmed: 'success',
  failed: 'error',
  expired: 'default',
  refunded: 'secondary'
};

// Status icons for transactions
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
    case 'confirmed':
      return <CheckCircle fontSize="small" color="success" />;
    case 'failed':
      return <Cancel fontSize="small" color="error" />;
    case 'pending':
    case 'processing':
      return <CircularProgress size={16} />;
    case 'expired':
    case 'refunded':
      return <WarningAmber fontSize="small" color="warning" />;
    default:
      return null;
  }
};

// Format currency with currency symbol
const formatCurrency = (amount: number, currency: string) => {
  if (currency === 'USDC' || currency === 'USDT') {
    return `${amount.toFixed(2)} ${currency}`;
  } else if (currency === 'ETH' || currency === 'BTC') {
    return `${amount.toFixed(6)} ${currency}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
};

// Format date as relative time (e.g. "2 hours ago")
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistance(date, new Date(), { addSuffix: true });
};

// Dashboard stats card component
const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <Card sx={{ height: '100%', bgcolor: `${color}.light` }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function CryptoTransactionsDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all crypto transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/admin/crypto/transactions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/crypto/transactions');
      return response.json();
    }
  });

  // Fetch wallet balances
  const { data: walletBalances } = useQuery({
    queryKey: ['/api/admin/crypto/balances'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/crypto/balances');
      return response.json();
    }
  });

  // Process refund mutation
  const refundMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await apiRequest('POST', '/api/admin/crypto/refund', {
        transactionId,
        reason: 'Admin initiated refund'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Refund processed',
        description: 'The transaction has been refunded successfully',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto/transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Refund failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Handle refund action
  const handleRefund = (transactionId: string) => {
    if (window.confirm('Are you sure you want to refund this transaction?')) {
      refundMutation.mutate(transactionId);
    }
  };

  // Export transactions as CSV
  const exportTransactionsCSV = () => {
    if (!transactions?.transactions) return;
    
    // Prepare CSV headers
    const headers = [
      'ID', 'User ID', 'Property ID', 'Amount', 'Currency',
      'Status', 'Network', 'Wallet Address', 'Created At'
    ].join(',');
    
    // Prepare CSV rows
    const rows = transactions.transactions.map((tx: any) => [
      tx.id,
      tx.userId,
      tx.propertyId,
      tx.amount,
      tx.currency,
      tx.status,
      tx.network,
      tx.walletAddress,
      new Date(tx.createdAt).toISOString()
    ].join(','));
    
    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crypto-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter transactions based on search, status, and currency filters
  const filteredTransactions = transactions?.transactions
    ? transactions.transactions.filter((tx: any) => {
        const matchesSearch = 
          searchTerm === '' || 
          tx.id.includes(searchTerm) || 
          tx.txHash?.includes(searchTerm) ||
          tx.userId.toString().includes(searchTerm);
        
        const matchesStatus = 
          statusFilter === 'all' || 
          tx.status === statusFilter;
        
        const matchesCurrency = 
          currencyFilter === 'all' || 
          tx.currency === currencyFilter;
        
        return matchesSearch && matchesStatus && matchesCurrency;
      })
    : [];

  // Calculate dashboard statistics
  const stats = {
    totalTransactions: filteredTransactions.length,
    totalVolume: filteredTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0),
    pendingTransactions: filteredTransactions.filter((tx: any) => 
      tx.status === 'pending' || tx.status === 'processing'
    ).length,
    completedTransactions: filteredTransactions.filter((tx: any) => 
      tx.status === 'completed' || tx.status === 'confirmed'
    ).length,
    failedTransactions: filteredTransactions.filter((tx: any) => 
      tx.status === 'failed' || tx.status === 'expired'
    ).length
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Refresh data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto/transactions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto/balances'] });
  };

  // Currencies available for filtering (derive from transactions)
  const availableCurrencies = transactions?.transactions
    ? Array.from(new Set(transactions.transactions.map((tx: any) => tx.currency)))
    : [];

  // Status options available for filtering
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'failed', label: 'Failed' },
    { value: 'expired', label: 'Expired' },
    { value: 'refunded', label: 'Refunded' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Crypto Transactions Dashboard
        </Typography>
        
        <Button 
          variant="outlined" 
          color="primary"
          startIcon={<CurrencyBitcoin />}
          component="a"
          href="/admin/crypto-integration"
        >
          Crypto Integration Setup
        </Button>
      </Box>

      {/* Stats Cards */}
      <MuiGrid container spacing={3} sx={{ mb: 4 }}>
        <MuiGrid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions.toString()}
            icon={<AccountBalanceWallet fontSize="large" />}
            color="primary"
          />
        </MuiGrid>
        <MuiGrid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Volume"
            value={`$${stats.totalVolume.toFixed(2)}`}
            icon={<AttachMoney fontSize="large" />}
            color="success"
          />
        </MuiGrid>
        <MuiGrid item xs={12} sm={4} md={2.4}>
          <StatCard
            title="Pending"
            value={stats.pendingTransactions.toString()}
            icon={<ShowChart fontSize="large" />}
            color="warning"
          />
        </MuiGrid>
        <MuiGrid item xs={12} sm={4} md={2.4}>
          <StatCard
            title="Completed"
            value={stats.completedTransactions.toString()}
            icon={<CheckCircle fontSize="large" />}
            color="success"
          />
        </MuiGrid>
        <MuiGrid item xs={12} sm={4} md={2.4}>
          <StatCard
            title="Failed"
            value={stats.failedTransactions.toString()}
            icon={<Cancel fontSize="large" />}
            color="error"
          />
        </MuiGrid>
      </MuiGrid>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Transactions" />
          <Tab label="Wallet Balances" />
          <Tab label="Alerts & Settings" />
        </Tabs>
      </Box>

      {/* Transactions Tab */}
      {tabValue === 0 && (
        <>
          {/* Filters and Actions */}
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Search transactions"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
              }}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
            
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: <FilterList fontSize="small" sx={{ mr: 1 }} />,
              }}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="Currency"
              variant="outlined"
              size="small"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Currencies</MenuItem>
              {availableCurrencies.map((currency: string) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={exportTransactionsCSV}
            >
              Export CSV
            </Button>
            
            <IconButton onClick={refreshData} color="primary">
              <Refresh />
            </IconButton>
          </Box>

          {/* Transactions Table */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Network</TableCell>
                    <TableCell>Wallet Address</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx: any) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {tx.id.substring(0, 8)}...
                            {tx.txHash && (
                              <Chip 
                                label={`TX: ${tx.txHash.substring(0, 6)}...`} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{tx.userId}</TableCell>
                        <TableCell>{formatCurrency(tx.amount, tx.currency)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StatusIcon status={tx.status} />
                            <Chip 
                              label={tx.status.toUpperCase()} 
                              size="small"
                              color={statusColors[tx.status] as any || 'default'}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{tx.network}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {tx.walletAddress.substring(0, 10)}...
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => setSelectedTransaction(tx.id)}
                          >
                            View
                          </Button>
                          {(tx.status === 'completed' || tx.status === 'confirmed') && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              sx={{ ml: 1 }}
                              onClick={() => handleRefund(tx.id)}
                            >
                              Refund
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body1" sx={{ py: 3 }}>
                          No transactions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Transaction details view (when a transaction is selected) */}
          {selectedTransaction && transactions?.transactions && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Transaction Details</Typography>
                  <Button 
                    size="small" 
                    onClick={() => setSelectedTransaction(null)}
                  >
                    Close
                  </Button>
                </Box>
                
                {(() => {
                  const tx = transactions.transactions.find((t: any) => t.id === selectedTransaction);
                  if (!tx) return <Alert severity="error">Transaction not found</Alert>;
                  
                  return (
                    <MuiGrid container spacing={2}>
                      <MuiGrid item xs={12} md={6}>
                        <Typography variant="subtitle2">Transaction ID</Typography>
                        <Typography variant="body1" gutterBottom>{tx.id}</Typography>
                        
                        <Typography variant="subtitle2">User ID</Typography>
                        <Typography variant="body1" gutterBottom>{tx.userId}</Typography>
                        
                        <Typography variant="subtitle2">Property ID</Typography>
                        <Typography variant="body1" gutterBottom>{tx.propertyId}</Typography>
                        
                        <Typography variant="subtitle2">Amount</Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatCurrency(tx.amount, tx.currency)}
                        </Typography>
                        
                        <Typography variant="subtitle2">Status</Typography>
                        <Chip 
                          label={tx.status.toUpperCase()} 
                          color={statusColors[tx.status] as any || 'default'}
                          sx={{ my: 1 }}
                        />
                      </MuiGrid>
                      
                      <MuiGrid item xs={12} md={6}>
                        <Typography variant="subtitle2">Network</Typography>
                        <Typography variant="body1" gutterBottom>{tx.network}</Typography>
                        
                        <Typography variant="subtitle2">Wallet Address</Typography>
                        <Typography variant="body1" gutterBottom sx={{ wordBreak: 'break-all' }}>
                          {tx.walletAddress}
                        </Typography>
                        
                        {tx.txHash && (
                          <>
                            <Typography variant="subtitle2">Transaction Hash</Typography>
                            <Typography variant="body1" gutterBottom sx={{ wordBreak: 'break-all' }}>
                              {tx.txHash}
                            </Typography>
                          </>
                        )}
                        
                        <Typography variant="subtitle2">Created At</Typography>
                        <Typography variant="body1" gutterBottom>
                          {new Date(tx.createdAt).toLocaleString()}
                        </Typography>
                        
                        {tx.updatedAt && (
                          <>
                            <Typography variant="subtitle2">Last Updated</Typography>
                            <Typography variant="body1" gutterBottom>
                              {new Date(tx.updatedAt).toLocaleString()}
                            </Typography>
                          </>
                        )}
                      </MuiGrid>
                      
                      <MuiGrid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        
                        {(tx.status === 'completed' || tx.status === 'confirmed') && (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleRefund(tx.id)}
                            sx={{ mr: 2 }}
                          >
                            Process Refund
                          </Button>
                        )}
                        
                        {tx.status === 'pending' && (
                          <Button
                            variant="contained"
                            color="warning"
                            onClick={() => {
                              // Logic to cancel pending transaction
                              alert('Cancel transaction functionality to be implemented');
                            }}
                          >
                            Cancel Transaction
                          </Button>
                        )}
                      </MuiGrid>
                    </MuiGrid>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Wallet Balances Tab */}
      {tabValue === 1 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Wallet Balances</Typography>
            <Button 
              startIcon={<Refresh />}
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto/balances'] })}
            >
              Refresh Balances
            </Button>
          </Box>
          
          {!walletBalances?.balances ? (
            <CircularProgress />
          ) : (
            <MuiGrid container spacing={3}>
              {walletBalances.balances.map((balance: any) => (
                <MuiGrid item xs={12} sm={6} md={4} lg={3} key={balance.currency}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {balance.currency}
                      </Typography>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {balance.balance.toFixed(balance.currency === 'ETH' || balance.currency === 'BTC' ? 6 : 2)}
                      </Typography>
                      
                      {balance.pendingBalance > 0 && (
                        <Chip 
                          label={`Pending: ${balance.pendingBalance.toFixed(2)}`} 
                          color="warning"
                          size="small"
                        />
                      )}
                      
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => alert('Transaction history view to be implemented')}
                        >
                          View History
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </MuiGrid>
              ))}
            </MuiGrid>
          )}
        </>
      )}

      {/* Alerts & Settings Tab */}
      {tabValue === 2 && (
        <>
          <Typography variant="h6" gutterBottom>
            Alert Settings
          </Typography>
          
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Email Notifications</Typography>
              
              <MuiGrid container spacing={3}>
                <MuiGrid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      High-Value Transactions
                    </Typography>
                    <TextField
                      label="Threshold Amount"
                      type="number"
                      defaultValue={1000}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Receive alert when transaction exceeds this amount
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Failed Transaction Alerts
                    </Typography>
                    <TextField
                      select
                      label="Alert Frequency"
                      defaultValue="immediately"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="immediately">Immediately</MenuItem>
                      <MenuItem value="hourly">Hourly Summary</MenuItem>
                      <MenuItem value="daily">Daily Summary</MenuItem>
                    </TextField>
                  </Box>
                </MuiGrid>
                
                <MuiGrid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Notification Recipients
                    </Typography>
                    <TextField
                      label="Email Addresses"
                      placeholder="Enter email addresses separated by commas"
                      defaultValue="admin@ireva.com"
                      fullWidth
                      multiline
                      rows={2}
                      sx={{ mb: 2 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Report Schedule
                    </Typography>
                    <TextField
                      select
                      label="Send Reports"
                      defaultValue="daily"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </TextField>
                  </Box>
                </MuiGrid>
              </MuiGrid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    toast({
                      title: 'Settings Saved',
                      description: 'Your notification settings have been updated',
                      variant: 'default'
                    });
                  }}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Typography variant="h6" gutterBottom>
            Export Options
          </Typography>
          
          <Card>
            <CardContent>
              <MuiGrid container spacing={3}>
                <MuiGrid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Transaction Reports
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => exportTransactionsCSV()}
                    >
                      Export All Transactions as CSV
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => alert('Export as PDF functionality to be implemented')}
                    >
                      Generate PDF Report
                    </Button>
                  </Box>
                </MuiGrid>
                
                <MuiGrid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Custom Date Range
                  </Typography>
                  
                  <TextField
                    label="Start Date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    label="End Date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => alert('Custom date range export to be implemented')}
                  >
                    Generate Custom Report
                  </Button>
                </MuiGrid>
              </MuiGrid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}