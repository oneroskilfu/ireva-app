import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { Link as WouterLink } from 'wouter';

const CookiesPolicyPage: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={WouterLink} href="/" underline="hover" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Cookies Policy</Typography>
        </Breadcrumbs>

        <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4 }}>
          Cookies Policy
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Last Updated: April 27, 2025
          </Typography>
          
          <Typography variant="body1" paragraph>
            This Cookies Policy explains how iREVA ("we", "our", or "us") uses cookies and similar technologies on our website and mobile applications.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            What Are Cookies?
          </Typography>
          
          <Typography variant="body1" paragraph>
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit websites. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how users interact with their sites.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Other similar technologies, such as web beacons, pixel tags, and local storage, may also be used for the same purposes.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Types of Cookies We Use
          </Typography>
          
          <Typography variant="body1" paragraph>
            We use the following types of cookies:
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Performance and Analytics Cookies:</strong> These cookies collect information about how you use our website, such as which pages you visit most often and if you receive error messages. They help us improve how our website works and understand user behavior.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Functionality Cookies:</strong> These cookies allow us to remember choices you make and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we have added to our pages.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Targeting or Advertising Cookies:</strong> These cookies collect information about your browsing habits to make advertising more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Specific Cookies We Use
          </Typography>
          
          <Typography variant="body1" paragraph>
            Some of the specific cookies we use include:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Authentication cookies:</strong> To remember your login status and maintain your session.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Preference cookies:</strong> To remember your settings and preferences, such as language and region.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Analytics cookies:</strong> We use Google Analytics to collect information about how visitors use our website. This helps us improve our site and user experience.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Security cookies:</strong> To detect and prevent fraud and ensure the security of your account and transactions.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Third-Party Cookies
          </Typography>
          
          <Typography variant="body1" paragraph>
            Some cookies are placed by third parties on our website. These third parties may include:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Analytics providers (like Google Analytics)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Payment processors
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Social media platforms (if you use social media features on our site)
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            Third-party cookies are governed by the respective privacy policies of these third parties.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Managing Cookies
          </Typography>
          
          <Typography variant="body1" paragraph>
            Most web browsers allow you to control cookies through their settings preferences. Here's how to manage cookies in common browsers:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Apple Safari:</strong> Preferences → Privacy → Cookies and website data
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Microsoft Edge:</strong> Settings → Privacy, search, and services → Cookies
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            Please note that restricting cookies may impact your experience on our website, as some features may not function properly.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Changes to This Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update our Cookies Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
          </Typography>
          
          <Typography variant="body1" paragraph>
            We encourage you to review this policy periodically to stay informed about how we use cookies.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about our Cookies Policy, please contact us at:
          </Typography>
          
          <Typography variant="body1" paragraph>
            Email: privacy@ireva.com
          </Typography>
          
          <Typography variant="body1" paragraph>
            Address: 123 Investment Street, Lagos, Nigeria
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default CookiesPolicyPage;