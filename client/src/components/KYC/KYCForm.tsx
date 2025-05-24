import React, { useState } from 'react';
import {
  TextField, Button, Typography, Box, Paper,
  CircularProgress, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const KYCForm = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    fullName: '',
    address: '',
    idType: 'national_id',
    idNumber: '',
    selfie: null as File | null,
    idDoc: null as File | null,
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, [name]: file }));
    }
  };

  const kycMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('KYC submission failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setError('');
      // Invalidate KYC status query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
    },
    onError: (err: any) => {
      setSuccess(false);
      setError(err.message || 'Submission failed. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    // Validate form
    if (!form.fullName || !form.address || !form.idNumber || !form.selfie || !form.idDoc) {
      setError('All fields are required, including document uploads');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('address', form.address);
    formData.append('idNumber', form.idNumber);
    
    // Append files
    if (form.selfie) formData.append('selfie', form.selfie);
    if (form.idDoc) formData.append('idDoc', form.idDoc);

    kycMutation.mutate(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>Investor KYC Verification</Typography>
      <Typography variant="body2" paragraph>
        Complete this verification to unlock advanced investment opportunities. Your information is secured with bank-level encryption.
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField 
              label="Full Name" 
              name="fullName" 
              fullWidth 
              required 
              onChange={handleChange}
              value={form.fullName}
              helperText="As it appears on your official ID"
            />
          </Grid>
          <Grid xs={12}>
            <TextField 
              label="Address" 
              name="address" 
              fullWidth 
              required 
              onChange={handleChange}
              value={form.address}
              helperText="Your current residential address"
            />
          </Grid>
          <Grid xs={12}>
            <TextField 
              label="ID Number (NIN/BVN/Passport)" 
              name="idNumber" 
              fullWidth 
              required 
              onChange={handleChange}
              value={form.idNumber}
              helperText="Government-issued identification number"
            />
          </Grid>
          <Grid xs={12}>
            <Typography variant="body2" gutterBottom>Upload ID Document:</Typography>
            <input 
              type="file" 
              name="idDoc" 
              required 
              accept="image/*,application/pdf" 
              onChange={handleFileChange}
              style={{ marginBottom: '1rem' }}
            />
            <Typography variant="caption" color="text.secondary">
              Acceptable formats: JPEG, PNG, PDF (max 5MB)
            </Typography>
          </Grid>
          <Grid xs={12}>
            <Typography variant="body2" gutterBottom>Upload Selfie:</Typography>
            <input 
              type="file" 
              name="selfie" 
              required 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ marginBottom: '1rem' }}
            />
            <Typography variant="caption" color="text.secondary">
              Clear photo of your face (JPEG or PNG, max 5MB)
            </Typography>
          </Grid>
          <Grid xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={kycMutation.isPending}
              size="large"
              fullWidth
              sx={{ mt: 2 }}
            >
              {kycMutation.isPending ? <CircularProgress size={24} /> : 'Submit KYC'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {success && <Alert severity="success" sx={{ mt: 2 }}>KYC submitted successfully! Our team will review your information shortly.</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  );
};

export default KYCForm;