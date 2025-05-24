import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, Rating, Chip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Link } from 'wouter';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Example properties
const featuredProperties = [
  {
    id: 1,
    name: 'Heritage Garden Estate',
    location: 'Abuja',
    type: 'residential',
    imageUrl: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    targetReturn: '8.5',
    minimumInvestment: 500000,
    term: 60,
    totalFunding: 350000000,
    currentFunding: 210000000,
    numberOfInvestors: 72,
    daysLeft: 30,
    rating: 4.7,
  },
  {
    id: 2,
    name: 'Westfield Retail Center',
    location: 'Lagos',
    type: 'commercial',
    imageUrl: 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    targetReturn: '9.8',
    minimumInvestment: 250000,
    term: 60,
    totalFunding: 900000000,
    currentFunding: 740000000,
    numberOfInvestors: 120,
    daysLeft: 45,
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Urban Heights Apartments',
    location: 'Port Harcourt',
    type: 'residential',
    imageUrl: 'https://images.unsplash.com/photo-1576354302919-96748cb8299e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    targetReturn: '7.9',
    minimumInvestment: 350000,
    term: 48,
    totalFunding: 450000000,
    currentFunding: 320000000,
    numberOfInvestors: 85,
    daysLeft: 15,
    rating: 4.5,
  }
];

const FeaturedProperties = () => {
  const theme = useTheme();
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  // Function to calculate funding progress percentage
  const calculateProgress = (current: number, total: number) => {
    return Math.min(Math.round((current / total) * 100), 100);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 2,
              }}
            >
              Featured Properties
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: 'text.secondary',
                maxWidth: '800px',
                mx: 'auto',
                mb: 4,
              }}
            >
              Discover our handpicked selection of high-yield real estate investment opportunities across Nigeria.
            </Typography>
          </motion.div>
        </Box>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <Grid container spacing={4}>
            {featuredProperties.map((property, index) => (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <motion.div variants={cardVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={property.imageUrl}
                        alt={property.name}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          zIndex: 1,
                        }}
                      >
                        <Chip
                          label={property.type === 'residential' ? 'Residential' : 'Commercial'}
                          size="small"
                          sx={{
                            bgcolor: property.type === 'residential' ? theme.palette.primary.main : theme.palette.secondary.main,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={property.rating}
                          precision={0.1}
                          size="small"
                          readOnly
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({property.numberOfInvestors})
                        </Typography>
                      </Box>
                      
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h3"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {property.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {property.location}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Funding Progress
                        </Typography>
                        <Box
                          sx={{
                            height: '8px',
                            bgcolor: 'rgba(0, 0, 0, 0.08)',
                            borderRadius: '4px',
                            mb: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${calculateProgress(property.currentFunding, property.totalFunding)}%`,
                              bgcolor: theme.palette.primary.main,
                              borderRadius: '4px',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {calculateProgress(property.currentFunding, property.totalFunding)}% Funded
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {property.daysLeft} days left
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Target Return
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {property.targetReturn}% APY
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Min. Investment
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatCurrency(property.minimumInvestment)}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Button
                        component={Link}
                        href={`/property/${property.id}`}
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          borderRadius: '8px',
                          py: 1.2,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #3730A3 0%, #4F46E5 100%)',
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              component={Link}
              href="/properties"
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
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
              View All Properties
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedProperties;