import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import CryptoIntegrationChecklist from '@/components/admin/CryptoIntegrationChecklist';

export default function CryptoIntegrationPage() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulating a check for API keys
    const requiredKeys = [
      'COINGATE_API_KEY',
      'CRYPTO_WEBHOOK_SECRET',
      'CRYPTO_PAYMENT_CALLBACK_URL'
    ];

    const missingKeys = requiredKeys.filter(key => !process.env[`VITE_${key}`]);
    
    if (missingKeys.length > 0) {
      toast({
        title: 'Missing API Keys',
        description: 'Some required API keys are missing. Please add them to your environment.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return (
    <AdminLayout>
      <Helmet>
        <title>Crypto Integration | iREVA Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Crypto Integration</h1>
          <p className="text-muted-foreground">
            Manage and configure cryptocurrency payment integration
          </p>
        </div>
        
        <Tabs defaultValue="checklist">
          <TabsList>
            <TabsTrigger value="checklist">Integration Checklist</TabsTrigger>
            <TabsTrigger value="help">Setup Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checklist" className="space-y-6">
            <CryptoIntegrationChecklist />
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Integration Status</AlertTitle>
              <AlertDescription>
                This checklist verifies your crypto payment integration. All items must be complete for the integration to work properly.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Crypto Integration Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">1. Set up API Keys and Environment Variables</h3>
                  <p className="text-muted-foreground">Configure the following environment variables:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li><code>COINGATE_API_KEY</code>: Your CoinGate API key for processing crypto payments</li>
                    <li><code>CRYPTO_WEBHOOK_SECRET</code>: A secure secret for validating webhook signatures</li>
                    <li><code>CRYPTO_PAYMENT_CALLBACK_URL</code>: The callback URL for payment notifications</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">2. Set up Webhooks Configuration</h3>
                  <p className="text-muted-foreground">Configure webhooks in the CoinGate dashboard:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                    <li>Go to the CoinGate dashboard</li>
                    <li>Navigate to API settings</li>
                    <li>Set up a webhook with your callback URL</li>
                    <li>Add the webhook secret for verification</li>
                    <li>Enable notifications for payment events</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">3. Test the Integration</h3>
                  <p className="text-muted-foreground">
                    Use the "Test Integration" button in the checklist tab to verify your configuration. 
                    This will create a test transaction in sandbox mode and confirm that all components are working together.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">4. Verify UI Integration</h3>
                  <p className="text-muted-foreground">
                    Make sure the crypto payment option is properly displayed on the investment pages. 
                    Check that users can select cryptocurrency as a payment method and that the payment flow is smooth.
                  </p>
                </div>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Support</AlertTitle>
                  <AlertDescription>
                    If you need help with the integration, please contact the development team or refer to the payment provider's documentation.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}