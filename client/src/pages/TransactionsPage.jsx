import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GetAppIcon from '@mui/icons-material/GetApp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MainLayout from '../components/layouts/MainLayout';

// Mock transaction data
const transactions = [
  {
    id: 'TX123456789',
    date: '2025-04-28T14:30:00',
    type: 'Investment',
    amount: 2500.00,
    currency: 'USD',
    status: 'completed',
    propertyName: 'Lagos Heights Apartment',
    method: 'Credit Card'
  },
  {
    id: 'TX123456788',
    date: '2025-04-26T11:45:00',
    type: 'Deposit',
    amount: 5000.00,
    currency: 'USD',
    status: 'completed',
    propertyName: null,
    method: 'Bank Transfer'
  },
  {
    id: 'TX123456787',
    date: '2025-04-24T09:15:00',
    type: 'ROI Payment',
    amount: 120.50,
    currency: 'USD',
    status: 'completed',
    propertyName: 'Abuja Commercial Plaza',
    method: 'Wallet'
  },
  {
    id: 'TX123456786',
    date: '2025-04-20T16:22:00',
    type: 'Withdrawal',
    amount: 1000.00,
    currency: 'USD',
    status: 'pending',
    propertyName: null,
    method: 'Bank Transfer'
  },
  {
    id: 'TX123456785',
    date: '2025-04-18T13:10:00',
    type: 'Investment',
    amount: 1500.00,
    currency: 'USD',
    status: 'completed',
    propertyName: 'Cape Town Residential Complex',
    method: 'Crypto (USDC)'
  },
  {
    id: 'TX123456784',
    date: '2025-04-15T10:05:00',
    type: 'Deposit',
    amount: 3000.00,
    currency: 'USD',
    status: 'completed',
    propertyName: null,
    method: 'Credit Card'
  },
  {
    id: 'TX123456783',
    date: '2025-04-10T08:45:00',
    type: 'ROI Payment',
    amount: 85.75,
    currency: 'USD',
    status: 'completed',
    propertyName: 'Lagos Heights Apartment',
    method: 'Wallet'
  },
  {
    id: 'TX123456782',
    date: '2025-04-05T14:30:00',
    type: 'Withdrawal',
    amount: 500.00,
    currency: 'USD',
    status: 'failed',
    propertyName: null,
    method: 'Bank Transfer'
  },
];

function TransactionsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleTypeFilter = (e) => {
    setFilterType(e.target.value);
    setPage(0);
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setPage(0);
  };

  const handleMethodFilter = (e) => {
    setFilterMethod(e.target.value);
    setPage(0);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    const searchMatch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (transaction.propertyName && transaction.propertyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    
    // Status filter
    const statusMatch = filterStatus === 'all' || transaction.status === filterStatus;
    
    // Method filter
    const methodMatch = filterMethod === 'all' || transaction.method === filterMethod;
    
    return searchMatch && typeMatch && statusMatch && methodMatch;
  });

  // Get unique values for filters
  const transactionTypes = ['all', ...new Set(transactions.map(tx => tx.type))];
  const statusTypes = ['all', ...new Set(transactions.map(tx => tx.status))];
  const paymentMethods = ['all', ...new Set(transactions.map(tx => tx.method))];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
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

  return (
    <MainLayout>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Transaction History
      </Typography>
      
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search by ID or property"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: { xs: '60%', sm: '40%' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box>
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "contained" : "outlined"}
              size="small"
              sx={{ mr: 1 }}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            
            <Button
              startIcon={<GetAppIcon />}
              variant="outlined"
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>
        
        {showFilters && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={handleTypeFilter}
                    label="Transaction Type"
                  >
                    {transactionTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={handleStatusFilter}
                    label="Status"
                  >
                    {statusTypes.map(status => (
                      <MenuItem key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={filterMethod}
                    onChange={handleMethodFilter}
                    label="Payment Method"
                  >
                    {paymentMethods.map(method => (
                      <MenuItem key={method} value={method}>
                        {method === 'all' ? 'All Methods' : method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>
                      <Typography 
                        color={transaction.type === 'Withdrawal' ? 'error.main' : 'success.main'}
                        fontWeight="medium"
                      >
                        {transaction.type === 'Withdrawal' ? '-' : '+'}
                        ${transaction.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)} 
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(transaction)}
                        title="View Details"
                      >
                        <InfoOutlinedIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        title="Download Receipt"
                      >
                        <ReceiptLongIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No transactions found matching your search criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Transaction Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedTransaction && (
          <>
            <DialogTitle>
              Transaction Details
              <IconButton
                onClick={() => setDetailsOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                &times;
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Transaction ID</Typography>
                  <Typography variant="body1">{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1">{formatDate(selectedTransaction.date)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{selectedTransaction.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)} 
                    color={getStatusColor(selectedTransaction.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="medium"
                    color={selectedTransaction.type === 'Withdrawal' ? 'error.main' : 'success.main'}
                  >
                    {selectedTransaction.type === 'Withdrawal' ? '-' : '+'}
                    ${selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body1">{selectedTransaction.method}</Typography>
                </Grid>
                
                {selectedTransaction.propertyName && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Property</Typography>
                    <Typography variant="body1">{selectedTransaction.propertyName}</Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Transaction Timeline
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Initiated</span>
                        <span>{formatDate(selectedTransaction.date)}</span>
                      </Typography>
                      {selectedTransaction.status === 'completed' && (
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                          <span>Completed</span>
                          <span>{formatDate(new Date(new Date(selectedTransaction.date).getTime() + 10 * 60000))}</span>
                        </Typography>
                      )}
                      {selectedTransaction.status === 'failed' && (
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                          <span>Failed</span>
                          <span>{formatDate(new Date(new Date(selectedTransaction.date).getTime() + 5 * 60000))}</span>
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button startIcon={<ReceiptLongIcon />} variant="contained">Download Receipt</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </MainLayout>
  );
}

export default TransactionsPage;