import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  IconButton,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  Tab,
  Tabs,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Person,
  Flag,
  History,
  Search,
  Description,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';

/**
 * KYC Management Component for Admins
 * Allows admins to review and approve/reject KYC applications
 */
const KYCManagement = () => {
  const [kycApplications, setKycApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  // Fetch KYC applications from API
  const fetchKYCApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/kyc?status=${activeTab}&page=${currentPage}`);
      setKycApplications(response.data.applications || []);
      setFilteredApplications(response.data.applications || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching KYC applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchKYCApplications();
  }, [activeTab, currentPage]);

  // Filter applications based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredApplications(kycApplications);
      return;
    }
    
    const filtered = kycApplications.filter(app => 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toString().includes(searchTerm)
    );
    
    setFilteredApplications(filtered);
  }, [searchTerm, kycApplications]);

  // Open the application detail dialog
  const handleOpenDialog = (application) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  // Close the application detail dialog
  const handleCloseDialog = () => {
    setSelectedApplication(null);
    setOpenDialog(false);
    setRejectionReason('');
  };

  // Handle application approval
  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await axios.patch(`/api/admin/kyc/${id}/verify`, { status: 'approved' });
      fetchKYCApplications();
      
      if (selectedApplication && selectedApplication.id === id) {
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error approving KYC application:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle application rejection
  const handleReject = async (id) => {
    if (!rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setProcessingId(id);
      await axios.patch(`/api/admin/kyc/${id}/verify`, { 
        status: 'rejected',
        reason: rejectionReason
      });
      fetchKYCApplications();
      handleCloseDialog();
    } catch (error) {
      console.error('Error rejecting KYC application:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  // Get status chip based on application status
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="primary" size="small" />;
      case 'approved':
        return <Chip label="Approved" color="success" size="small" icon={<CheckCircle />} />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" icon={<Cancel />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Get crypto risk indicator based on investment range and flags
  const getCryptoRiskIndicator = (application) => {
    let riskLevel = 'low';
    
    // Check expected investment range
    if (application.expectedInvestmentRange === 'above-500k') {
      riskLevel = 'high';
    } else if (application.expectedInvestmentRange === '100k-500k') {
      riskLevel = 'medium';
    }
    
    // Check if PEP
    if (application.isPEP) {
      riskLevel = 'high';
    }
    
    // Return appropriate chip
    switch (riskLevel) {
      case 'high':
        return <Chip label="High Risk" color="error" size="small" />;
      case 'medium':
        return <Chip label="Medium Risk" color="warning" size="small" />;
      case 'low':
        return <Chip label="Low Risk" color="success" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        KYC Application Management
      </Typography>
      
      <Box sx={{ display: 'flex', mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab value="pending" label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <History sx={{ mr: 1 }} />
              Pending
            </Box>
          } />
          <Tab value="approved" label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ mr: 1 }} />
              Approved
            </Box>
          } />
          <Tab value="rejected" label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Cancel sx={{ mr: 1 }} />
              Rejected
            </Box>
          } />
        </Tabs>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
            }}
            sx={{ mr: 2 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchKYCApplications}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredApplications.length === 0 ? (
        <Alert severity="info">
          No {activeTab} KYC applications found.
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Crypto Risk</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.id}</TableCell>
                    <TableCell>{application.fullName}</TableCell>
                    <TableCell>{application.country}</TableCell>
                    <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{getCryptoRiskIndicator(application)}</TableCell>
                    <TableCell>{getStatusChip(application.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(application)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {application.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={() => handleApprove(application.id)}
                                disabled={processingId === application.id}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleOpenDialog(application)}
                                disabled={processingId === application.id}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Typography sx={{ mx: 2, lineHeight: '36px' }}>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </Box>
        </>
      )}
      
      {/* KYC Application Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedApplication && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  KYC Application: {selectedApplication.fullName}
                </Typography>
                {getStatusChip(selectedApplication.status)}
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} />
                        <Typography variant="h6">Personal Information</Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Full Name</Typography>
                          <Typography variant="body2">{selectedApplication.fullName}</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Citizenship</Typography>
                          <Typography variant="body2">{selectedApplication.citizenship}</Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Address</Typography>
                          <Typography variant="body2">{selectedApplication.address}</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">City</Typography>
                          <Typography variant="body2">{selectedApplication.city}</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Country</Typography>
                          <Typography variant="body2">{selectedApplication.country}</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Occupation</Typography>
                          <Typography variant="body2">{selectedApplication.occupation}</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">PEP Status</Typography>
                          <Typography variant="body2">
                            {selectedApplication.isPEP ? 'Is a PEP (HIGH RISK)' : 'Not a PEP'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Description sx={{ mr: 1 }} />
                        <Typography variant="h6">Documents</Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2">ID Document Type</Typography>
                          <Typography variant="body2">
                            {selectedApplication.idDocumentType?.replace('-', ' ').toUpperCase() || 'Not specified'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Button 
                            variant="outlined" 
                            fullWidth
                            startIcon={<Visibility />}
                            onClick={() => window.open(selectedApplication.idDocumentUrl, '_blank')}
                            disabled={!selectedApplication.idDocumentUrl}
                          >
                            View ID Document
                          </Button>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Button 
                            variant="outlined" 
                            fullWidth
                            startIcon={<Visibility />}
                            onClick={() => window.open(selectedApplication.proofOfAddressUrl, '_blank')}
                            disabled={!selectedApplication.proofOfAddressUrl}
                          >
                            View Proof of Address
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Flag sx={{ mr: 1 }} />
                        <Typography variant="h6">Crypto-Specific Information</Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Crypto Wallet Address</Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {selectedApplication.cryptoWallet || 'Not provided'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Source of Funds</Typography>
                          <Typography variant="body2">
                            {selectedApplication.sourceOfFunds}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Expected Investment Range</Typography>
                          <Typography variant="body2">
                            {selectedApplication.expectedInvestmentRange?.replace('-', ' - $').toUpperCase() || 'Not specified'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Risk Assessment</Typography>
                          <Box sx={{ mt: 1 }}>
                            {getCryptoRiskIndicator(selectedApplication)}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  {selectedApplication.status === 'pending' && (
                    <Card variant="outlined" sx={{ mt: 2, bgcolor: '#f9f9f9' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Decision
                        </Typography>
                        
                        {selectedApplication.status === 'pending' && (
                          <TextField
                            label="Rejection Reason (required if rejecting)"
                            fullWidth
                            multiline
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            margin="normal"
                          />
                        )}
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                        <Button 
                          onClick={handleCloseDialog} 
                          color="inherit"
                        >
                          Cancel
                        </Button>
                        
                        <Button 
                          variant="contained" 
                          color="success"
                          onClick={() => handleApprove(selectedApplication.id)}
                          disabled={processingId === selectedApplication.id}
                          startIcon={processingId === selectedApplication.id ? <CircularProgress size={20} /> : <CheckCircle />}
                        >
                          Approve
                        </Button>
                        
                        <Button 
                          variant="contained" 
                          color="error"
                          onClick={() => handleReject(selectedApplication.id)}
                          disabled={!rejectionReason || processingId === selectedApplication.id}
                          startIcon={processingId === selectedApplication.id ? <CircularProgress size={20} /> : <Cancel />}
                        >
                          Reject
                        </Button>
                      </CardActions>
                    </Card>
                  )}
                  
                  {selectedApplication.status === 'rejected' && (
                    <Card variant="outlined" sx={{ mt: 2, bgcolor: '#fff5f5' }}>
                      <CardContent>
                        <Typography variant="h6" color="error" gutterBottom>
                          Rejection Reason
                        </Typography>
                        <Typography variant="body2">
                          {selectedApplication.rejectionReason || 'No reason provided'}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default KYCManagement;