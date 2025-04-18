import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardMedia, CardActions,
  Grid, Button, Chip, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Stack, IconButton, ListItem, List, ListItemText,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Download, TrendingUp, AccountBalance, CalendarMonth, KeyboardArrowDown,
  Description, MonetizationOn, Refresh, ArrowCircleUp, SendOutlined,
  DescriptionOutlined, ReceiptLong
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

// Interfaces
interface Investment {
  id: number;
  amount: number;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  earnings: number;
  monthlyReturn: number;
  nextPayoutDate: string;
  property: Property;
  documents: Document[];
  payoutHistory: Payout[];
}

interface Property {
  id: number;
  name: string;
  location: string;
  description: string;
  type: string;
  imageUrl: string;
  targetReturn: string;
  term: number;
  totalFunding: number;
  currentFunding: number;
  daysLeft: number;
}

interface Document {
  id: number;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

interface Payout {
  id: number;
  amount: number;
  date: string;
  status: string;
}

interface ROISummary {
  totalInvested: number;
  totalEarnings: number;
  activeInvestments: number;
  averageROI: number;
  projectedAnnualReturn: number;
}

// API functions
const fetchInvestments = async () => {
  const response = await fetch('/api/investor/my-projects');
  if (!response.ok) {
    throw new Error('Failed to fetch investments');
  }
  return response.json();
};

const fetchInvestmentDetails = async (id: number) => {
  const response = await fetch(`/api/investor/investments/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch investment details');
  }
  return response.json();
};

const fetchROISummary = async () => {
  const response = await fetch('/api/investor/roi-summary');
  if (!response.ok) {
    throw new Error('Failed to fetch ROI summary');
  }
  return response.json();
};

const requestWithdrawal = async (data: { investmentId: number, amount: number, reason: string }) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/investor/withdrawal-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to request withdrawal');
  }
  
  return response.json();
};

// Main component
const MyInvestmentsDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [selectedInvestment, setSelectedInvestment] = useState<number | null>(null);
  const [withdrawalDialog, setWithdrawalDialog] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    investmentId: 0,
    amount: 0,
    reason: ''
  });
  
  // Status filter
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Queries
  const { 
    data: investments = [], 
    isLoading: investmentsLoading, 
    error: investmentsError 
  } = useQuery({
    queryKey: ['/api/investor/my-projects'],
    queryFn: fetchInvestments
  });
  
  const {
    data: selectedInvestmentDetails,
    isLoading: investmentDetailsLoading,
    error: investmentDetailsError
  } = useQuery({
    queryKey: ['/api/investor/investments', selectedInvestment],
    queryFn: () => selectedInvestment ? fetchInvestmentDetails(selectedInvestment) : Promise.resolve(null),
    enabled: !!selectedInvestment
  });
  
  const {
    data: roiSummary,
    isLoading: roiSummaryLoading,
    error: roiSummaryError
  } = useQuery({
    queryKey: ['/api/investor/roi-summary'],
    queryFn: fetchROISummary
  });
  
  // Mutations
  const withdrawalMutation = useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investor/my-projects'] });
      if (selectedInvestment) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/investor/investments', selectedInvestment] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/investor/roi-summary'] });
      
      setWithdrawalDialog(false);
      toast({
        title: 'Withdrawal requested',
        description: 'Your withdrawal request has been submitted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to request withdrawal',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Event handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedInvestment(null);
  };
  
  const handleOpenWithdrawalDialog = (investmentId: number, currentEarnings: number) => {
    setWithdrawalForm({
      investmentId,
      amount: currentEarnings,
      reason: ''
    });
    setWithdrawalDialog(true);
  };
  
  const handleWithdrawalFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setWithdrawalForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmitWithdrawal = () => {
    withdrawalMutation.mutate(withdrawalForm);
  };
  
  const viewInvestmentDetails = (id: number) => {
    setSelectedInvestment(id);
    setTabValue(1);
  };
  
  // Filter investments
  const filteredInvestments = investments.filter((investment: Investment) => {
    return statusFilter === 'all' || investment.status === statusFilter;
  });
  
  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };
  
  // Loading and error states
  if (investmentsLoading || roiSummaryLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (investmentsError || roiSummaryError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading your investments: {((investmentsError || roiSummaryError) as Error).message}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Investment Portfolio
      </Typography>
      
      {/* ROI Summary Cards */}
      {roiSummary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={6} sm={4} lg={2.4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Total Invested
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold">
                  ₦{roiSummary.totalInvested.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={6} sm={4} lg={2.4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Total Earnings
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold" color="success.main">
                  ₦{roiSummary.totalEarnings.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={6} sm={4} lg={2.4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Active Investments
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {roiSummary.activeInvestments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={6} sm={6} lg={2.4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Average ROI
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {roiSummary.averageROI.toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={6} sm={6} lg={2.4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Projected Annual Return
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold" color="primary.main">
                  ₦{roiSummary.projectedAnnualReturn.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="My Investments" />
          <Tab label="Investment Details" disabled={!selectedInvestment} />
        </Tabs>
      </Box>
      
      {/* Investments Overview Tab */}
      {tabValue === 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Investment Portfolio</Typography>
            
            <Box>
              <Button
                onClick={() => setStatusFilter('all')}
                variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                size="small"
                sx={{ mx: 0.5 }}
              >
                All
              </Button>
              <Button
                onClick={() => setStatusFilter('active')}
                variant={statusFilter === 'active' ? 'contained' : 'outlined'}
                color="success"
                size="small"
                sx={{ mx: 0.5 }}
              >
                Active
              </Button>
              <Button
                onClick={() => setStatusFilter('pending')}
                variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
                color="warning"
                size="small"
                sx={{ mx: 0.5 }}
              >
                Pending
              </Button>
              <Button
                onClick={() => setStatusFilter('completed')}
                variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
                color="info"
                size="small"
                sx={{ mx: 0.5 }}
              >
                Completed
              </Button>
            </Box>
          </Box>
          
          {filteredInvestments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>No investments found</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't made any investments yet. Browse available properties to start investing!
              </Typography>
              <Button variant="contained" color="primary" href="/properties">
                Browse Properties
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredInvestments.map((investment: Investment) => (
                <Grid key={investment.id} xs={12} md={6} lg={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={investment.property.imageUrl}
                      alt={investment.property.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div" noWrap>
                          {investment.property.name}
                        </Typography>
                        <Chip 
                          label={investment.status} 
                          size="small"
                          color={getStatusColor(investment.status) as any}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {investment.property.location} • {investment.property.type}
                      </Typography>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Investment:</Typography>
                          <Typography variant="body2" fontWeight="medium">₦{investment.amount.toLocaleString()}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Earnings:</Typography>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            ₦{investment.earnings.toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">ROI to Date:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {((investment.earnings / investment.amount) * 100).toFixed(2)}%
                          </Typography>
                        </Box>
                        
                        {investment.nextPayoutDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Next Payout:</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {new Date(investment.nextPayoutDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => viewInvestmentDetails(investment.id)}
                        startIcon={<TrendingUp />}
                        fullWidth
                      >
                        View Details
                      </Button>
                      
                      {investment.status === 'active' && investment.earnings > 0 && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="success"
                          onClick={() => handleOpenWithdrawalDialog(investment.id, investment.earnings)}
                          startIcon={<AccountBalance />}
                          fullWidth
                        >
                          Withdraw Earnings
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {/* Investment Details Tab */}
      {tabValue === 1 && selectedInvestment && (
        <>
          {investmentDetailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : investmentDetailsError ? (
            <Alert severity="error" sx={{ m: 2 }}>
              Error loading investment details: {(investmentDetailsError as Error).message}
            </Alert>
          ) : selectedInvestmentDetails && (
            <>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Investment Details: {selectedInvestmentDetails.property.name}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setTabValue(0)}
                >
                  Back to Investments
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                {/* Property Overview */}
                <Grid xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={selectedInvestmentDetails.property.imageUrl}
                      alt={selectedInvestmentDetails.property.name}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {selectedInvestmentDetails.property.name}
                      </Typography>
                      
                      <Typography variant="body2" paragraph>
                        {selectedInvestmentDetails.property.description}
                      </Typography>
                      
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Location:</Typography>
                          <Typography variant="body2">{selectedInvestmentDetails.property.location}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Type:</Typography>
                          <Chip label={selectedInvestmentDetails.property.type} size="small" />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Target Return:</Typography>
                          <Typography variant="body2">{selectedInvestmentDetails.property.targetReturn}%</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Term:</Typography>
                          <Typography variant="body2">{selectedInvestmentDetails.property.term} months</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Funding Progress:</Typography>
                          <Typography variant="body2">
                            {Math.round((selectedInvestmentDetails.property.currentFunding / selectedInvestmentDetails.property.totalFunding) * 100)}%
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          fullWidth
                          color="primary"
                          href={`/property/${selectedInvestmentDetails.property.id}`}
                        >
                          View Property
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Investment Details */}
                <Grid xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Investment Information
                      </Typography>
                      
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Status:</Typography>
                          <Chip 
                            label={selectedInvestmentDetails.status} 
                            size="small"
                            color={getStatusColor(selectedInvestmentDetails.status) as any}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Investment Date:</Typography>
                          <Typography variant="body2">
                            {new Date(selectedInvestmentDetails.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Investment Amount:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            ₦{selectedInvestmentDetails.amount.toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Divider />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Total Earnings:</Typography>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            ₦{selectedInvestmentDetails.earnings.toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Monthly Return Rate:</Typography>
                          <Typography variant="body2">
                            {selectedInvestmentDetails.monthlyReturn}%
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Next Payout Date:</Typography>
                          <Typography variant="body2">
                            {selectedInvestmentDetails.nextPayoutDate 
                              ? new Date(selectedInvestmentDetails.nextPayoutDate).toLocaleDateString()
                              : 'N/A'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Investment Age:</Typography>
                          <Typography variant="body2">
                            {formatDistanceToNow(new Date(selectedInvestmentDetails.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                        {selectedInvestmentDetails.status === 'active' && selectedInvestmentDetails.earnings > 0 && (
                          <Button 
                            variant="contained" 
                            color="success" 
                            startIcon={<AccountBalance />}
                            onClick={() => handleOpenWithdrawalDialog(
                              selectedInvestmentDetails.id, 
                              selectedInvestmentDetails.earnings
                            )}
                            fullWidth
                          >
                            Withdraw Earnings
                          </Button>
                        )}
                        
                        {selectedInvestmentDetails.status === 'active' && (
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<Refresh />}
                            fullWidth
                            href="/properties"
                          >
                            Reinvest
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Documents & Payouts */}
                <Grid xs={12} md={4}>
                  <Stack spacing={3} sx={{ height: '100%' }}>
                    {/* Documents */}
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Investment Documents
                        </Typography>
                        
                        <List dense>
                          {selectedInvestmentDetails.documents && selectedInvestmentDetails.documents.length > 0 ? (
                            selectedInvestmentDetails.documents.map((doc: Document) => (
                              <ListItem key={doc.id} divider>
                                <ListItemText
                                  primary={doc.name}
                                  secondary={`${doc.type} • ${new Date(doc.createdAt).toLocaleDateString()}`}
                                />
                                <IconButton 
                                  edge="end" 
                                  aria-label="download"
                                  href={doc.url}
                                  target="_blank"
                                  download
                                >
                                  <Download fontSize="small" />
                                </IconButton>
                              </ListItem>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                              No documents available
                            </Typography>
                          )}
                        </List>
                      </CardContent>
                    </Card>
                    
                    {/* Payout History */}
                    <Card sx={{ flexGrow: 1 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Payout History
                        </Typography>
                        
                        {selectedInvestmentDetails.payoutHistory && selectedInvestmentDetails.payoutHistory.length > 0 ? (
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Date</TableCell>
                                  <TableCell align="right">Amount</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedInvestmentDetails.payoutHistory.map((payout: Payout) => (
                                  <TableRow key={payout.id}>
                                    <TableCell>{new Date(payout.date).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">₦{payout.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={payout.status} 
                                        size="small"
                                        color={
                                          payout.status === 'completed' ? 'success' :
                                          payout.status === 'pending' ? 'warning' : 'default'
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            No payout history available yet
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
      
      {/* Withdrawal Request Dialog */}
      <Dialog
        open={withdrawalDialog}
        onClose={() => setWithdrawalDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Withdraw Earnings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              name="amount"
              label="Withdrawal Amount"
              fullWidth
              type="number"
              value={withdrawalForm.amount}
              onChange={handleWithdrawalFormChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
              }}
              helperText="Maximum amount available for withdrawal"
            />
            
            <TextField
              name="reason"
              label="Reason for Withdrawal (Optional)"
              fullWidth
              multiline
              rows={3}
              value={withdrawalForm.reason}
              onChange={handleWithdrawalFormChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawalDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitWithdrawal}
            variant="contained"
            color="primary"
            disabled={withdrawalMutation.isPending || withdrawalForm.amount <= 0}
          >
            {withdrawalMutation.isPending ? (
              <CircularProgress size={24} />
            ) : 'Request Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyInvestmentsDashboard;