import React from 'react';
import { Box, Container, Typography, Link, IconButton, Grid, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Link as WouterLink } from 'wouter';

const footerLinks = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', url: '/company/team' },
      { label: 'Our Team', url: '/company/team' },
      { label: 'Careers', url: '/company/careers' },
      { label: 'Contact', url: '/contact' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Properties', url: '/properties' },
      { label: 'Investment Guide', url: '/resources/investment-guide' },
      { label: 'Blog', url: '/blog' },
      { label: 'FAQ', url: '/faq' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', url: '/legal/privacy' },
      { label: 'Terms of Service', url: '/legal/terms' },
      { label: 'Cookie Policy', url: '/legal/cookies' },
      { label: 'Investor Disclosures', url: '/legal/disclosures' },
    ]
  }
];

const AnimatedFooter = () => {
  const theme = useTheme();
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0f172a',
        color: 'white',
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                iREVA
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography variant="subtitle1" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
                Democratizing Real Estate Investment in Africa
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map((Icon, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.2, y: -3 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <IconButton
                      component={Link}
                      href="#"
                      target="_blank"
                      rel="noopener"
                      sx={{ 
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                      size="small"
                    >
                      <Icon />
                    </IconButton>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Footer Links Sections */}
          {footerLinks.map((section, sectionIndex) => (
            <Grid item xs={12} sm={6} md={2} key={sectionIndex}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + (sectionIndex * 0.1) }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 3,
                    color: theme.palette.primary.light
                  }}
                >
                  {section.title}
                </Typography>
                
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {section.links.map((link, linkIndex) => (
                    <motion.li 
                      key={linkIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.4 + (sectionIndex * 0.1) + (linkIndex * 0.1) 
                      }}
                      style={{ marginBottom: '0.75rem' }}
                    >
                      <Link
                        component={WouterLink}
                        href={link.url}
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          textDecoration: 'none',
                          '&:hover': {
                            color: 'white',
                            textDecoration: 'underline',
                          },
                          fontSize: '0.9rem'
                        }}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          ))}
          
          {/* Newsletter Section */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: theme.palette.primary.light
                }}
              >
                Join Our Community
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                Get exclusive investment opportunities and market insights delivered to your inbox.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  style={{ width: '100%' }}
                >
                  <Link
                    component={WouterLink}
                    href="/auth" 
                    sx={{ 
                      display: 'inline-block',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 600,
                      p: 1.5,
                      textAlign: 'center',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      width: '100%',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    Join Now
                  </Link>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
        
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            mt: 6, 
            pt: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' }
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: { xs: 'center', md: 'left' } }}>
              © {new Date().getFullYear()} iREVA. All rights reserved.
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 3, 
                mt: { xs: 2, md: 0 } 
              }}
            >
              <Link href="#" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Privacy
              </Link>
              <Link href="#" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Terms
              </Link>
              <Link href="#" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Cookies
              </Link>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default AnimatedFooter;