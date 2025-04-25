import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  TextField,
  Button
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import HttpsIcon from '@mui/icons-material/Https';
import CodeIcon from '@mui/icons-material/Code';

interface CryptoWebhookSecurityGuideProps {
  webhookSecret?: string;
  onGenerateSecret?: () => void;
}

const CryptoWebhookSecurityGuide: React.FC<CryptoWebhookSecurityGuideProps> = ({
  webhookSecret,
  onGenerateSecret
}) => {
  // Generate a sample HMAC signature calculation snippet
  const hmacSnippet = `
// Example implementation in Node.js
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const computedSignature = hmac.update(payload).digest('hex');
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(signature)
  );
}`;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SecurityIcon sx={{ mr: 1 }} /> Webhook Security
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" paragraph>
          Webhook security is critical for protecting your cryptocurrency payment system. 
          This guide explains how to implement and verify webhook signatures to prevent fraud.
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Security Warning</Typography>
          <Typography variant="body2">
            Without proper webhook verification, attackers could forge payment notifications and
            manipulate transaction statuses in your system.
          </Typography>
        </Alert>
      </Box>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <VerifiedUserIcon sx={{ mr: 1 }} /> How Webhook Signatures Work
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
            <ListItemText 
              primary="Shared Secret" 
              secondary="Both your server and the payment provider know a shared secret key" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
            <ListItemText 
              primary="Signature Generation" 
              secondary="The payment provider signs each webhook payload with this secret using HMAC-SHA256" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><VerifiedUserIcon fontSize="small" /></ListItemIcon>
            <ListItemText 
              primary="Verification" 
              secondary="Your server computes the same signature and verifies it matches what was provided" 
            />
          </ListItem>
        </List>
      </Paper>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <HttpsIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> 
            Webhook Secret Configuration
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Set this secret in your environment variables and in your CoinGate account's webhook settings.
            </Typography>
            
            <TextField
              fullWidth
              label="Webhook Secret"
              variant="outlined"
              value={webhookSecret || 'Not configured'}
              disabled
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            
            {onGenerateSecret && (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={onGenerateSecret}
              >
                Generate New Secret
              </Button>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Environment Variable Setup
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto'
            }}
          >
            <code>COINGATE_WEBHOOK_SECRET=your_webhook_secret</code>
          </Box>
        </CardContent>
      </Card>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> 
          Implementation Sample
        </Typography>
        <Typography variant="body2" paragraph>
          This shows how webhook signature verification works in the code:
        </Typography>
        <Box 
          component="pre" 
          sx={{ 
            backgroundColor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.8rem'
          }}
        >
          <code>{hmacSnippet}</code>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Headers to Look For:
          </Typography>
          <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
            <code>x-coingate-signature</code>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CryptoWebhookSecurityGuide;