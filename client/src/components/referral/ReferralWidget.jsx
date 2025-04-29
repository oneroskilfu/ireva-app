import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import { 
  Share,
  ContentCopy,
  Check
} from '@mui/icons-material';
import axios from 'axios';

const ReferralWidget = () => {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/referral/info');
        setReferralData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching referral data:', err);
        setError('Failed to load referral information');
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  const handleCopyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setShowCopiedAlert(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareReferral = () => {
    if (navigator.share && referralData?.referralLink) {
      navigator.share({
        title: 'Join iREVA Real Estate Investment Platform',
        text: 'I\'m inviting you to join iREVA, a revolutionary real estate investment platform. Use my referral code to get $50 signup bonus!',
        url: referralData.referralLink
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      handleCopyReferralLink();
    }
  };

  const handleCloseAlert = () => {
    setShowCopiedAlert(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Use placeholder data if the API call doesn't return valid data
  const data = referralData || {
    referralCode: 'IRV-12345',
    referralLink: 'https://ireva.finance/ref/IRV-12345',
    referralBonus: 50,
    totalReferrals: 0,
    pendingReferrals: 0,
    successfulReferrals: 0,
    earnedBonuses: 0
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Share and Earn $50
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Invite friends to invest on iREVA and both of you will receive $50 bonus when they make their first investment.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              fullWidth
              label="Your Referral Code"
              value={data.referralCode}
              InputProps={{
                readOnly: true
              }}
              variant="outlined"
              size="small"
            />
            
            <Box sx={{ display: 'flex' }}>
              <Button
                variant="contained"
                startIcon={<Share />}
                onClick={handleShareReferral}
                sx={{ borderRadius: '4px', mr: 1, whiteSpace: 'nowrap' }}
              >
                Share
              </Button>
              
              <IconButton 
                onClick={handleCopyReferralLink} 
                color="primary"
                sx={{ border: 1, borderColor: 'divider' }}
              >
                {copied ? <Check /> : <ContentCopy />}
              </IconButton>
            </Box>
          </Stack>
          
          <Divider sx={{ my: 2 }} />
          
          <Stack 
            direction="row" 
            spacing={2} 
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Referrals
              </Typography>
              <Typography variant="h6">
                {data.totalReferrals}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Successful
              </Typography>
              <Typography variant="h6">
                {data.successfulReferrals}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Earned
              </Typography>
              <Typography variant="h6" color="success.main">
                ${data.earnedBonuses}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      
      <Snackbar
        open={showCopiedAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          Referral link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReferralWidget;