import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CelebrationIcon from '@mui/icons-material/Celebration';

// Animation variants for container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Animation variants for each step
const stepVariants = {
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

// Step data
const steps = [
  {
    icon: <SearchIcon fontSize="large" />,
    title: "Browse Properties",
    description: "Explore our curated selection of high-quality real estate investment opportunities across Africa."
  },
  {
    icon: <AccountBalanceWalletIcon fontSize="large" />,
    title: "Invest Securely",
    description: "Fund your wallet and invest in properties with as little as ₦250,000. Choose cryptocurrency or traditional payment methods."
  },
  {
    icon: <TrendingUpIcon fontSize="large" />,
    title: "Track Performance",
    description: "Monitor your investments in real-time with our comprehensive dashboard and analytics tools."
  },
  {
    icon: <CelebrationIcon fontSize="large" />,
    title: "Receive Returns",
    description: "Earn attractive returns on your investment over the 5-year maturity period with quarterly dividends."
  }
];

const HowItWorks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="overline"
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                color: theme.palette.primary.main,
                letterSpacing: '0.1em',
                mb: 1,
                display: 'block',
              }}
            >
              SIMPLE PROCESS
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
              How It Works
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: 'text.secondary',
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              Investing in African real estate has never been easier. Follow these simple steps to start building your property portfolio today.
            </Typography>
          </motion.div>
        </Box>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <Grid container spacing={isMobile ? 4 : isTablet ? 3 : 4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={stepVariants}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: '16px',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      },
                      border: '1px solid',
                      borderColor: 'divider',
                      overflow: 'visible',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: theme.palette.primary.main,
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
                      }}
                    >
                      {step.icon}
                    </Box>
                    <CardContent sx={{ pt: 6, pb: 4, px: 3, textAlign: 'center' }}>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          mb: 2,
                          mt: 1
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Numbered Timeline for Desktop */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'block' },
            position: 'relative',
            height: '4px',
            bgcolor: 'divider',
            maxWidth: '80%', 
            mx: 'auto',
            mt: -10,
            mb: 12,
            zIndex: -1,
          }}
        >
          {[0, 1, 2, 3].map((_, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: `${index * 33.3}%`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                bgcolor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
              }}
            >
              {index + 1}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;