import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from '../Navbar';
import Footer from '../Footer';

function MainLayout({ children }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <Navbar />
      {/* Add padding to account for the fixed Navbar */}
      <Box component="main" sx={{ flexGrow: 1, pt: 10, pb: 4 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

export default MainLayout;