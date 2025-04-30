import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  TableContainer,
  Button, 
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO, addMonths } from 'date-fns';
import { Add as AddIcon, Download as DownloadIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { apiRequest, queryClient } from '../../lib/queryClient';
import { toast } from '../../lib/toast';

// Types for ROI management
interface Property {
  id: string;
  name: string;
  title?: string;
  currentFunding: number;
  fundingGoal: number;
  roiPercentage: number;
}

interface RoiPerformance {
  totalDistributed: string;
  pendingAmount: string;
  nextPayoutDate: string | null;
}

interface PayoutSchedule {
  id: string;
  propertyId: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'custom';
  startDate: string;
  endDate: string | null;
  amountType: 'fixed' | 'percentage';
  amountValue: string;
  createdAt: string;
}

interface RoiDistribution {
  id: string;
  propertyId: string;
  payoutDate: string;
  totalAmount: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  initiatedBy: string;
  createdAt: string;
  payoutCount?: number;
  completedPayouts?: number;
}

/**
 * ROI Management Component for Admin Dashboard
 * Allows administrators to manage ROI schedules and distributions for properties
 */
const RoiManagement = ({ property }: { property: Property }) => {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('8');

  // Fetch property ROI performance data
  const { data: performance, isLoading: performanceLoading } = useQuery<RoiPerformance>({
    queryKey: ['roiPerformance', property.id],
    queryFn: () => apiRequest("GET", `/api/admin/roi/${property.id}/performance`)
      .then(res => res.json()),
  });

  // Trigger ROI distribution
  const { mutate: triggerDistribution, isPending: isDistributing } = useMutation({
    mutationFn: (data: { amount: string; percentage: string }) => 
      apiRequest("POST", `/api/admin/roi/${property.id}/distributions`, data)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roiPerformance', property.id] });
      queryClient.invalidateQueries({ queryKey: ['roiDistributions', property.id] });
      toast({
        title: "ROI Distribution Created",
        description: "The distribution has been initiated successfully.",
        variant: "success"
      });
      setDistributionDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Distribution Failed",
        description: error.message || "Failed to create distribution. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle ROI distribution
  const handleTriggerDistribution = () => {
    if (!amount) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount for distribution.",
        variant: "destructive"
      });
      return;
    }
    
    triggerDistribution({ 
      amount,
      percentage
    });
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          ROI Management - {property.title || property.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => setScheduleDialogOpen(true)}
          >
            Add Payout Schedule
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setDistributionDialogOpen(true)}
          >
            Trigger Distribution
          </Button>
        </Box>
      </Box>

      {performanceLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Performance Overview</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Distributed</TableCell>
                  <TableCell>
                    ${performance?.totalDistributed
                      ? parseFloat(performance.totalDistributed).toLocaleString('en-US', { minimumFractionDigits: 2 })
                      : '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Pending Payouts</TableCell>
                  <TableCell>
                    ${performance?.pendingAmount
                      ? parseFloat(performance.pendingAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })
                      : '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Next Payout Date</TableCell>
                  <TableCell>
                    {performance?.nextPayoutDate
                      ? format(new Date(performance.nextPayoutDate), 'MMM dd, yyyy')
                      : 'No scheduled payouts'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Payout Schedules</Typography>
        <PayoutSchedulesTable propertyId={property.id} />
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Distribution History</Typography>
        <RoiDistributionsTable propertyId={property.id} />
      </Box>

      {/* Add Payout Schedule Dialog */}
      <PayoutScheduleDialog 
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        propertyId={property.id}
      />

      {/* Trigger Distribution Dialog */}
      <Dialog open={distributionDialogOpen} onClose={() => setDistributionDialogOpen(false)}>
        <DialogTitle>Trigger ROI Distribution</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This will create a distribution for this property and calculate payouts for all investors based on their investment amounts.
            </Typography>
            <TextField
              label="Distribution Amount ($)"
              fullWidth
              margin="normal"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="The total amount to distribute to investors"
            />
            <TextField
              label="Distribution Percentage (%)"
              fullWidth
              margin="normal"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              helperText="Percentage of investment to distribute (for calculation)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDistributionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleTriggerDistribution} 
            variant="contained" 
            disabled={isDistributing}
          >
            {isDistributing ? <CircularProgress size={24} /> : 'Create Distribution'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

/**
 * Payout Schedules Table Component
 * Displays and manages payout schedules for a property
 */
const PayoutSchedulesTable = ({ propertyId }: { propertyId: string }) => {
  // Fetch payout schedules
  const { data: schedules, isLoading } = useQuery<PayoutSchedule[]>({
    queryKey: ['payoutSchedules', propertyId],
    queryFn: () => apiRequest("GET", `/api/admin/roi/${propertyId}/schedules`)
      .then(res => res.json()),
  });

  // Delete a schedule
  const { mutate: deleteSchedule } = useMutation({
    mutationFn: (scheduleId: string) => 
      apiRequest("DELETE", `/api/admin/roi/${propertyId}/schedules/${scheduleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutSchedules', propertyId] });
      toast({
        title: "Schedule Deleted",
        description: "The payout schedule has been deleted successfully.",
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete schedule. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No payout schedules have been created for this property yet.
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell>Frequency</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map(schedule => (
            <TableRow key={schedule.id} hover>
              <TableCell sx={{ textTransform: 'capitalize' }}>{schedule.frequency}</TableCell>
              <TableCell>{format(new Date(schedule.startDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                {schedule.endDate 
                  ? format(new Date(schedule.endDate), 'MMM dd, yyyy') 
                  : 'Ongoing'}
              </TableCell>
              <TableCell>
                {schedule.amountType === 'percentage' 
                  ? `${parseFloat(schedule.amountValue).toFixed(2)}%` 
                  : `$${parseFloat(schedule.amountValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                }
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit Schedule">
                    <IconButton size="small" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Schedule">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => 
                        confirm("Are you sure you want to delete this payout schedule?") && 
                        deleteSchedule(schedule.id)
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * ROI Distributions Table Component
 * Displays distribution history for a property
 */
const RoiDistributionsTable = ({ propertyId }: { propertyId: string }) => {
  const [startDate, setStartDate] = useState<Date | null>(
    addMonths(new Date(), -6)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Fetch distributions
  const { data: distributions, isLoading } = useQuery<RoiDistribution[]>({
    queryKey: ['roiDistributions', propertyId],
    queryFn: () => apiRequest(
      "GET", 
      `/api/admin/roi/${propertyId}/distributions?${
        startDate ? `startDate=${startDate.toISOString()}` : ''
      }${
        endDate ? `&endDate=${endDate.toISOString()}` : ''
      }`
    ).then(res => res.json()),
    enabled: !!propertyId
  });

  // Process distributions
  const { mutate: processDistribution, isPending: isProcessing } = useMutation({
    mutationFn: (distributionId: string) => 
      apiRequest("POST", `/api/admin/roi/distributions/${distributionId}/process`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roiDistributions', propertyId] });
      toast({
        title: "Distribution Processed",
        description: "The payouts have been processed successfully.",
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process distribution. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Download report
  const downloadReport = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates.",
        variant: "destructive"
      });
      return;
    }

    window.open(
      `/api/admin/roi/${propertyId}/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      '_blank'
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              label="From Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="To Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
        </LocalizationProvider>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadReport}
        >
          Download Report
        </Button>
      </Box>

      {(!distributions || distributions.length === 0) ? (
        <Alert severity="info">
          No distributions found for the selected date range.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Investors Paid</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {distributions.map(distribution => (
                <TableRow key={distribution.id} hover>
                  <TableCell>{format(new Date(distribution.payoutDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    ${parseFloat(distribution.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={distribution.status.charAt(0).toUpperCase() + distribution.status.slice(1)} 
                      color={
                        distribution.status === 'paid' ? 'success' :
                        distribution.status === 'processing' ? 'info' :
                        distribution.status === 'pending' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {distribution.completedPayouts !== undefined && distribution.payoutCount !== undefined ? (
                      `${distribution.completedPayouts}/${distribution.payoutCount}`
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {distribution.status === 'pending' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        disabled={isProcessing}
                        onClick={() => processDistribution(distribution.id)}
                      >
                        Process Payouts
                      </Button>
                    )}
                    {distribution.status === 'processing' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="info"
                        disabled
                      >
                        Processing...
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

/**
 * Dialog for creating/editing payout schedules
 */
const PayoutScheduleDialog = ({ 
  open, 
  onClose, 
  propertyId,
  schedule
}: { 
  open: boolean;
  onClose: () => void;
  propertyId: string;
  schedule?: PayoutSchedule;
}) => {
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annual' | 'custom'>(
    (schedule?.frequency as 'monthly' | 'quarterly' | 'annual' | 'custom') || 'monthly'
  );
  const [startDate, setStartDate] = useState<Date | null>(
    schedule ? new Date(schedule.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | null>(
    schedule?.endDate ? new Date(schedule.endDate) : null
  );
  const [amountType, setAmountType] = useState<'fixed' | 'percentage'>(
    (schedule?.amountType as 'fixed' | 'percentage') || 'percentage'
  );
  const [amountValue, setAmountValue] = useState(schedule?.amountValue || '');

  // Create or update schedule
  const { mutate: saveSchedule, isPending } = useMutation({
    mutationFn: (data: any) => 
      schedule
        ? apiRequest("PUT", `/api/admin/roi/${propertyId}/schedules/${schedule.id}`, data)
        : apiRequest("POST", `/api/admin/roi/${propertyId}/schedules`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutSchedules', propertyId] });
      toast({
        title: schedule ? "Schedule Updated" : "Schedule Created",
        description: `The payout schedule has been ${schedule ? 'updated' : 'created'} successfully.`,
        variant: "success"
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: schedule ? "Update Failed" : "Creation Failed",
        description: error.message || `Failed to ${schedule ? 'update' : 'create'} schedule. Please try again.`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!startDate) {
      toast({
        title: "Validation Error",
        description: "Start date is required.",
        variant: "destructive"
      });
      return;
    }

    if (!amountValue || parseFloat(amountValue) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount value.",
        variant: "destructive"
      });
      return;
    }

    saveSchedule({
      frequency,
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString() || null,
      amountType,
      amountValue
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{schedule ? 'Edit' : 'Create'} Payout Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Frequency"
              fullWidth
              margin="normal"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'monthly' | 'quarterly' | 'annual' | 'custom')}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="annual">Annual</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </TextField>
            
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              sx={{ mt: 2 }}
            />
            
            <DatePicker
              label="End Date (Optional)"
              value={endDate}
              onChange={setEndDate}
            />
            
            <TextField
              select
              label="Amount Type"
              fullWidth
              margin="normal"
              value={amountType}
              onChange={(e) => setAmountType(e.target.value as 'fixed' | 'percentage')}
            >
              <MenuItem value="fixed">Fixed Amount</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
            </TextField>
            
            <TextField
              label={amountType === 'fixed' ? 'Amount ($)' : 'Percentage (%)'}
              fullWidth
              margin="normal"
              type="number"
              value={amountValue}
              onChange={(e) => setAmountValue(e.target.value)}
              InputProps={{
                startAdornment: amountType === 'fixed' ? '$' : '',
                endAdornment: amountType === 'percentage' ? '%' : '',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={isPending}
          >
            {isPending ? <CircularProgress size={24} /> : (schedule ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RoiManagement;