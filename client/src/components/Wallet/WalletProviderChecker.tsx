import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Wallet, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  KeyRound
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type NetworkStatus = {
  id: string;
  name: string;
  isAvailable: boolean;
  error?: string;
};

interface WalletProviderCheckerProps {
  onSubmitKeys: (keys: Record<string, string>) => void;
}

const WalletProviderChecker: React.FC<WalletProviderCheckerProps> = ({ onSubmitKeys }) => {
  const { toast } = useToast();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    ETH_RPC_URL: '',
    POLYGON_RPC_URL: '',
    BSC_RPC_URL: ''
  });

  useEffect(() => {
    checkNetworkStatus();
  }, []);

  const checkNetworkStatus = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', '/api/blockchain/status');
      const data = await response.json();
      setNetworkStatus(data.networks || []);
      
      // If any network is unavailable, show API key form
      const hasUnavailableNetwork = data.networks?.some((net: NetworkStatus) => !net.isAvailable);
      setShowApiKeyForm(hasUnavailableNetwork);
    } catch (error) {
      console.error('Error checking network status:', error);
      setNetworkStatus([
        { id: 'ethereum', name: 'Ethereum', isAvailable: false, error: 'Failed to check network status' },
        { id: 'polygon', name: 'Polygon', isAvailable: false, error: 'Failed to check network status' },
        { id: 'binance', name: 'Binance Smart Chain', isAvailable: false, error: 'Failed to check network status' }
      ]);
      setShowApiKeyForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    await checkNetworkStatus();
    setIsRefreshing(false);
    
    toast({
      title: 'Status Refreshed',
      description: 'Blockchain provider status has been updated',
    });
  };

  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitKeys = () => {
    // Remove empty keys
    const filteredKeys = Object.entries(apiKeys)
      .filter(([_, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    onSubmitKeys(filteredKeys);
    
    toast({
      title: 'API Keys Saved',
      description: 'Your blockchain provider keys have been saved',
    });
  };

  const getHelperText = (key: string) => {
    switch (key) {
      case 'ETH_RPC_URL':
        return 'You can get an Ethereum RPC URL from providers like Alchemy, Infura, or QuickNode';
      case 'POLYGON_RPC_URL':
        return 'You can get a Polygon RPC URL from providers like Alchemy, Infura, or QuickNode';
      case 'BSC_RPC_URL':
        return 'You can get a Binance Smart Chain RPC URL from BSC RPC endpoints';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Checking Blockchain Providers</CardTitle>
          <CardDescription>Verifying connection to blockchain networks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allNetworksAvailable = networkStatus.every(network => network.isAvailable);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Blockchain Providers</CardTitle>
            <CardDescription>Connection status to blockchain networks</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshStatus} disabled={isRefreshing}>
            {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!allNetworksAvailable && (
          <Alert variant="destructive" id="api-keys-section">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Blockchain Connection Required</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                To enable crypto transactions, you need to connect to blockchain networks by providing API keys from providers like Alchemy or Infura.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => document.querySelector('.bg-card')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Set Up API Keys
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  asChild
                >
                  <a 
                    href="https://docs.alchemy.com/reference/api-overview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <span>Learn More</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {networkStatus.map((network) => (
            <div key={network.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                  {getNetworkIcon(network.id)}
                </div>
                <div>
                  <div className="font-medium">{network.name}</div>
                  {network.error && (
                    <div className="text-xs text-red-500 mt-1">{network.error}</div>
                  )}
                </div>
              </div>
              {network.isAvailable ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Connected</Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">Unavailable</Badge>
              )}
            </div>
          ))}
        </div>

        {showApiKeyForm && (
          <div className="border rounded-lg p-6 space-y-5 mt-6 bg-card">
            <div className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Add Your API Keys</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              To connect to blockchain networks, we need API keys from providers like Alchemy or Infura. These keys stay in your browser and are never stored on our servers.
            </p>
            
            <Tabs defaultValue="alchemy" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="alchemy">Alchemy</TabsTrigger>
                <TabsTrigger value="infura">Infura</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="alchemy" className="mt-4 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800 text-sm">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Getting Alchemy API Keys</h4>
                  <ol className="list-decimal pl-4 space-y-2 text-blue-600 dark:text-blue-400">
                    <li>Go to <a href="https://dashboard.alchemy.com/signup" target="_blank" rel="noopener noreferrer" className="font-medium underline">Alchemy Dashboard</a> and create a free account</li>
                    <li>Click on "Create App" and fill in your app details</li>
                    <li>Select the networks you need (Ethereum, Polygon, etc.)</li>
                    <li>Copy the HTTP URL from each app to use below</li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  {Object.keys(apiKeys).map(key => {
                    const networkName = key === 'ETH_RPC_URL' ? 'Ethereum' : 
                                       key === 'POLYGON_RPC_URL' ? 'Polygon' : 
                                       'Binance Smart Chain';
                    return (
                      <div key={key} className="space-y-2 bg-muted/40 p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <label htmlFor={`alchemy-${key}`} className="text-sm font-medium">{networkName} HTTP URL</label>
                          {key === 'BSC_RPC_URL' && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20">Not available on Alchemy</Badge>
                          )}
                        </div>
                        <Input
                          id={`alchemy-${key}`}
                          type="text"
                          placeholder={key === 'BSC_RPC_URL' ? 'Not available on Alchemy' : `https://${networkName.toLowerCase()}-mainnet.g.alchemy.com/v2/YOUR_API_KEY`}
                          value={apiKeys[key]}
                          onChange={(e) => handleApiKeyChange(key, e.target.value)}
                          disabled={key === 'BSC_RPC_URL'}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="infura" className="mt-4 space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md border border-purple-100 dark:border-purple-800 text-sm">
                  <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Getting Infura API Keys</h4>
                  <ol className="list-decimal pl-4 space-y-2 text-purple-600 dark:text-purple-400">
                    <li>Go to <a href="https://app.infura.io/register" target="_blank" rel="noopener noreferrer" className="font-medium underline">Infura Dashboard</a> and create a free account</li>
                    <li>Click on "Create New API Key" and select "Web3 API"</li>
                    <li>Give your project a name and click "Create"</li>
                    <li>Find your API key in the project settings</li>
                    <li>Select each network and copy the endpoint URLs</li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  {Object.keys(apiKeys).map(key => {
                    const networkName = key === 'ETH_RPC_URL' ? 'Ethereum' : 
                                       key === 'POLYGON_RPC_URL' ? 'Polygon' : 
                                       'Binance Smart Chain';
                    const isSupported = key !== 'BSC_RPC_URL';
                    return (
                      <div key={key} className="space-y-2 bg-muted/40 p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <label htmlFor={`infura-${key}`} className="text-sm font-medium">{networkName} HTTP URL</label>
                          {!isSupported && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20">Not available on Infura</Badge>
                          )}
                        </div>
                        <Input
                          id={`infura-${key}`}
                          type="text"
                          placeholder={!isSupported ? 'Not available on Infura' : `https://${networkName.toLowerCase()}.infura.io/v3/YOUR_API_KEY`}
                          value={apiKeys[key]}
                          onChange={(e) => handleApiKeyChange(key, e.target.value)}
                          disabled={!isSupported}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="mt-4 space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-100 dark:border-green-800 text-sm">
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">Using Custom RPC URLs</h4>
                  <p className="text-green-600 dark:text-green-400 mb-2">
                    You can use any RPC URL provider that supports the following networks:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-green-600 dark:text-green-400">
                    <li>Ethereum: QuickNode, GetBlock, Ankr, or your own node</li>
                    <li>Polygon: QuickNode, GetBlock, or Polygon's public RPC</li>
                    <li>Binance Smart Chain: BSC public RPC endpoints</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  {Object.keys(apiKeys).map(key => (
                    <div key={key} className="space-y-2">
                      <label htmlFor={`custom-${key}`} className="text-sm font-medium">{key}</label>
                      <Input
                        id={`custom-${key}`}
                        type="text"
                        placeholder={`Enter your ${key}`}
                        value={apiKeys[key]}
                        onChange={(e) => handleApiKeyChange(key, e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">{getHelperText(key)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <Button onClick={handleSubmitKeys} className="w-full mt-6">
              Save API Keys
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <p className="text-xs text-muted-foreground">
          These connections are required for crypto transactions and blockchain interactions.
        </p>
        <a 
          href="https://ireva.io/support/blockchain-providers" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs flex items-center text-primary hover:underline"
        >
          Learn more <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </CardFooter>
    </Card>
  );
};

const getNetworkIcon = (networkId: string) => {
  switch (networkId) {
    case 'ethereum':
      return (
        <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
        </svg>
      );
    case 'polygon':
      return (
        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.629 0 12 0ZM5.92 14.604l2.09-2.082 2.075 2.082-2.09 2.082-2.075-2.082Zm5.348-5.348-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Zm0 10.695L9.18 17.866l8.266-8.266 2.09 2.082-8.266 8.266v.003Zm9.181-9.18-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Z" />
        </svg>
      );
    case 'binance':
      return (
        <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6365 4.6355-4.6375zm0-9.4862l2.7175 2.7164-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6365 4.6355-4.6375zm-4.6365-4.4094l-11.9885 11.988 2.7175 2.7164 9.271-9.2699 9.271 9.2699 2.7175-2.7164-11.9885-11.988z" />
        </svg>
      );
    default:
      return <Wallet className="w-5 h-5" />;
  }
};

export default WalletProviderChecker;