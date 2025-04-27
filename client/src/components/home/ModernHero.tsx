import React from 'react';
import { Box, Container, Typography, Button, Grid, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ModernHero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
        pb: { xs: 8, md: 12 },
        pt: { xs: 4, md: 8 },
      }}
    >
      {/* Gradient Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.08) 0%, transparent 40%)',
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <Box>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  component="span"
                  sx={{
                    display: 'inline-block',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 2,
                    px: 2,
                    py: 0.5,
                    borderRadius: '20px',
                    bgcolor: 'rgba(79, 70, 229, 0.1)',
                  }}
                >
                  Democratizing Real Estate Investment
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    mb: 3,
                    background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Invest in African Real Estate Today
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    color: 'text.secondary',
                    mb: 4,
                    maxWidth: '540px',
                    lineHeight: 1.6,
                  }}
                >
                  Start your real estate investment journey with as little as ₦250,000.
                  Access premium properties, secure transactions, and earn competitive returns
                  with our blockchain-powered platform.
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Button
                    component={Link}
                    href="/auth"
                    variant="contained"
                    size="large"
                    sx={{
                      borderRadius: '8px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #3730A3 0%, #6D28D9 100%)',
                        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Start Investing
                  </Button>
                  
                  <Button
                    component={Link}
                    href="/properties"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderRadius: '8px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        borderColor: theme.palette.primary.dark,
                        bgcolor: 'rgba(79, 70, 229, 0.04)',
                      },
                    }}
                  >
                    Explore Properties
                  </Button>
                </Box>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 5, flexWrap: 'wrap', gap: 3 }}>
                  {[
                    { number: "₦15B+", label: "Invested" },
                    { number: "1,000+", label: "Investors" },
                    { number: "45+", label: "Properties" },
                  ].map((stat, index) => (
                    <Box key={index} sx={{ mr: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h4"
                        component="span"
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary',
                          mb: 0.5
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: '560px',
                  width: '100%',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Modern building exterior"
                  sx={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover',
                  }}
                />
                
                {/* Overlay card with investment details */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 30,
                    left: 30,
                    right: 30,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    p: 3,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Featured Property
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Westfield Retail Center, Lagos
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Returns
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        9.8% APY
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Min. Investment
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        ₦250,000
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Funded
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        82%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ModernHero;