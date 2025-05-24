import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Box, Skeleton } from '@mui/material';
import { fetchRoiStats } from '../../services/investorRoiService';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';

const ROIOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchRoiStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load ROI stats:', error);
        toast.error('Failed to load ROI statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Calculate days until next payout
  const getDaysUntilNextPayout = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const nextDate = new Date(dateString);
      const today = new Date();
      const diffTime = nextDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Overdue';
      if (diffDays === 0) return 'Today';
      return `${diffDays} days`;
    } catch (error) {
      console.error('Error calculating days:', error);
      return 'Unknown';
    }
  };

  return (
    <Grid container spacing={3} sx={{ marginBottom: '2rem' }}>
      <Grid item xs={12} md={3}>
        <Paper 
          sx={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            borderTop: '4px solid #4B3B2A',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B3B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ color: '#4B3B2A', fontWeight: 600, mb: 1 }}>
            Total ROI Earned
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="80%" height={60} sx={{ mx: 'auto' }} />
          ) : (
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {formatCurrency(stats?.totalEarnings || 0)}
            </Typography>
          )}
          <Typography variant="subtitle2" color="text.secondary">
            Lifetime returns
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper 
          sx={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            borderTop: '4px solid #4B3B2A',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B3B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10"></path>
              <path d="M18 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ color: '#4B3B2A', fontWeight: 600, mb: 1 }}>
            Average ROI
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="80%" height={60} sx={{ mx: 'auto' }} />
          ) : (
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {stats?.averageRoi || '0.0'}%
            </Typography>
          )}
          <Typography variant="subtitle2" color="text.secondary">
            Annual return
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper 
          sx={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            borderTop: '4px solid #4B3B2A',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B3B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ color: '#4B3B2A', fontWeight: 600, mb: 1 }}>
            Active Investments
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="80%" height={60} sx={{ mx: 'auto' }} />
          ) : (
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {stats?.activeInvestments || 0}
            </Typography>
          )}
          <Typography variant="subtitle2" color="text.secondary">
            Properties
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper 
          sx={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            borderTop: '4px solid #4B3B2A',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B3B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ color: '#4B3B2A', fontWeight: 600, mb: 1 }}>
            Next Payout
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="80%" height={60} sx={{ mx: 'auto' }} />
          ) : (
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {getDaysUntilNextPayout(stats?.nextPayoutDate)}
            </Typography>
          )}
          <Typography variant="subtitle2" color="text.secondary">
            {loading ? (
              <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
            ) : (
              formatDate(stats?.nextPayoutDate)
            )}
          </Typography>
        </Paper>
      </Grid>
      
      <ToastContainer position="bottom-right" autoClose={5000} />
    </Grid>
  );
};

export default ROIOverview;