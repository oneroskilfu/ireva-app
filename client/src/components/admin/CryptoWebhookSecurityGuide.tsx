import React from 'react';
import { Card, CardContent, Typography, Box, Alert, Button, Paper, Divider } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useToast } from '@/hooks/use-toast';

interface CryptoWebhookSecurityGuideProps {
  webhookSecret?: string;
  onGenerateSecret: () => void;
}

const CryptoWebhookSecurityGuide: React.FC<CryptoWebhookSecurityGuideProps> = ({
  webhookSecret,
  onGenerateSecret
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "The code has been copied to your clipboard",
        });
      },
      (err) => {
        toast({
          title: "Copy failed",
          description: "Could not copy text: " + err,
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <SecurityIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h5">Webhook Security Implementation Guide</Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Securing your webhook endpoints is critical to prevent unauthorized payment confirmations.
          This guide will help you implement proper webhook security measures.
        </Alert>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
            <VpnKeyIcon sx={{ mr: 1 }} /> Webhook Secret Key
          </Typography>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            {webhookSecret ? (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1, overflow: 'auto', flexGrow: 1 }}>
                  {webhookSecret}
                </Typography>
                <Button 
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyToClipboard(webhookSecret)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  Copy
                </Button>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography color="textSecondary">
                  No webhook secret configured yet.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={onGenerateSecret}
                  size="small"
                >
                  Generate Secret
                </Button>
              </Box>
            )}
          </Paper>
          <Typography variant="body2">
            This secret key is used to verify that incoming webhook requests are legitimate and coming from your payment provider.
            Store this key securely in your environment variables.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box mb={3}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
            <LockIcon sx={{ mr: 1 }} /> Signature Verification Implementation
          </Typography>
          <Typography variant="body2" paragraph>
            Below is an example of how webhook signature verification works:
          </Typography>
          
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
{`// The payment provider sends a signature in the request headers
// This signature is a hash of the request body + your webhook secret

// 1. Extract the signature from headers
const signature = req.headers['x-webhook-signature'];

// 2. Get the raw body (must be preserved as raw string)
const rawBody = req.rawBody;

// 3. Create your own signature using the same algorithm
const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
hmac.update(rawBody);
const computedSignature = hmac.digest('hex');

// 4. Compare signatures to verify authenticity
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(computedSignature)
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}`}
            </Typography>
            <Button 
              startIcon={<ContentCopyIcon />}
              onClick={() => copyToClipboard(`// The payment provider sends a signature in the request headers
// This signature is a hash of the request body + your webhook secret

// 1. Extract the signature from headers
const signature = req.headers['x-webhook-signature'];

// 2. Get the raw body (must be preserved as raw string)
const rawBody = req.rawBody;

// 3. Create your own signature using the same algorithm
const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
hmac.update(rawBody);
const computedSignature = hmac.digest('hex');

// 4. Compare signatures to verify authenticity
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(computedSignature)
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}`)}
              size="small"
              sx={{ mt: 1 }}
            >
              Copy Code
            </Button>
          </Paper>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Important Security Notes:</Typography>
          <ul>
            <li>Keep your webhook secret out of your code repository</li>
            <li>Verify signatures on every webhook request</li>
            <li>Use constant-time comparison (like crypto.timingSafeEqual) to prevent timing attacks</li>
            <li>Configure IP restrictions in production if supported by your provider</li>
            <li>Implement idempotency to prevent duplicate transaction processing</li>
          </ul>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CryptoWebhookSecurityGuide;