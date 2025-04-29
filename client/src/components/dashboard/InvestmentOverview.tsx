import React from 'react';
import { Card, CardContent, Typography, Grid, Box, LinearProgress, Divider } from '@mui/material';
import { TrendingUp, AccountBalance, Apartment } from '@mui/icons-material';

const InvestmentOverview: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          height: '100%', 
          boxShadow: 2,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  borderRadius: '50%', 
                  bgcolor: 'primary.light', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AccountBalance sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" color="text.secondary">Total Investment</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>₦10,500,000</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'success.main', fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="body2" color="success.main">
                +₦500,000 from last month
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          height: '100%', 
          boxShadow: 2,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  borderRadius: '50%', 
                  bgcolor: 'success.light', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <TrendingUp sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" color="text.secondary">ROI to Date</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>₦1,250,000</Typography>
            
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Annual ROI</Typography>
                <Typography variant="body2" fontWeight="bold">12.5%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={12.5 / 0.2} 
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          height: '100%', 
          boxShadow: 2,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  borderRadius: '50%', 
                  bgcolor: 'secondary.light', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Apartment sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" color="text.secondary">Active Projects</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>3</Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Lagos</Typography>
                <Typography variant="body1" fontWeight="medium">2</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Abuja</Typography>
                <Typography variant="body1" fontWeight="medium">1</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Maturity</Typography>
                <Typography variant="body1" fontWeight="medium">2024</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default InvestmentOverview;