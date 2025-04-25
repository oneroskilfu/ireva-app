import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CodeIcon from '@mui/icons-material/Code';
import PaymentIcon from '@mui/icons-material/Payment';
import WebhookIcon from '@mui/icons-material/Webhook';
import SettingsIcon from '@mui/icons-material/Settings';
import PieChart from '@mui/icons-material/PieChart';
import CryptoIntegrationValidator from '../../components/admin/CryptoIntegrationValidator';
import CryptoWebhookSecurityGuide from '../../components/admin/CryptoWebhookSecurityGuide';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

// Define types for API responses
interface EnvironmentStatus {
  success: boolean;
  missingKeys: string[];
  presentKeys: string[];
}

interface WebhookStatus {
  success: boolean;
  message: string;
  webhooks?: any[];
  error?: any;
}

interface TransactionStatus {
  success: boolean;
  message: string;
  order?: any;
  error?: any;
}

interface UIStatus {
  success: boolean;
  message: string;
}

interface IntegrationStatus {
  environment: EnvironmentStatus;
  webhooks: WebhookStatus;
  testTransaction: TransactionStatus;
  uiIntegration: UIStatus;
  completedSteps: string[];
  isComplete: boolean;
}

const CryptoIntegrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { toast } = useToast();

  // Fetch integration status
  const { data, isLoading, error, refetch } = useQuery<IntegrationStatus>({
    queryKey: ['/api/crypto-integration/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/crypto-integration/status');
      return response.json();
    },
    refetchInterval: 0, // Only fetch on demand
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/crypto-integration/test");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test successful",
        description: "Crypto payment test was successful",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto-integration/status'] });
      refetch(); // Refresh the status data
    },
    onError: (error: Error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Get status icon
  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircleIcon color="success" fontSize="large" /> : 
      <ErrorIcon color="error" fontSize="large" />;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading integration status: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Crypto Integration Setup
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<PieChart />}
          component="a"
          href="/admin/crypto-transactions"
        >
          View Crypto Transactions
        </Button>
      </Box>
      
      <Box mb={4}>
        <Typography variant="body1" paragraph>
          This checklist will help you set up and verify cryptocurrency payments for iREVA. Follow each step to ensure proper integration.
        </Typography>
      </Box>

      {/* Progress Summary */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Integration Progress
          </Typography>
          <Box display="flex" alignItems="center" mb={2}>
            <Box position="relative" display="inline-flex" mr={2}>
              <CircularProgress 
                variant="determinate" 
                value={data && data.completedSteps ? (data.completedSteps.length / 4) * 100 : 0} 
                color={data?.isComplete ? "success" : "primary"}
                size={60}
              />
              <Box
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
                top={0}
                left={0}
                bottom={0}
                right={0}
              >
                <Typography variant="caption" component="div" color="text.secondary">
                  {data && data.completedSteps ? Math.round((data.completedSteps.length / 4) * 100) : 0}%
                </Typography>
              </Box>
            </Box>
            <Typography>
              {data?.isComplete 
                ? "All integration steps completed successfully!" 
                : `${data?.completedSteps ? data.completedSteps.length : 0} of 4 steps completed`}
            </Typography>
          </Box>
          
          {data?.isComplete ? (
            <Alert severity="success">
              Your crypto payment system is fully integrated and ready to use!
            </Alert>
          ) : (
            <Alert severity="info">
              Complete all steps to fully enable crypto payments on iREVA.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different guides */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="integration tabs">
          <Tab label="Beginner's Guide" />
          <Tab label="Technical Setup" />
        </Tabs>
      </Box>

      {/* Beginner's Guide Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Simplified Crypto Integration Guide
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Step 1: API Key Configuration
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  {getStatusIcon(data?.environment?.success || false)}
                  <Typography variant="subtitle1" ml={1}>
                    {data?.environment?.success ? "API Keys Configured" : "API Keys Missing"}
                  </Typography>
                </Box>
                <Typography paragraph>
                  API keys are required to connect with cryptocurrency payment providers. These keys authenticate your platform and allow secure transactions.
                </Typography>
                {!data?.environment?.success && data?.environment?.missingKeys && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    The following API keys are missing: {data?.environment?.missingKeys.join(', ')}
                  </Alert>
                )}
                <Typography variant="subtitle2" gutterBottom>
                  How to set up:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Sign up for a CoinGate business account" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Navigate to API settings and generate API keys" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Add the keys to your environment variables" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Step 2: Webhook Configuration
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  {getStatusIcon(data?.webhooks?.success || false)}
                  <Typography variant="subtitle1" ml={1}>
                    {data?.webhooks?.success ? "Webhooks Configured" : "Webhooks Unconfigured"}
                  </Typography>
                </Box>
                <Typography paragraph>
                  Webhooks notify your platform when a payment is received, allowing you to update the user's investment status automatically.
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  How to set up:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="In your payment provider dashboard, go to Webhook settings" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Add your callback URL (e.g., https://ireva.com/api/webhook/crypto)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Set up event types (payment.received, payment.confirmed)" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Step 3: Transaction Testing
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  {getStatusIcon(data?.testTransaction.success || false)}
                  <Typography variant="subtitle1" ml={1}>
                    {data?.testTransaction.success ? "Test Transactions Working" : "Test Transactions Needed"}
                  </Typography>
                </Box>
                <Typography paragraph>
                  Before going live, it's essential to test the payment flow to ensure funds are received correctly and webhooks are triggering properly.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => testIntegrationMutation.mutate()}
                  disabled={testIntegrationMutation.isPending}
                  sx={{ mb: 2 }}
                >
                  {testIntegrationMutation.isPending ? <CircularProgress size={24} /> : "Run Test Transaction"}
                </Button>
                
                <Typography variant="subtitle2" gutterBottom>
                  What this test checks:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="API key validity" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Order creation capabilities" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Payment notification flow" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Step 4: UI Integration
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  {getStatusIcon(data?.uiIntegration.success || false)}
                  <Typography variant="subtitle1" ml={1}>
                    {data?.uiIntegration.success ? "UI Integration Complete" : "UI Integration Needed"}
                  </Typography>
                </Box>
                <Typography paragraph>
                  The final step is ensuring the payment buttons and flows are visible to users in the investment process.
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  What to check:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Crypto payment option appears in payment methods" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="QR codes display correctly for crypto payments" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Payment confirmation works properly" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Technical Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Technical Integration Details
          </Typography>
          
          {/* Integration Validator */}
          <CryptoIntegrationValidator />
          
          {/* Webhook Security Guide */}
          <CryptoWebhookSecurityGuide 
            webhookSecret={process.env.COINGATE_WEBHOOK_SECRET || undefined}
            onGenerateSecret={() => {
              toast({
                title: "Secret Key Generation",
                description: "Please set the COINGATE_WEBHOOK_SECRET environment variable with a secure random string.",
              });
            }}
          />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" display="flex" alignItems="center" gutterBottom>
                  <SettingsIcon sx={{ mr: 1 }} /> Environment Configuration
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Alert severity={data?.environment?.success ? "success" : "warning"}>
                    {data?.environment?.success 
                      ? "All required environment variables are configured properly." 
                      : "Some required environment variables are missing."}
                  </Alert>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Present Keys:</Typography>
                    <List dense>
                      {data?.environment?.presentKeys?.map((key) => (
                        <ListItem key={key}>
                          <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                          <ListItemText primary={key} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Missing Keys:</Typography>
                    <List dense>
                      {data?.environment?.missingKeys?.map((key) => (
                        <ListItem key={key}>
                          <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                          <ListItemText primary={key} />
                        </ListItem>
                      ))}
                      {data?.environment?.missingKeys?.length === 0 && (
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                          <ListItemText primary="No missing keys" />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Environment Setup Instructions:
                </Typography>
                <Typography variant="body2" component="div">
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    overflow: 'auto' 
                  }}>
                    {`# Required environment variables
COINGATE_API_KEY=your_api_key_here
CRYPTO_WEBHOOK_SECRET=your_webhook_secret_here
CRYPTO_PAYMENT_CALLBACK_URL=https://your-domain.com/api/webhook/crypto-payment`}
                  </pre>
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" display="flex" alignItems="center" gutterBottom>
                  <WebhookIcon sx={{ mr: 1 }} /> Webhook Configuration
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Alert severity={data?.webhooks?.success ? "success" : "warning"}>
                    {data?.webhooks?.message}
                  </Alert>
                </Box>
                {data?.webhooks?.webhooks && data?.webhooks?.webhooks.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Configured Webhooks:</Typography>
                    <List dense>
                      {data?.webhooks?.webhooks?.map((webhook, index) => (
                        <ListItem key={index}>
                          <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                          <ListItemText primary={webhook.url} secondary={webhook.events || 'All events'} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Webhook Setup Instructions:
                </Typography>
                <Typography variant="body2">
                  In your payment provider dashboard, configure a webhook with the following parameters:
                </Typography>
                <Typography variant="body2" component="div">
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    marginTop: '0.5rem' 
                  }}>
                    {`URL: ${process.env.CRYPTO_PAYMENT_CALLBACK_URL || 'https://your-domain.com/api/webhook/crypto-payment'}
Content-Type: application/json
Events: payment.created, payment.pending, payment.confirmed, payment.cancelled
Secret: Same as your CRYPTO_WEBHOOK_SECRET env variable`}
                  </pre>
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" display="flex" alignItems="center" gutterBottom>
                  <PaymentIcon sx={{ mr: 1 }} /> Test Transaction
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Alert severity={data?.testTransaction?.success ? "success" : "warning"}>
                    {data?.testTransaction?.message}
                  </Alert>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => testIntegrationMutation.mutate()}
                  disabled={testIntegrationMutation.isPending}
                  sx={{ mb: 2 }}
                >
                  {testIntegrationMutation.isPending ? <CircularProgress size={24} /> : "Run Test Transaction"}
                </Button>
                
                {data?.testTransaction?.order && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>Last Test Transaction:</Typography>
                    <Typography variant="body2" component="div">
                      <pre style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '1rem', 
                        borderRadius: '4px',
                        overflow: 'auto' 
                      }}>
                        {JSON.stringify(data?.testTransaction?.order, null, 2)}
                      </pre>
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" display="flex" alignItems="center" gutterBottom>
                  <CodeIcon sx={{ mr: 1 }} /> UI Integration
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Alert severity={data?.uiIntegration?.success ? "success" : "warning"}>
                    {data?.uiIntegration?.message}
                  </Alert>
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  UI Integration Checklist:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color={data?.uiIntegration?.success ? "success" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Crypto payment option visible in payment methods" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color={data?.uiIntegration?.success ? "success" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="QR code generation working" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color={data?.uiIntegration?.success ? "success" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Payment status updates displaying correctly" 
                    />
                  </ListItem>
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Sample Crypto Payment Button Integration:
                </Typography>
                <Typography variant="body2" component="div">
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    overflow: 'auto' 
                  }}>
{`// React component example
<Button 
  variant="contained" 
  startIcon={<CurrencyBitcoinIcon />} 
  onClick={initiateCryptoPayment}
>
  Pay with Cryptocurrency
</Button>

// Payment initiation function
const initiateCryptoPayment = async (amount, currency = 'USD') => {
  try {
    const response = await apiRequest(
      'POST', 
      '/api/crypto-payments/create', 
      { amount, currency }
    );
    const data = await response.json();
    // Open payment modal with QR code
    setPaymentData(data);
    setShowPaymentModal(true);
  } catch (error) {
    console.error('Error initiating crypto payment:', error);
    // Show error message
  }
};`}
                  </pre>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button 
          variant="outlined" 
          onClick={() => refetch()} 
          sx={{ mr: 1 }}
        >
          Refresh Status
        </Button>
      </Box>
    </Box>
  );
};

export default CryptoIntegrationPage;