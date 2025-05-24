import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Paper,
  Box,
  Divider,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText
} from '@mui/material';
import { uploadDocument } from '../../services/kycService';

/**
 * Enhanced KYC Form with crypto-specific compliance fields
 * This form collects additional information required for crypto investors
 */
const KYCForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    country: '',
    idDocumentFile: null,
    idDocumentType: 'passport',
    proofOfAddressFile: null,
    cryptoWallet: '',
    sourceOfFunds: '',
    occupation: '',
    citizenship: '',
    isPEP: false, // Politically Exposed Person
    expectedInvestmentRange: '',
    acceptTerms: false
  });

  const [idUploadProgress, setIdUploadProgress] = useState(0);
  const [addressUploadProgress, setAddressUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0] || null
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleIdDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIdUploadProgress(10);
      setFormData({
        ...formData,
        idDocumentFile: file
      });
      
      // Simulate or perform actual upload
      // await uploadDocument(file, (progress) => setIdUploadProgress(progress));
      
      // For now, just simulate progress
      let progress = 10;
      const interval = setInterval(() => {
        progress += 10;
        setIdUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);
      
    } catch (error) {
      console.error('Error uploading ID document:', error);
      setFormErrors({
        ...formErrors,
        idDocumentFile: 'Failed to upload file. Please try again.'
      });
      setIdUploadProgress(0);
    }
  };

  const handleAddressDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setAddressUploadProgress(10);
      setFormData({
        ...formData,
        proofOfAddressFile: file
      });
      
      // Simulate or perform actual upload
      // await uploadDocument(file, (progress) => setAddressUploadProgress(progress));
      
      // For now, just simulate progress
      let progress = 10;
      const interval = setInterval(() => {
        progress += 10;
        setAddressUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);
      
    } catch (error) {
      console.error('Error uploading address document:', error);
      setFormErrors({
        ...formErrors,
        proofOfAddressFile: 'Failed to upload file. Please try again.'
      });
      setAddressUploadProgress(0);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validation
    if (!formData.fullName) errors.fullName = 'Full name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.country) errors.country = 'Country is required';
    if (!formData.idDocumentFile) errors.idDocumentFile = 'ID document is required';
    if (!formData.proofOfAddressFile) errors.proofOfAddressFile = 'Proof of address is required';
    if (!formData.sourceOfFunds) errors.sourceOfFunds = 'Source of funds is required';
    if (!formData.occupation) errors.occupation = 'Occupation is required';
    if (!formData.citizenship) errors.citizenship = 'Citizenship is required';
    if (!formData.expectedInvestmentRange) errors.expectedInvestmentRange = 'Expected investment range is required';
    if (!formData.acceptTerms) errors.acceptTerms = 'You must accept the terms and conditions';
    
    // Wallet address validation (optional but must be valid if provided)
    if (formData.cryptoWallet && !formData.cryptoWallet.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
      errors.cryptoWallet = 'Please enter a valid Ethereum wallet address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Format the data for submission
      const formattedData = {
        ...formData,
        idDocumentFile: formData.idDocumentFile ? formData.idDocumentFile.name : null,
        proofOfAddressFile: formData.proofOfAddressFile ? formData.proofOfAddressFile.name : null,
      };
      
      await onSubmit(formattedData);
    } catch (error) {
      console.error('KYC submission error:', error);
    }
  };

  const investmentRanges = [
    { value: 'under-10k', label: 'Under $10,000' },
    { value: '10k-50k', label: '$10,000 - $50,000' },
    { value: '50k-100k', label: '$50,000 - $100,000' },
    { value: '100k-500k', label: '$100,000 - $500,000' },
    { value: 'above-500k', label: 'Above $500,000' }
  ];

  const idDocumentTypes = [
    { value: 'passport', label: 'Passport' },
    { value: 'drivers-license', label: 'Driver\'s License' },
    { value: 'national-id', label: 'National ID Card' }
  ];

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Complete KYC Verification
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField 
              label="Full Legal Name (as on ID)" 
              name="fullName" 
              fullWidth 
              required 
              onChange={handleChange}
              value={formData.fullName}
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField 
              label="Residential Address" 
              name="address" 
              fullWidth 
              required 
              onChange={handleChange}
              value={formData.address}
              error={!!formErrors.address}
              helperText={formErrors.address}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField 
              label="City" 
              name="city" 
              fullWidth 
              required 
              onChange={handleChange}
              value={formData.city}
              error={!!formErrors.city}
              helperText={formErrors.city}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField 
              label="Country" 
              name="country" 
              fullWidth 
              required 
              onChange={handleChange}
              value={formData.country}
              error={!!formErrors.country}
              helperText={formErrors.country}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField 
              label="Citizenship/Nationality" 
              name="citizenship" 
              fullWidth 
              required 
              onChange={handleChange}
              value={formData.citizenship}
              error={!!formErrors.citizenship}
              helperText={formErrors.citizenship}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField 
              label="Occupation" 
              name="occupation" 
              fullWidth 
              required 
              onChange={handleChange}
              value={formData.occupation}
              error={!!formErrors.occupation}
              helperText={formErrors.occupation}
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Identity Verification
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth error={!!formErrors.idDocumentType}>
              <InputLabel id="id-document-type-label">ID Document Type</InputLabel>
              <Select
                labelId="id-document-type-label"
                name="idDocumentType"
                value={formData.idDocumentType}
                label="ID Document Type"
                onChange={handleChange}
              >
                {idDocumentTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: '56px' }}
                color={formErrors.idDocumentFile ? "error" : "primary"}
              >
                {idUploadProgress > 0 && idUploadProgress < 100
                  ? `Uploading... ${idUploadProgress}%`
                  : formData.idDocumentFile
                    ? `Selected: ${formData.idDocumentFile.name}`
                    : "Upload ID Document"}
                <input
                  type="file"
                  hidden
                  name="idDocumentFile"
                  onChange={(e) => {
                    handleChange(e);
                    handleIdDocumentUpload(e);
                  }}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </Button>
              {formErrors.idDocumentFile && (
                <FormHelperText error>{formErrors.idDocumentFile}</FormHelperText>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: '56px' }}
                color={formErrors.proofOfAddressFile ? "error" : "primary"}
              >
                {addressUploadProgress > 0 && addressUploadProgress < 100
                  ? `Uploading... ${addressUploadProgress}%`
                  : formData.proofOfAddressFile
                    ? `Selected: ${formData.proofOfAddressFile.name}`
                    : "Upload Proof of Address (utility bill, bank statement)"}
                <input
                  type="file"
                  hidden
                  name="proofOfAddressFile"
                  onChange={(e) => {
                    handleChange(e);
                    handleAddressDocumentUpload(e);
                  }}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </Button>
              {formErrors.proofOfAddressFile && (
                <FormHelperText error>{formErrors.proofOfAddressFile}</FormHelperText>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Crypto-Specific Information
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField 
              label="ETH Wallet Address (for receiving payouts)" 
              name="cryptoWallet" 
              fullWidth 
              onChange={handleChange}
              value={formData.cryptoWallet}
              error={!!formErrors.cryptoWallet}
              helperText={formErrors.cryptoWallet || "Optional: Enter your Ethereum wallet address if you plan to use crypto payments"}
              placeholder="0x..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField 
              label="Source of Funds" 
              name="sourceOfFunds" 
              fullWidth 
              required 
              onChange={handleChange}
              value={formData.sourceOfFunds}
              error={!!formErrors.sourceOfFunds}
              helperText={formErrors.sourceOfFunds || "e.g., Employment income, Investment returns, Business revenue"}
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth required error={!!formErrors.expectedInvestmentRange}>
              <InputLabel id="investment-range-label">Expected Investment Range</InputLabel>
              <Select
                labelId="investment-range-label"
                name="expectedInvestmentRange"
                value={formData.expectedInvestmentRange}
                label="Expected Investment Range"
                onChange={handleChange}
              >
                {investmentRanges.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.expectedInvestmentRange && (
                <FormHelperText error>{formErrors.expectedInvestmentRange}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox 
                  name="isPEP" 
                  color="primary" 
                  checked={formData.isPEP}
                  onChange={handleChange} 
                />
              }
              label={
                <Typography variant="body2">
                  I am a Politically Exposed Person (PEP) or related to a PEP
                  <FormHelperText>
                    A PEP is an individual who is or has been entrusted with a prominent public function
                  </FormHelperText>
                </Typography>
              }
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox 
                  name="acceptTerms" 
                  color="primary" 
                  checked={formData.acceptTerms}
                  onChange={handleChange} 
                  required
                />
              }
              label={
                <Typography variant="body2">
                  I confirm that all information provided is accurate and complete. I understand that iREVA will process my personal data in accordance with applicable laws and regulations.
                </Typography>
              }
            />
            {formErrors.acceptTerms && (
              <FormHelperText error>{formErrors.acceptTerms}</FormHelperText>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Processing...' : 'Submit KYC Application'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default KYCForm;