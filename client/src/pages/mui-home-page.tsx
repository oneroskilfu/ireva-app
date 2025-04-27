import React from 'react';
import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../theme';
import AnimatedNavbar from '../components/navigation/AnimatedNavbar';
import ModernHero from '../components/home/ModernHero';
import HowItWorks from '../components/home/HowItWorks';
import FeaturedProperties from '../components/home/FeaturedProperties';

export default function MuiHomePage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AnimatedNavbar />
        <ModernHero />
        <HowItWorks />
        <FeaturedProperties />
        
        {/* Footer placeholder - could be extracted to its own component */}
        <Box
          component="footer"
          sx={{
            py: 6,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) => theme.palette.primary.main,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Container maxWidth="lg">
            <Box>
              © {new Date().getFullYear()} iREVA - All Rights Reserved
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}