import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button,
  Alert,
  AlertTitle,
  Backdrop,
  CircularProgress
} from '@mui/material';
import KYCForm from '../../components/KYC/KYCForm';
import { submitKYCApplication, getKYCStatus } from '../../services/kycService';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';

/**
 * KYC verification page for investors
 * Handles KYC submission and status display
 */
const KYCPage = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  // Fetch KYC status
  const {
    data: kycStatusData,
    isLoading: isLoadingStatus,
    error: kycStatusError,
    refetch: refetchKycStatus
  } = useQuery({
    queryKey: ['/api/kyc/status'],
    queryFn: getKYCStatus,
    retry: 1,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data.status === 'pending' || data.status === 'approved' || data.status === 'rejected') {
        setKycSubmitted(true);
      }
    },
    onError: () => {
      setKycSubmitted(false);
    }
  });

  // KYC submission mutation
  const {
    mutate: submitKYC,
    isPending: isSubmitting,
    error: submitError
  } = useMutation({
    mutationFn: submitKYCApplication,
    onSuccess: () => {
      setKycSubmitted(true);
      setActiveStep(2);
      refetchKycStatus();
    }
  });

  // Handle form submission
  const handleKYCSubmit = async (formData) => {
    try {
      // Add user ID to form data
      const kycData = {
        ...formData,
        userId: user?.id
      };
      
      // Submit KYC data
      submitKYC(kycData);
    } catch (error) {
      console.error('Error submitting KYC:', error);
    }
  };

  // Get KYC status display content
  const getKYCStatusContent = () => {
    if (!kycStatusData) return null;

    switch (kycStatusData.status) {
      case 'pending':
        return (
          <Alert severity="info" sx={{ mt: 3 }}>
            <AlertTitle>Under Review</AlertTitle>
            Your KYC application has been submitted and is currently under review. 
            This typically takes 1-2 business days. You'll receive an email once the review is complete.
          </Alert>
        );
      case 'approved':
        return (
          <Alert severity="success" sx={{ mt: 3 }}>
            <AlertTitle>Verified</AlertTitle>
            Your KYC verification has been approved! You can now make cryptocurrency investments on the platform.
          </Alert>
        );
      case 'rejected':
        return (
          <Alert severity="error" sx={{ mt: 3 }}>
            <AlertTitle>Verification Failed</AlertTitle>
            Your KYC verification could not be completed.
            <Box sx={{ mt: 1 }}>
              Reason: {kycStatusData.reason || 'Please contact support for more information.'}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setKycSubmitted(false);
                  setActiveStep(0);
                }}
              >
                Resubmit KYC
              </Button>
            </Box>
          </Alert>
        );
      default:
        return null;
    }
  };

  // Steps for the KYC process
  const steps = [
    'Prepare Documents',
    'Complete KYC Form',
    'Verification'
  ];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Know Your Customer (KYC) Verification
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      {activeStep === 0 && !kycSubmitted && (
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Prepare Your Documents
          </Typography>
          
          <Typography variant="body1" paragraph>
            Before starting the KYC process, please make sure you have the following documents ready:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" sx={{ mb: 1 }}>
              <strong>Valid ID Document</strong> - Passport, Driver's License, or National ID Card
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              <strong>Proof of Address</strong> - Utility bill or bank statement (less than 3 months old)
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              <strong>Source of Funds Documentation</strong> - Bank statements, investment statements, or other proof of income
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            All documents must be clear, in color, and show all four corners of the document. Files must be in JPG, PNG, or PDF format and less than 5MB in size.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => setActiveStep(1)}
          >
            Continue to KYC Form
          </Button>
        </Paper>
      )}
      
      {activeStep === 1 && !kycSubmitted && (
        <KYCForm
          onSubmit={handleKYCSubmit}
          loading={isSubmitting}
          error={submitError?.message}
        />
      )}
      
      {(activeStep === 2 || kycSubmitted) && (
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            KYC Status
          </Typography>
          
          {isLoadingStatus ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : kycStatusError ? (
            <Alert severity="error" sx={{ mt: 3 }}>
              <AlertTitle>Error</AlertTitle>
              Unable to retrieve your KYC status. Please try again later.
            </Alert>
          ) : (
            getKYCStatusContent()
          )}
        </Paper>
      )}
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Submitting your KYC application...</Typography>
        </Box>
      </Backdrop>
    </Container>
  );
};

export default KYCPage;