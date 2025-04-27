import React from 'react';
import { OfflineInvestmentForm } from '@/components/form/OfflineForm';
import { OfflineKYCForm } from '@/components/form/OfflineKYCForm';
import { SimpleInvestmentForm, SimpleKYCForm } from '@/components/form/SimpleOfflineForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OfflineFormDemoPage: React.FC = () => {
  const [isConnectionToggled, setIsConnectionToggled] = React.useState(false);
  const { toast } = useToast();

  // Function to simulate going offline/online (for demo purposes)
  const toggleConnection = () => {
    // This only simulates offline for demo purposes
    // It doesn't actually change the network state
    setIsConnectionToggled(!isConnectionToggled);
    
    // Update our UI to show offline or online status
    toast({
      title: isConnectionToggled ? 'Connection restored' : 'You are offline',
      description: isConnectionToggled 
        ? 'Network connection has been restored' 
        : 'Network connection has been lost. Offline mode activated.',
      variant: isConnectionToggled ? 'default' : 'destructive',
    });
    
    // Override the navigator.onLine property
    // NOTE: This is for demo purposes only and would not be used in production
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: function() { return isConnectionToggled ? false : true; }
    });
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Offline-Ready Forms Demo</h1>
        <p className="text-gray-600">
          This demo showcases how the iREVA platform handles form submissions 
          even when you're offline. Try simulating offline mode and submitting a form.
        </p>
      </div>

      <div className="mb-8">
        <Button 
          onClick={toggleConnection}
          variant={isConnectionToggled ? "destructive" : "outline"}
          className="flex items-center gap-2"
        >
          {isConnectionToggled ? (
            <>
              <WifiOff size={16} />
              Simulate Offline
            </>
          ) : (
            <>
              <Wifi size={16} />
              Simulate Online
            </>
          )}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Current status: {isConnectionToggled ? 'Offline (simulated)' : 'Online'}
        </p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              The technical details behind our offline-ready forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-1">1. Offline Detection</h3>
                <p className="text-gray-600">
                  Forms detect when your device is offline using the browser's 
                  navigator.onLine property.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">2. Offline Storage</h3>
                <p className="text-gray-600">
                  When offline, your form data is securely stored in your browser's 
                  IndexedDB storage until connectivity is restored.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">3. Background Sync</h3>
                <p className="text-gray-600">
                  When you come back online, the service worker automatically 
                  submits your stored form data using Background Sync.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">4. Conflict Resolution</h3>
                <p className="text-gray-600">
                  Our system intelligently handles any data conflicts that might 
                  arise during the sync process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Tabs defaultValue="hook-based" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="hook-based">Hook-Based Implementation</TabsTrigger>
            <TabsTrigger value="direct">Direct Implementation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hook-based">
            <Tabs defaultValue="investment" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="investment">Investment Form</TabsTrigger>
                <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
              </TabsList>
              
              <TabsContent value="investment">
                <Card>
                  <CardHeader>
                    <CardTitle>Make an Investment (Hook-Based)</CardTitle>
                    <CardDescription>
                      Submit your investment details. If you're offline, the data will be saved
                      and automatically submitted when you reconnect.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OfflineInvestmentForm />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="kyc">
                <OfflineKYCForm />
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="direct">
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Direct Implementation</CardTitle>
                  <CardDescription>
                    This approach uses the pendingDB utilities directly without the custom hook
                  </CardDescription>
                </div>
                <div className="bg-muted p-3 rounded-md flex items-center gap-2">
                  <Code size={18} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">saveToPendingDB</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted p-4 mb-4">
                  <pre className="text-xs font-mono text-muted-foreground overflow-auto">
{`if (!navigator.onLine) {
  await saveToPendingDB('investments', {
    id: new Date().toISOString(),
    amount: 500,
    projectId: "12345",
    userId: "user-789"
  });
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-investments');
} else {
  // Normal online API call
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="investment" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="investment">Investment Form</TabsTrigger>
                <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
              </TabsList>
              
              <TabsContent value="investment">
                <SimpleInvestmentForm />
              </TabsContent>
              
              <TabsContent value="kyc">
                <SimpleKYCForm />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OfflineFormDemoPage;