import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { toast } from '../../lib/toast';

// Define Transaction interface
interface Transaction {
  id: string;
  userId: string;
  amount: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'roi' | 'referral';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  createdAt: string;
  referenceId?: string;
}

interface WalletBalance {
  availableBalance: string;
  pendingBalance: string;
  totalInvestments: string;
  totalEarnings: string;
}

interface UserWalletDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const UserWalletDialog = ({ open, onClose, userId }: UserWalletDialogProps) => {
  // State for tabs and pagination
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualType, setManualType] = useState<'deposit' | 'withdrawal'>('deposit');

  // Initialize query client
  const queryClient = useQueryClient();

  // Fetch wallet balance
  const { data: walletBalance, isLoading: balanceLoading } = useQuery<WalletBalance>({
    queryKey: ['wallet-balance', userId],
    queryFn: () => apiRequest("GET", `/api/admin/users/${userId}/wallet`).then(res => res.json()),
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['wallet-transactions', userId, page, rowsPerPage, transactionTypeFilter],
    queryFn: () => 
      apiRequest(
        "GET", 
        `/api/admin/users/${userId}/transactions?page=${page + 1}&limit=${rowsPerPage}${transactionTypeFilter ? `&type=${transactionTypeFilter}` : ''}`
      ).then(res => res.json()),
  });

  // Add manual transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: (data: { amount: string; description: string; type: string }) => 
      apiRequest("POST", `/api/admin/users/${userId}/transactions`, data)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance', userId] });
      setManualAmount('');
      setManualDescription('');
      toast({
        title: "Transaction Added",
        description: "Manual transaction has been added successfully.",
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to add transaction.",
        variant: "destructive"
      });
    }
  });

  // Handle tab change
  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle adding manual transaction
  const handleAddTransaction = () => {
    // Basic validation
    if (!manualAmount || parseFloat(manualAmount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    addTransactionMutation.mutate({
      amount: manualAmount,
      description: manualDescription || `Manual ${manualType}`,
      type: manualType
    });
  };

  // Render transaction status chip
  const renderStatusChip = (status: string) => {
    let color: 'success' | 'error' | 'warning' | 'default' = 'default';
    
    switch (status) {
      case 'completed':
        color = 'success';
        break;
      case 'failed':
        color = 'error';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };

  // Render transaction type chip
  const renderTypeChip = (type: string) => {
    let color: 'primary' | 'secondary' | 'info' | 'success' | 'warning' = 'primary';
    
    switch (type) {
      case 'deposit':
        color = 'success';
        break;
      case 'withdrawal':
        color = 'warning';
        break;
      case 'investment':
        color = 'primary';
        break;
      case 'roi':
        color = 'info';
        break;
      case 'referral':
        color = 'secondary';
        break;
      default:
        color = 'primary';
    }
    
    return <Chip label={type} color={color} size="small" />;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Wallet Management
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleChangeTab} 
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Wallet Summary" />
            <Tab label="Transaction History" />
            <Tab label="Manual Transaction" />
          </Tabs>

          {/* Wallet Summary Tab */}
          <TabPanel value={tabValue} index={0}>
            {balanceLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : walletBalance ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Available Balance</Typography>
                    <Typography variant="h4" color="success.main">
                      ${parseFloat(walletBalance.availableBalance).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Pending Balance</Typography>
                    <Typography variant="h4" color="warning.main">
                      ${parseFloat(walletBalance.pendingBalance).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Total Investments</Typography>
                    <Typography variant="h4" color="primary.main">
                      ${parseFloat(walletBalance.totalInvestments).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Total Earnings</Typography>
                    <Typography variant="h4" color="info.main">
                      ${parseFloat(walletBalance.totalEarnings).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1" sx={{ my: 2 }}>
                No wallet information available.
              </Typography>
            )}
          </TabPanel>

          {/* Transaction History Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2, mt: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={transactionTypeFilter}
                  label="Transaction Type"
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                  <MenuItem value="withdrawal">Withdrawal</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="roi">ROI</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={30} sx={{ my: 3 }} />
                      </TableCell>
                    </TableRow>
                  ) : !transactions || transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" sx={{ py: 2 }}>
                          No transaction history found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {renderTypeChip(transaction.type)}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            color={['deposit', 'roi', 'referral'].includes(transaction.type) ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {['deposit', 'roi', 'referral'].includes(transaction.type) ? '+' : '-'}
                            ${parseFloat(transaction.amount).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{renderStatusChip(transaction.status)}</TableCell>
                        <TableCell>
                          {transaction.referenceId ? (
                            <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                              {transaction.referenceId}
                            </Typography>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={transactions?.length || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </TabPanel>

          {/* Manual Transaction Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add Manual Transaction
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Use this form to manually add funds to or remove funds from the user's wallet.
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Transaction Type</InputLabel>
                    <Select
                      value={manualType}
                      label="Transaction Type"
                      onChange={(e) => setManualType(e.target.value as 'deposit' | 'withdrawal')}
                    >
                      <MenuItem value="deposit">Deposit (Add Funds)</MenuItem>
                      <MenuItem value="withdrawal">Withdrawal (Remove Funds)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Amount"
                    fullWidth
                    type="number"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    InputProps={{
                      startAdornment: '$',
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder={`Manual ${manualType} by admin`}
                    helperText="Optional description for this transaction"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color={manualType === 'deposit' ? 'success' : 'warning'}
                    onClick={handleAddTransaction}
                    disabled={addTransactionMutation.isPending || !manualAmount || parseFloat(manualAmount) <= 0}
                    sx={{ mt: 2 }}
                  >
                    {addTransactionMutation.isPending ? (
                      <CircularProgress size={24} />
                    ) : (
                      manualType === 'deposit' ? 'Add Funds' : 'Remove Funds'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

export default UserWalletDialog;