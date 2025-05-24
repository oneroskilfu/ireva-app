import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, 
  Typography, Box, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, CircularProgress, FormHelperText
} from '@mui/material';
import { Check, Close, Image, DocumentScanner } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllKYCs, updateKYCStatus } from '@/services/kycService';
import { useToast } from '@/hooks/use-toast';

interface KYCSubmission {
  id: number;
  userId: number;
  fullName: string;
  idType: string;
  status: string;
  submittedAt: string;
  username: string;
  email: string;
}

const AdminKYCManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState('');
  const [selectedKyc, setSelectedKyc] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get all pending KYC submissions
  const { data: kycList = [], isLoading, error } = useQuery({
    queryKey: ['/api/kyc/pending'],
    queryFn: getAllKYCs
  });

  // Mutation for updating KYC status
  const updateMutation = useMutation({
    mutationFn: (params: { userId: number, action: 'approve' | 'reject', rejectionReason?: string }) => 
      updateKYCStatus(params.userId, params.action, params.rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kyc/pending'] });
      setDialogOpen(false);
      setRejectReason('');
      setSelectedKyc(null);
      toast({
        title: 'KYC status updated',
        description: 'The KYC submission status has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update KYC status',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleApprove = (userId: number) => {
    updateMutation.mutate({ userId, action: 'approve' });
  };

  const handleOpenRejectDialog = (userId: number) => {
    setSelectedKyc(userId);
    setDialogOpen(true);
  };

  const handleReject = () => {
    if (!selectedKyc) return;
    
    if (!rejectReason) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate({ 
      userId: selectedKyc, 
      action: 'reject', 
      rejectionReason: rejectReason 
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setRejectReason('');
    setSelectedKyc(null);
  };

  // View document in new tab
  const viewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error loading KYC submissions
        </Typography>
        <Typography color="error">
          {(error as Error).message || 'An unexpected error occurred'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        KYC Verification Management
      </Typography>
      
      {kycList.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No pending KYC submissions to review
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><Typography fontWeight="bold">Full Name</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Username</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Submitted</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Documents</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kycList.map((kyc: KYCSubmission) => (
                <TableRow key={kyc.id}>
                  <TableCell>{kyc.fullName}</TableCell>
                  <TableCell>{kyc.username}</TableCell>
                  <TableCell>{kyc.email}</TableCell>
                  <TableCell>{new Date(kyc.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        startIcon={<Image />} 
                        size="small" 
                        variant="outlined"
                        onClick={() => viewDocument(`/api/kyc/${kyc.userId}/files/selfie`)}
                      >
                        Selfie
                      </Button>
                      <Button 
                        startIcon={<DocumentScanner />} 
                        size="small" 
                        variant="outlined"
                        onClick={() => viewDocument(`/api/kyc/${kyc.userId}/files/idDoc`)}
                      >
                        ID
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        startIcon={<Check />} 
                        color="success" 
                        variant="contained" 
                        size="small"
                        onClick={() => handleApprove(kyc.userId)}
                        disabled={updateMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button 
                        startIcon={<Close />} 
                        color="error" 
                        variant="contained" 
                        size="small"
                        onClick={() => handleOpenRejectDialog(kyc.userId)}
                        disabled={updateMutation.isPending}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Reject KYC Submission</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="rejectionReason"
            label="Reason for Rejection"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
            error={!rejectReason && dialogOpen}
            helperText={!rejectReason && dialogOpen ? "Rejection reason is required" : ""}
          />
          <FormHelperText>
            Provide a clear reason why this KYC submission is being rejected. This will be shared with the user.
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={updateMutation.isPending || !rejectReason}
          >
            {updateMutation.isPending ? <CircularProgress size={24} /> : 'Reject KYC'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminKYCManager;