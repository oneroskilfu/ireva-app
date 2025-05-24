import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Link } from 'wouter';
import MenuIcon from '@mui/icons-material/Menu';

function SimpleMainLayout({ children }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      {/* Simple App Bar */}
      <AppBar position="fixed" sx={{ backgroundColor: 'white', color: 'text.primary', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            href="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'text.primary', 
              fontWeight: 700,
              flexGrow: 1
            }}
          >
            iREVA
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button component={Link} href="/projects" sx={{ color: 'text.primary' }}>
              Properties
            </Button>
            <Button component={Link} href="/crypto-education" sx={{ color: 'text.primary' }}>
              Crypto Education
            </Button>
            <Button component={Link} href="/auth" variant="contained" color="primary">
              Get Started
            </Button>
          </Box>
          
          <IconButton 
            sx={{ display: { md: 'none' } }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Add padding to account for the fixed Navbar */}
      <Box component="main" sx={{ flexGrow: 1, pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
      
      {/* Simple Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} iREVA - Real Estate Investment Platform
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default SimpleMainLayout;