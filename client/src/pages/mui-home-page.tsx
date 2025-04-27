import React from 'react';
import { Container, Box, Typography, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Create a theme for consistent styling
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
    },
    secondary: {
      main: '#10B981',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#4F46E5',
          '&:hover': {
            backgroundColor: '#3c35c6',
          },
        },
      },
    },
  },
});

export default function MuiHomePage() {
  // Fetch properties from API
  const { data: properties = [] } = useQuery<Project[]>({
    queryKey: ["/api/properties"],
  });

  // Select first 3 properties for featured section
  const featuredProperties = properties.slice(0, 3);

  return (
    <ThemeProvider theme={theme}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flexGrow: 1 }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                py: { xs: 6, md: 8 },
                px: { xs: 2, md: 4 },
                bgcolor: 'rgba(79, 70, 229, 0.05)',
                borderRadius: 4,
                mt: 2,
                mx: { xs: 2, md: 4 }
              }}
            >
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, px: { xs: 2, md: 4 } }}>
                <Typography variant="h3" gutterBottom>
                  Invest in the Future of Real Estate
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Powered by Blockchain. Designed for You.
                </Typography>
                <Typography sx={{ mt: 2, fontSize: { xs: '1rem', md: '1.125rem' } }}>
                  With iREVA, anyone, anywhere can invest securely in prime real estate assets — through a simple, transparent, and crypto-enabled platform.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ mt: 4, width: { xs: '100%', sm: 'auto' } }}
                  color="primary"
                  component={Link}
                  href="/auth"
                >
                  Start Investing
                </Button>
              </Box>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                sx={{
                  flex: 1,
                  maxWidth: { xs: '90%', md: '500px' },
                  mt: { xs: 6, md: 0 },
                  mx: 'auto',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {/* Hero Image - Replace with your actual image */}
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Real Estate Investment"
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </Box>
            </Box>
          </motion.div>

          {/* Benefits Section */}
          <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
            <Typography variant="h4" align="center" gutterBottom>
              Why Choose iREVA?
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
              {[
                { title: 'Fractional Ownership', desc: 'Invest with as little as $50 and own a share of valuable properties.' },
                { title: 'Crypto Friendly', desc: 'Deposit and withdraw investments with Bitcoin, Ethereum, and more.' },
                { title: 'Secure and Transparent', desc: 'Blockchain-backed transactions, real-time tracking, and full KYC compliance.' },
                { title: 'Global Access', desc: 'Designed for investors in the diaspora and across emerging markets.' },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card sx={{ height: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Featured Projects Section */}
          <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: 'rgba(79, 70, 229, 0.05)' }}>
            <Container maxWidth="xl">
              <Typography variant="h4" align="center" gutterBottom>
                Featured Investment Opportunities
              </Typography>
              <Grid container spacing={4} sx={{ mt: 4 }}>
                {featuredProperties.length > 0 ? (
                  featuredProperties.map((property, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                      >
                        <Card>
                          <CardMedia
                            component="img"
                            height="200"
                            image={property.imageUrl || 'https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                            alt={property.name}
                          />
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              {property.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ROI: {property.targetReturn}% | Tenor: {property.term} Months | Location: {property.location}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Min: ₦{property.minimumInvestment?.toLocaleString()}
                              </Typography>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                color="primary"
                                component={Link}
                                href={`/properties/${property.id}`}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))
                ) : (
                  // Placeholder cards if no properties are fetched
                  Array.from({ length: 3 }).map((_, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                      >
                        <Card>
                          <CardMedia
                            component="img"
                            height="200"
                            image="https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            alt="Property"
                          />
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              Premium Estates - Lagos
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ROI: 18% | Tenor: 24 Months | Open for Crypto & Fiat
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))
                )}
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  color="primary" 
                  component={Link}
                  href="/properties"
                >
                  View All Properties
                </Button>
              </Box>
            </Container>
          </Box>

          {/* How it Works Section */}
          <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
            <Typography variant="h4" align="center" gutterBottom>
              How iREVA Works
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
              {[
                { title: '1. Register & Verify', desc: 'Sign up, complete KYC, and start browsing real estate projects.' },
                { title: '2. Fund Wallet', desc: 'Deposit using your crypto wallet or local bank account.' },
                { title: '3. Invest & Earn', desc: 'Choose projects, invest, and watch your portfolio grow securely.' },
              ].map((step, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card sx={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box textAlign="center" sx={{ py: 8, bgcolor: 'rgba(79, 70, 229, 0.05)' }}>
              <Container maxWidth="md">
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Your Gateway to Building Wealth Starts Here
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '700px', mx: 'auto' }}>
                  Join our growing community of investors who are already building their real estate portfolio with iREVA's innovative platform.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  sx={{ px: 4, py: 1.5 }}
                  component={Link}
                  href="/auth"
                >
                  Join iREVA Now
                </Button>
              </Container>
            </Box>
          </motion.div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}