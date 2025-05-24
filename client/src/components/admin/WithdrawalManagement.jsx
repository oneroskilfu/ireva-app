import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

const WithdrawalManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [txHashInputs, setTxHashInputs] = useState({});
  const [processorNotes, setProcessorNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/withdrawals/all');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load withdrawal requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: 'Copied!',
          description: 'Copied to clipboard',
          variant: 'default'
        });
      },
      (err) => {
        toast({
          title: 'Failed to copy',
          description: 'Could not copy text: ' + err,
          variant: 'destructive'
        });
      }
    );
  };

  const handleOpenDialog = (request, status) => {
    setCurrentRequest(request);
    setNewStatus(status);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentRequest(null);
    setNewStatus('');
  };

  const updateStatus = async () => {
    if (!currentRequest || !newStatus) return;

    const id = currentRequest.id;
    const txHash = txHashInputs[id] || '';
    const notes = processorNotes[id] || '';

    try {
      setLoading(true);
      await axios.post(`/api/withdrawals/update/${id}`, {
        status: newStatus,
        txHash,
        processorNotes: notes
      });
      
      await fetchWithdrawals();
      
      toast({
        title: 'Success',
        description: `Withdrawal request ${newStatus} successfully`,
        variant: 'default'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating withdrawal request:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update withdrawal request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get Explorer URL based on network and wallet address
  const getExplorerAddressUrl = (network, address) => {
    if (!address) return null;
    
    switch (network) {
      case 'ethereum':
        return `https://etherscan.io/address/${address}`;
      case 'binance':
        return `https://bscscan.com/address/${address}`;
      case 'polygon':
        return `https://polygonscan.com/address/${address}`;
      case 'solana':
        return `https://solscan.io/account/${address}`;
      case 'avalanche':
        return `https://snowtrace.io/address/${address}`;
      default:
        return null;
    }
  };

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy HH:mm:ss');
  };

  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Filter and search function
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      !searchQuery ||
      req.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.txHash && req.txHash.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading && requests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, overflowX: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Withdrawal Requests Management
      </Typography>

      {/* Filters and Search */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Search by email, username, or wallet"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search size={18} style={{ marginRight: 8 }} />
            }}
          />
        </Grid>
        <Grid item xs={8} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterStatus}
              label="Filter by Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="processed">Processed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={fetchWithdrawals}
            disabled={loading}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      {filteredRequests.length === 0 ? (
        <Alert severity="info">No withdrawal requests found.</Alert>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Network</TableCell>
              <TableCell>Wallet Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Transaction Hash</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((req) => {
              const walletExplorerUrl = getExplorerAddressUrl(req.network, req.walletAddress);
              const userName = 
                (req.user.firstName && req.user.lastName) 
                  ? `${req.user.firstName} ${req.user.lastName}`
                  : req.user.username;
              
              return (
                <TableRow key={req.id} hover>
                  <TableCell>
                    <Tooltip title={formatDate(req.requestedAt)}>
                      <span>{formatRelativeDate(req.requestedAt)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={req.user.email}>
                      <Typography variant="body2">{userName}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{req.amount}</TableCell>
                  <TableCell>{req.currency}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{req.network}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {req.walletAddress}
                      </Typography>
                      <Tooltip title="Copy address">
                        <IconButton 
                          size="small"
                          onClick={() => handleCopyToClipboard(req.walletAddress)}
                        >
                          <Copy size={14} />
                        </IconButton>
                      </Tooltip>
                      {walletExplorerUrl && (
                        <Tooltip title="View on explorer">
                          <IconButton 
                            size="small"
                            component="a"
                            href={walletExplorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={14} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(req.status)}</TableCell>
                  <TableCell>
                    {req.status === 'pending' ? (
                      <TextField
                        size="small"
                        placeholder="Tx Hash"
                        value={txHashInputs[req.id] || ''}
                        onChange={(e) =>
                          setTxHashInputs({ ...txHashInputs, [req.id]: e.target.value })
                        }
                        sx={{ width: 200 }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 120,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {req.txHash || 'N/A'}
                        </Typography>
                        {req.txHash && (
                          <>
                            <Tooltip title="Copy transaction hash">
                              <IconButton 
                                size="small"
                                onClick={() => handleCopyToClipboard(req.txHash)}
                              >
                                <Copy size={14} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {req.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenDialog(req, 'approved')}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleOpenDialog(req, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {req.status === 'approved' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog(req, 'processed')}
                      >
                        Mark Processed
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {newStatus === 'approved'
            ? 'Approve Withdrawal Request'
            : newStatus === 'rejected'
            ? 'Reject Withdrawal Request'
            : 'Update Withdrawal Status'}
        </DialogTitle>
        <DialogContent>
          {currentRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" mb={2}>
                {newStatus === 'approved'
                  ? 'Are you sure you want to approve this withdrawal request?'
                  : newStatus === 'rejected'
                  ? 'Are you sure you want to reject this withdrawal request?'
                  : 'Are you sure you want to update the status of this withdrawal request?'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">User:</Typography>
                  <Typography variant="body2">{currentRequest.user.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Amount:</Typography>
                  <Typography variant="body2">
                    {currentRequest.amount} {currentRequest.currency}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Wallet Address:</Typography>
                  <Typography variant="body2">{currentRequest.walletAddress}</Typography>
                </Grid>

                {newStatus === 'approved' || newStatus === 'processed' ? (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Transaction Hash"
                      value={txHashInputs[currentRequest.id] || ''}
                      onChange={(e) =>
                        setTxHashInputs({
                          ...txHashInputs,
                          [currentRequest.id]: e.target.value
                        })
                      }
                      margin="dense"
                      helperText={`Enter the ${currentRequest.network} transaction hash`}
                    />
                  </Grid>
                ) : null}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={processorNotes[currentRequest.id] || ''}
                    onChange={(e) =>
                      setProcessorNotes({
                        ...processorNotes,
                        [currentRequest.id]: e.target.value
                      })
                    }
                    margin="dense"
                    helperText="Add any processing notes (visible to admins only)"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={updateStatus} 
            variant="contained"
            color={
              newStatus === 'approved' || newStatus === 'processed'
                ? 'success'
                : newStatus === 'rejected'
                ? 'error'
                : 'primary'
            }
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WithdrawalManagement;