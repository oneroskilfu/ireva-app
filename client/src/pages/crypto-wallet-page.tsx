import React, { useState } from 'react';
import { 
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import WalletProviderChecker from '../components/Wallet/WalletProviderChecker';
import { apiRequest } from '@/lib/queryClient';
import { Wallet, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CryptoWalletPage: React.FC = () => {
  const { toast } = useToast();
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);

  const handleSaveApiKeys = async (keys: Record<string, string>) => {
    try {
      const response = await apiRequest('POST', '/api/blockchain/api-keys', keys);
      const data = await response.json();
      
      if (data.success) {
        setIsApiKeySaved(true);
        toast({
          title: 'API Keys Saved',
          description: 'Your blockchain provider keys have been saved successfully.',
        });
      } else {
        toast({
          title: 'Error Saving API Keys',
          description: data.error || 'There was an error saving your API keys.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: 'Error Saving API Keys',
        description: 'There was an error saving your API keys. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crypto Wallet Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connect to blockchain networks and manage your crypto transactions for property investments.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <WalletProviderChecker onSubmitKeys={handleSaveApiKeys} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
                <Typography variant="h6" component="h3">
                  Secure Wallet
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                All blockchain connections are secure and your private keys are never stored on our servers.
              </Typography>
              <Typography variant="body2" paragraph>
                The API keys you provide are used only for reading blockchain data, and they don't give us access to your funds.
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                <AlertTitle>Supported Networks</AlertTitle>
                We currently support Ethereum, Polygon, and Binance Smart Chain for investments.
              </Alert>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 3 }}
                startIcon={<Wallet />}
                href="/wallet/transactions"
              >
                View Transactions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {!isApiKeySaved && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>API Keys Required</AlertTitle>
              <AlertTriangle className="h-4 w-4 mr-1" />
              To fully utilize crypto features, please provide API keys for blockchain networks. Without these, some features may be limited.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CryptoWalletPage;