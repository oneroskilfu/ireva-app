import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Link, 
  Divider, 
  Button, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as WouterLink } from 'wouter';
import { FileDown, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CookiesPolicyPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveDate = "April 1, 2025";

  // Function to handle PDF download
  const handleDownloadPdf = () => {
    window.open('/pdfs/cookies-policy.pdf', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <Container maxWidth="md" sx={{ py: 8, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Link 
            component={WouterLink} 
            href="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <ArrowLeft size={18} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Back to Home
            </Typography>
          </Link>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              iREVA Cookies Policy
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleDownloadPdf}
              startIcon={<FileDown size={18} />}
              sx={{ mt: 2 }}
            >
              Download PDF
            </Button>
            
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 3 }}>
              Effective Date: {effectiveDate}
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            Welcome to iREVA. This Cookie Policy explains how iREVA ("we", "us", or "our") uses cookies 
            and similar technologies to recognize you when you visit our website and mobile application (collectively, "Platform"). 
            It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </Typography>
          
          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            1. What Are Cookies
          </Typography>
          
          <Typography variant="body1" paragraph>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
            Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
            as well as to provide reporting information.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Cookies set by the website owner (in this case, iREVA) are called "first party cookies". 
            Cookies set by parties other than the website owner are called "third party cookies". 
            Third party cookies enable third party features or functionality to be provided on or through the website 
            (e.g. like advertising, interactive content and analytics). The parties that set these third party cookies 
            can recognize your computer both when it visits the website in question and also when it visits certain other websites.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            2. Why We Use Cookies
          </Typography>
          
          <Typography variant="body1" paragraph>
            We use first and third party cookies for several reasons. Some cookies are required for technical reasons 
            in order for our Platform to operate, and we refer to these as "essential" or "strictly necessary" cookies. 
            Other cookies also enable us to track and target the interests of our users to enhance the experience on our Platform. 
            Third parties serve cookies through our Platform for analytics and other purposes.
          </Typography>
          
          <Typography variant="body1" paragraph>
            The specific types of first and third party cookies served through our Platform and the purposes they perform are described below:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Essential Cookies</Typography>
              <Typography variant="body1">
                These cookies are strictly necessary to provide you with services available through our Platform and to use some of its features, 
                such as access to secure areas. Without these cookies, services you have asked for, like secure login, would not be possible.
              </Typography>
            </Box>
            <Box component="li" sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Performance & Functionality Cookies</Typography>
              <Typography variant="body1">
                These cookies are used to enhance the performance and functionality of our Platform but are non-essential to their use. 
                However, without these cookies, certain functionality may become unavailable.
              </Typography>
            </Box>
            <Box component="li" sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Analytics & Customization Cookies</Typography>
              <Typography variant="body1">
                These cookies collect information that is used either in aggregate form to help us understand how our Platform is being used 
                or how effective our marketing campaigns are, or to help us customize our Platform for you.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            3. How Can You Control Cookies
          </Typography>
          
          <Typography variant="body1" paragraph>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by following 
            the instructions provided in the cookie banner that appears when you first visit our Platform.
          </Typography>
          
          <Typography variant="body1" paragraph>
            You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our 
            Platform though your access to some functionality and areas may be restricted. As the means by which you can refuse cookies through 
            your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            4. How Often Will We Update This Cookie Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, 
            legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
          </Typography>
          
          <Typography variant="body1" paragraph>
            The date at the top of this Cookie Policy indicates when it was last updated.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            5. Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about our use of cookies or other technologies, please email us at{' '}
            <Link href="mailto:ireva.investments@gmail.com">ireva.investments@gmail.com</Link>.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
};

export default CookiesPolicyPage;