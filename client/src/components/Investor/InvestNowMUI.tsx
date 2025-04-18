import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Paper
} from '@mui/material';

// Import Property type
import { Property } from '@shared/schema';

// Type for form values
interface InvestmentFormData {
  projectId: string;
  amount: number;
}

// Type for wallet data
interface WalletData {
  balance: number;
  id: number;
  userId: number;
}

// This component uses Material-UI for styling
const InvestNowMUI = ({ propertyId = null }: { propertyId?: string | null }) => {
  const [projectId, setProjectId] = useState<string>(propertyId || '');
  const [amount, setAmount] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' 
  }>({ open: false, message: '', severity: 'success' });
  const [, navigate] = useLocation();

  // Fetch projects using React Query
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  // Fetch wallet details for balance check
  const { data: wallet } = useQuery<WalletData>({
    queryKey: ['/api/wallet'],
  });

  // Get selected project details
  const selectedProject = projects.find((proj: Property) => proj.id === parseInt(projectId));

  // Set minimum investment amount when project changes
  useEffect(() => {
    if (selectedProject) {
      setAmount(selectedProject.minimumInvestment.toString());
    }
  }, [projectId, selectedProject]);

  // Investment mutation with React Query
  const investMutation = useMutation<any, Error, InvestmentFormData>({
    mutationFn: async (data: InvestmentFormData) => {
      const res = await apiRequest('POST', '/api/investments', {
        propertyId: parseInt(data.projectId),
        amount: data.amount,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setSnackbar({ open: true, message: 'Investment successful!', severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties', parseInt(projectId)] });
      
      // Redirect to portfolio after successful investment
      setTimeout(() => {
        navigate('/investor/portfolio');
      }, 2000);
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: `Investment failed: ${error.message}`, severity: 'error' });
    },
  });

  const handleInvest = async () => {
    if (!projectId || !amount) {
      return setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
    }

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return setSnackbar({ open: true, message: 'Please enter a valid amount', severity: 'error' });
    }

    // Check minimum investment
    if (selectedProject && amountValue < selectedProject.minimumInvestment) {
      return setSnackbar({ 
        open: true, 
        message: `Minimum investment is ₦${selectedProject.minimumInvestment.toLocaleString()}`, 
        severity: 'error' 
      });
    }

    // Check wallet balance
    if (wallet && amountValue > wallet.balance) {
      return setSnackbar({ 
        open: true, 
        message: 'Insufficient wallet balance', 
        severity: 'error' 
      });
    }

    // Check available funding
    if (selectedProject && amountValue > (selectedProject.totalFunding - selectedProject.currentFunding)) {
      return setSnackbar({ 
        open: true, 
        message: 'Amount exceeds available funding space', 
        severity: 'error' 
      });
    }

    investMutation.mutate({ projectId, amount: amountValue });
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Invest in a Project</Typography>
        
        {/* Wallet Balance Display */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'primary.light', 
            color: 'primary.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2">Wallet Balance</Typography>
          <Typography variant="h6">₦{wallet?.balance?.toLocaleString() || '0'}</Typography>
        </Paper>

        {/* Project Selection */}
        <TextField
          select
          fullWidth
          label="Select Project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          margin="normal"
          disabled={projectId && propertyId ? true : false}
        >
          {projects.map((proj) => (
            <MenuItem key={proj.id} value={proj.id}>
              {proj.name} - ₦{proj.minimumInvestment.toLocaleString()} minimum
            </MenuItem>
          ))}
        </TextField>

        {/* Amount Input */}
        <TextField
          fullWidth
          label="Investment Amount (₦)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="normal"
          InputProps={{
            inputProps: { 
              min: selectedProject?.minimumInvestment || 0
            }
          }}
        />

        {/* Investment Summary */}
        {selectedProject && (
          <Box mt={3} mb={3} p={2} sx={{ bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Investment Summary</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">Property</Typography>
                <Typography variant="body1">{selectedProject.name}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Location</Typography>
                <Typography variant="body1">{selectedProject.location}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Term</Typography>
                <Typography variant="body1">{selectedProject.term} months</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Target Return</Typography>
                <Typography variant="body1">{selectedProject.targetReturn}%</Typography>
              </Box>
              <Box sx={{ gridColumn: 'span 2' }}>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="subtitle2">Investment Amount</Typography>
                  <Typography variant="subtitle1">₦{parseFloat(amount || '0').toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Submit Button with loading state */}
        <Box mt={3} position="relative">
          <Button 
            variant="contained" 
            onClick={handleInvest} 
            disabled={
              investMutation.isPending || 
              projectsLoading || 
              !projectId || 
              !amount || 
              (wallet && parseFloat(amount) > wallet.balance) ||
              (selectedProject && parseFloat(amount) < selectedProject.minimumInvestment)
            }
            fullWidth
            size="large"
            sx={{ 
              py: 1.5, 
              textTransform: 'none', 
              fontSize: '1rem',
              fontWeight: 'medium',
              boxShadow: 3,
              borderRadius: 1.5
            }}
            color="primary"
          >
            {investMutation.isPending ? 'Processing Investment...' : 'Confirm Investment'}
          </Button>
          {investMutation.isPending && (
            <CircularProgress
              size={24}
              sx={{
                color: 'primary.main',
                position: 'absolute',
                top: '50%',
                left: '24px',
                marginTop: '-12px',
              }}
            />
          )}
          
          {/* Validation messages */}
          {!investMutation.isPending && wallet && parseFloat(amount || '0') > wallet.balance && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Insufficient wallet balance. Please add funds to your wallet.
            </Typography>
          )}
          
          {!investMutation.isPending && selectedProject && parseFloat(amount || '0') < selectedProject.minimumInvestment && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Minimum investment is ₦{selectedProject.minimumInvestment.toLocaleString()}
            </Typography>
          )}
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbar.severity === 'success' ? 'success' : 'error'} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default InvestNowMUI;