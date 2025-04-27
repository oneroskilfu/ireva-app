import React from 'react';
import { Box, CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { theme } from '../theme';
import AnimatedNavbar from '../components/navigation/AnimatedNavbar';
import AnimatedFooter from '../components/navigation/AnimatedFooter';
import ModernHero from '../components/home/ModernHero';
import HowItWorks from '../components/home/HowItWorks';
import FeaturedProperties from '../components/home/FeaturedProperties';

// Standalone page without AuthProvider dependency
const MuiHomePage = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
          <AnimatedNavbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <ModernHero />
            <HowItWorks />
            <FeaturedProperties />
          </Box>
          <AnimatedFooter />
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default MuiHomePage;