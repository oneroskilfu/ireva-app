import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WebhookIcon from '@mui/icons-material/Webhook';
import StorageIcon from '@mui/icons-material/Storage';
import axios from 'axios';

interface ValidationItem {
  name: string;
  status: 'success' | 'error' | 'pending';
  details?: string;
}

interface ValidationSection {
  title: string;
  items: ValidationItem[];
  icon: React.ReactNode;
}

const CryptoIntegrationValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationSection[]>([]);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'pending' | null>(null);
  const [testWebhookResult, setTestWebhookResult] = useState<{ status: string; message: string } | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    setOverallStatus('pending');
    
    try {
      // Initialize with pending status
      setValidationResults([
        {
          title: 'API Configuration',
          icon: <CodeIcon />,
          items: [
            { name: 'CoinGate API Key', status: 'pending' },
            { name: 'API Environment', status: 'pending' },
            { name: 'API Connection', status: 'pending' },
          ]
        },
        {
          title: 'Webhook Security',
          icon: <SecurityIcon />,
          items: [
            { name: 'Webhook Secret', status: 'pending' },
            { name: 'Signature Verification', status: 'pending' },
            { name: 'Raw Body Parser', status: 'pending' },
          ]
        },
        {
          title: 'Database Models',
          icon: <StorageIcon />,
          items: [
            { name: 'Transaction Schema', status: 'pending' },
            { name: 'Wallet Schema', status: 'pending' },
          ]
        },
        {
          title: 'Endpoints',
          icon: <WebhookIcon />,
          items: [
            { name: 'Payment Creation', status: 'pending' },
            { name: 'Webhook Receiver', status: 'pending' },
            { name: 'Admin Routes', status: 'pending' },
          ]
        },
      ]);
      
      // Fetch validation results from the server
      const response = await axios.get('/api/admin/crypto-integration/validate');
      
      if (response.data && response.data.sections) {
        setValidationResults(response.data.sections);
        
        // Determine overall status
        const allSuccess = response.data.sections.every((section: ValidationSection) => 
          section.items.every(item => item.status === 'success')
        );
        
        setOverallStatus(allSuccess ? 'success' : 'error');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Validation error:', error);
      setOverallStatus('error');
    } finally {
      setIsValidating(false);
    }
  };
  
  const testWebhook = async () => {
    try {
      setTestWebhookResult({ status: 'pending', message: 'Sending test webhook...' });
      
      const response = await axios.post('/api/crypto/webhooks/test/webhook', {
        status: 'confirmed',
        payment_id: 'test_' + Date.now(),
        order_id: 'order_' + Date.now(),
        amount: '50.00',
        currency: 'USDC',
        crypto_amount: '50.00',
        network: 'ethereum'
      });
      
      setTestWebhookResult({ 
        status: response.data.success ? 'success' : 'error',
        message: response.data.success 
          ? 'Test webhook processed successfully!' 
          : `Error: ${response.data.error || 'Unknown error'}`
      });
    } catch (error) {
      console.error('Test webhook error:', error);
      setTestWebhookResult({ 
        status: 'error', 
        message: `Error: ${error.response?.data?.error || error.message || 'Unknown error'}`
      });
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <AttachMoneyIcon sx={{ mr: 1 }} /> Crypto Integration Validator
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            This utility checks if all components of the cryptocurrency payment system are properly configured and working together.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={runValidation}
              disabled={isValidating}
              startIcon={isValidating ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
              {isValidating ? 'Validating...' : 'Run Validation'}
            </Button>
            
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={testWebhook}
              disabled={isValidating}
              startIcon={<WebhookIcon />}
            >
              Test Webhook
            </Button>
          </Box>
        </Box>
        
        {testWebhookResult && (
          <Alert 
            severity={testWebhookResult.status === 'success' ? 'success' : 
                    testWebhookResult.status === 'pending' ? 'info' : 'error'}
            sx={{ mb: 3 }}
          >
            {testWebhookResult.message}
          </Alert>
        )}
        
        {overallStatus && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Validation Summary
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {overallStatus === 'success' ? (
                    <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 28 }} />
                  ) : overallStatus === 'error' ? (
                    <ErrorIcon color="error" sx={{ mr: 1, fontSize: 28 }} />
                  ) : (
                    <CircularProgress size={28} sx={{ mr: 1 }} />
                  )}
                  
                  <Typography variant="h6">
                    {overallStatus === 'success' 
                      ? 'All systems operational' 
                      : overallStatus === 'error'
                        ? 'Issues detected'
                        : 'Validating...'}
                  </Typography>
                </Box>
                
                <Chip 
                  label={overallStatus === 'success' ? 'READY' : overallStatus === 'error' ? 'NEEDS ATTENTION' : 'CHECKING'}
                  color={overallStatus === 'success' ? 'success' : overallStatus === 'error' ? 'error' : 'default'}
                />
              </CardContent>
            </Card>
          </Box>
        )}
        
        {validationResults.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Detailed Results
            </Typography>
            
            {validationResults.map((section, index) => (
              <Accordion key={index} defaultExpanded={true} sx={{ mb: 1 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ mr: 1 }}>{section.icon}</Box>
                    <Typography variant="subtitle1">{section.title}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip
                      size="small"
                      label={`${section.items.filter(item => item.status === 'success').length}/${section.items.length}`}
                      color={section.items.every(item => item.status === 'success') ? 'success' : 'warning'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {section.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex}>
                        <ListItemIcon>
                          {item.status === 'success' ? (
                            <CheckCircleIcon color="success" />
                          ) : item.status === 'error' ? (
                            <ErrorIcon color="error" />
                          ) : (
                            <CircularProgress size={20} />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.name} 
                          secondary={item.details}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CryptoIntegrationValidator;