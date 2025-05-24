// client/src/pages/admin/KycDetail.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  VerifiedUser, 
  Cancel, 
  CheckCircle,
  ArrowBack 
} from '@mui/icons-material';
import { useRoute, useLocation } from 'wouter';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

export default function KycDetail() {
  const [match, params] = useRoute('/admin/kyc/:id');
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kyc, setKyc] = useState(null);

  useEffect(() => {
    if (params?.id) {
      fetchKycDetails(params.id);
    }
  }, [params?.id]);

  const fetchKycDetails = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/kyc-submissions/${id}`);
      setKyc(res.data);
    } catch (err) {
      console.error('Failed to fetch KYC details:', err);
      setError('Failed to load KYC submission details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await axios.post(`/api/admin/kyc-update/${params.id}`, { status });
      setKyc({ ...kyc, status });
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update KYC status. Please try again.');
    }
  };

  const handleBack = () => {
    setLocation('/admin/kyc');
  };

  if (loading) {
    return (
      <AdminLayout title="KYC Verification Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="KYC Verification Details">
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
          variant="outlined"
        >
          Back to KYC List
        </Button>
      </AdminLayout>
    );
  }

  // Mock data for display purposes - in a real app, this would come from the API
  const mockKyc = {
    id: params.id || '12345',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234 8012345678',
    status: kyc?.status || 'pending',
    submittedAt: '2025-04-15T10:30:00Z',
    nationalIdUrl: 'https://via.placeholder.com/400x300?text=National+ID',
    addressProofUrl: 'https://via.placeholder.com/400x300?text=Address+Proof',
    selfieUrl: 'https://via.placeholder.com/400x300?text=Selfie+Photo',
    additionalInfo: {
      dateOfBirth: '1985-07-22',
      nationality: 'Nigerian',
      address: '123 Main Street, Lagos, Nigeria',
      occupation: 'Software Engineer',
      sourceOfFunds: 'Employment Income',
      isPEP: false
    }
  };

  // Use either real data from API or mock data for display
  const kycData = kyc || mockKyc;

  return (
    <AdminLayout title="KYC Verification Details">
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back to KYC List
        </Button>
        
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/admin/dashboard">
            Admin Dashboard
          </Link>
          <Link color="inherit" href="/admin/kyc">
            KYC Management
          </Link>
          <Typography color="text.primary">Details</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          KYC Submission Details
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <List>
              <ListItem divider>
                <ListItemText 
                  primary="Full Name" 
                  secondary={kycData.fullName} 
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="Email Address" 
                  secondary={kycData.email} 
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="Phone Number" 
                  secondary={kycData.phone} 
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="Date of Birth" 
                  secondary={kycData.additionalInfo.dateOfBirth} 
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="Nationality" 
                  secondary={kycData.additionalInfo.nationality} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Address" 
                  secondary={kycData.additionalInfo.address} 
                />
              </ListItem>
            </List>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial Information
            </Typography>
            <List>
              <ListItem divider>
                <ListItemText 
                  primary="Occupation" 
                  secondary={kycData.additionalInfo.occupation} 
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="Source of Funds" 
                  secondary={kycData.additionalInfo.sourceOfFunds} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Politically Exposed Person (PEP)" 
                  secondary={kycData.additionalInfo.isPEP ? 'Yes' : 'No'} 
                />
              </ListItem>
            </List>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Submission Status
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              bgcolor: 
                kycData.status === 'approved' ? 'success.light' : 
                kycData.status === 'rejected' ? 'error.light' : 
                'warning.light',
              p: 2,
              borderRadius: 1
            }}>
              {kycData.status === 'approved' ? (
                <CheckCircle color="success" sx={{ mr: 1 }} />
              ) : kycData.status === 'rejected' ? (
                <Cancel color="error" sx={{ mr: 1 }} />
              ) : (
                <VerifiedUser color="warning" sx={{ mr: 1 }} />
              )}
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {kycData.status === 'approved' 
                  ? 'Approved' 
                  : kycData.status === 'rejected' 
                  ? 'Rejected' 
                  : 'Pending Review'}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Submitted on: {new Date(kycData.submittedAt).toLocaleString()}
            </Typography>
            
            {kycData.status === 'pending' && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => updateStatus('approved')}
                  startIcon={<CheckCircle />}
                  sx={{ mr: 2 }}
                >
                  Approve
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => updateStatus('rejected')}
                  startIcon={<Cancel />}
                >
                  Reject
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification Documents
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              National ID
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="240"
                image={kycData.nationalIdUrl}
                alt="National ID"
              />
            </Card>
            
            <Typography variant="subtitle1" gutterBottom>
              Proof of Address
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="240"
                image={kycData.addressProofUrl}
                alt="Proof of Address"
              />
            </Card>
            
            <Typography variant="subtitle1" gutterBottom>
              Selfie Photo
            </Typography>
            <Card>
              <CardMedia
                component="img"
                height="240"
                image={kycData.selfieUrl}
                alt="Selfie Photo"
              />
            </Card>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}