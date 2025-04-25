import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WalletProviderChecker from '../components/Wallet/WalletProviderChecker';
import { apiRequest } from '@/lib/queryClient';
// MockWalletButton is dynamically imported later for development testing only
import { 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  Download,
  Coins,
  Landmark,
  CreditCard,
  ChevronRight,
  Check,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConnectWalletButton from '../components/Wallet/ConnectWalletButton';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Steps, Step } from '@/components/ui/steps';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

const CryptoWalletPage: React.FC = () => {
  const { toast } = useToast();
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);
  const [currentTab, setCurrentTab] = useState('guide');
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
        
        // Move to next step in the guide
        if (currentStep === 2) {
          setCurrentStep(3);
        }
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

  const handleWalletConnected = (address: string) => {
    setWalletConnected(true);
    
    // If we're on the first step, move to the next
    if (currentStep === 1) {
      setCurrentStep(2);
    }
    
    toast({
      title: 'Wallet Connected',
      description: 'Your crypto wallet has been successfully connected.',
    });
  };

  const moveToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const moveToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Content components for the guide steps
  const WalletSetupStep = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800">
        <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-1">What is a Crypto Wallet?</h3>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          A crypto wallet is like a digital bank account for your cryptocurrencies. It allows you to store, send, and receive digital money.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">1. Download MetaMask</h4>
            <p className="text-sm text-muted-foreground mt-1">
              MetaMask is one of the most popular and user-friendly cryptocurrency wallets.
            </p>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center mt-2 text-sm text-primary hover:underline"
            >
              Download MetaMask <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">2. Create or Import a Wallet</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Follow MetaMask's instructions to create a new wallet or import an existing one.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">3. Secure Your Recovery Phrase</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Write down and securely store your recovery phrase. Never share it with anyone!
            </p>
          </div>
        </div>
      </div>
      
      <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Security Information</AlertTitle>
        <AlertDescription className="text-sm">
          Never share your recovery phrase or private keys with anyone, including iREVA support. We'll never ask for this information.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
        <ConnectWalletButton 
          onWalletConnected={handleWalletConnected} 
          variant="default"
          size="lg"
          className="w-full sm:w-auto"
        />
        
        {/* Mock wallet button for development environments only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 sm:mt-0 w-full sm:w-auto">
            <div className="py-1 px-2 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded mb-2 text-center">
              Development Mode
            </div>
            <React.Suspense fallback={<Button variant="outline" disabled>Loading...</Button>}>
              {/* Dynamic import to avoid loading in production */}
              {(() => {
                const MockWalletButton = React.lazy(() => import('../components/Wallet/MockWalletButton'));
                return (
                  <MockWalletButton
                    onWalletConnected={handleWalletConnected}
                    variant="default"
                    size="lg"
                    className="w-full"
                  />
                );
              })()}
            </React.Suspense>
          </div>
        )}
      </div>
    </div>
  );

  const ApiSetupStep = () => (
    <div className="space-y-4">
      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertTitle>What are API Keys?</AlertTitle>
        <AlertDescription className="text-sm">
          API keys allow our platform to securely read data from blockchain networks. They're like a special password that only gives permission to view information.
        </AlertDescription>
      </Alert>
      
      <div className="bg-white dark:bg-gray-800 border rounded-lg">
        <WalletProviderChecker onSubmitKeys={handleSaveApiKeys} />
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm font-medium">
            Why do I need API keys?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            API keys allow us to display your blockchain transactions and balances without requiring you to connect your wallet every time. They only provide read-only access to public blockchain data and are securely stored.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-sm font-medium">
            How do I get API keys?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            You can get free API keys from services like Alchemy (https://www.alchemy.com/), Infura (https://infura.io/), or QuickNode (https://www.quicknode.com/). Create an account, create a new project, and copy your API key or RPC URL.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-sm font-medium">
            Is this secure?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Yes. API keys only provide read-only access to blockchain data. They cannot be used to move funds or perform transactions. Your actual crypto wallet and private keys remain completely separate and secure.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  const PaymentOptionsStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border shadow-sm">
          <div className="flex items-center mb-4">
            <Coins className="h-6 w-6 mr-3 text-primary" />
            <h3 className="text-lg font-medium">Stablecoin Payments</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Use USDC or USDT stablecoins to make payments with protection against crypto price volatility.
          </p>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Supported Stablecoins:</p>
            <ul className="space-y-1">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                USDC (USD Coin)
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                USDT (Tether)
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border shadow-sm">
          <div className="flex items-center mb-4">
            <Landmark className="h-6 w-6 mr-3 text-primary" />
            <h3 className="text-lg font-medium">Bank Deposits</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Convert your cryptocurrency to Naira through our banking partners for seamless transfers.
          </p>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Benefits:</p>
            <ul className="space-y-1">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                Same-day processing
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                Competitive exchange rates
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Deposit Process</CardTitle>
          <CardDescription>How to deposit cryptocurrency into your iREVA investment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Connect Your Wallet</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your MetaMask or other compatible wallet to the iREVA platform when prompted.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Approve Token Transfer</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Authorize the iREVA Escrow Smart Contract to access your tokens. This is a one-time security step required by the blockchain.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Complete Deposit</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Confirm the deposit transaction to transfer your stablecoin (USDC/USDT) or ETH into the escrow smart contract.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">4</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Verify Transaction</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The smart contract automatically records your wallet address, the project ID, and the investment amount.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800 mt-6">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">What happens behind the scenes?</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              When you deposit funds, our secure blockchain escrow system:
            </p>
            <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Records your wallet address for future returns</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Links your investment to the specific property's ID</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Securely holds your funds until project milestones are met</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Provides a blockchain-verified record of your investment</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-100 dark:border-green-800 mt-4">
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Escrow Protection</h4>
            <p className="text-sm text-green-600 dark:text-green-400 mb-2">
              Our smart contract includes built-in safeguards that protect your investment:
            </p>
            <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-medium">Funding Threshold:</span> Your investment is held until the minimum funding goal is reached by the deadline</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-medium">Investor Verification:</span> Requires a minimum number of KYC-verified investors for project approval</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-medium">Admin Approval:</span> Multiple administrators must approve fund releases for added security</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-medium">Fund Pools:</span> Your investment is stored in project-specific pools for enhanced tracking</span>
              </li>
            </ul>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 italic">
              If any of these conditions are not met, you can claim a refund of your investment.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Direct Property Investment</CardTitle>
          <CardDescription>Pay directly on the blockchain for property investments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Select a Property</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse our property listings and select one that matches your investment goals.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Choose Crypto Payment</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  When making your investment, select "Cryptocurrency" as your payment method.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Confirm & Complete Transaction</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Approve the transaction in your wallet and wait for confirmation on the blockchain.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-100 dark:border-amber-800 mt-6">
            <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Important Notice
            </h4>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Make sure you have enough funds in your wallet to cover both the investment amount and the gas fees (transaction costs) required by the blockchain network.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CompletionStep = () => (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800 text-center">
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-800">
          <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
        </div>
        <h3 className="text-xl font-medium text-green-800 dark:text-green-300 mb-2">Setup Complete!</h3>
        <p className="text-green-700 dark:text-green-400 mb-4">
          Your crypto wallet is now fully configured and ready to use with iREVA.
        </p>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">The Full Investment Cycle</CardTitle>
          <CardDescription>Understanding what happens after you invest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-base mb-2">Release Phase</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="bg-green-100 dark:bg-green-800 h-6 w-6 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-300" />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">Successful Projects</h5>
                    <p className="text-sm text-muted-foreground">
                      When all conditions are met, the smart contract automatically releases funds to the property developer or to iREVA's treasury for disbursement.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="bg-amber-100 dark:bg-amber-800 h-6 w-6 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">Unsuccessful Projects</h5>
                    <p className="text-sm text-muted-foreground">
                      If funding goals or other conditions aren't met by the deadline, your investment is automatically returned to your wallet address without requiring any action on your part.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <h4 className="font-medium text-base mb-2">Payout & Tracking</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="bg-blue-100 dark:bg-blue-800 h-6 w-6 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 text-xs font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">Event Triggers</h5>
                    <p className="text-sm text-muted-foreground">
                      Smart contract events are automatically emitted whenever funds are released or returned, which our system monitors in real-time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="bg-blue-100 dark:bg-blue-800 h-6 w-6 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 text-xs font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">ROI Distributions</h5>
                    <p className="text-sm text-muted-foreground">
                      When property returns are generated, the system automatically calculates your share based on your investment percentage.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="bg-blue-100 dark:bg-blue-800 h-6 w-6 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 text-xs font-bold">3</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">Transparent Logging</h5>
                    <p className="text-sm text-muted-foreground">
                      All transactions are permanently recorded in both the blockchain and our database, providing an immutable audit trail.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="bg-blue-100 dark:bg-blue-800 h-6 w-6 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 text-xs font-bold">4</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">Notifications</h5>
                    <p className="text-sm text-muted-foreground">
                      You'll receive email and in-app notifications at every milestone, including investment confirmations, project status updates, and ROI distributions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>Here are some things you can do with your connected wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.location.href = '/properties'}
            >
              <div className="flex items-center">
                <Landmark className="h-4 w-4 mr-2" />
                <span>Browse Investment Properties</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setCurrentTab('technical')}
            >
              <div className="flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                <span>View Wallet Technical Details</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.location.href = '/wallet'}
            >
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Return to Main Wallet</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Cryptocurrency Wallet</h1>
          <p className="text-muted-foreground mt-2">
            Easily fund your iREVA account with cryptocurrency and make blockchain investments.
          </p>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">Beginner's Guide</TabsTrigger>
            <TabsTrigger value="technical">Technical Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guide" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cryptocurrency Wallet Setup Guide</CardTitle>
                    <CardDescription>
                      Follow these simple steps to set up your crypto wallet for property investments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Steps currentStep={currentStep} className="mb-8">
                      <Step title="Connect Wallet" description="Link your cryptocurrency wallet" />
                      <Step title="Configure API" description="Set up blockchain connections" />
                      <Step title="Payment Options" description="Learn how to pay with crypto" />
                      <Step title="Complete" description="Start investing with crypto" />
                    </Steps>
                    
                    {currentStep === 1 && <WalletSetupStep />}
                    {currentStep === 2 && <ApiSetupStep />}
                    {currentStep === 3 && <PaymentOptionsStep />}
                    {currentStep === 4 && <CompletionStep />}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button 
                      variant="outline" 
                      onClick={moveToPreviousStep}
                      disabled={currentStep === 1}
                    >
                      Previous Step
                    </Button>
                    <Button 
                      onClick={moveToNextStep}
                      disabled={currentStep === 4 || (currentStep === 1 && !walletConnected) || (currentStep === 2 && !isApiKeySaved)}
                    >
                      {currentStep < 4 ? 'Next Step' : 'Finish Setup'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="lg:col-span-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
                    <h3 className="text-lg font-medium">Why Use Crypto?</h3>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Global Access</span>: Invest from anywhere without international banking restrictions
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Fast Transactions</span>: No waiting for bank processing or clearance
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Lower Fees</span>: Reduced transaction costs compared to traditional banking
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Transparency</span>: All transactions are verifiable on the blockchain
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800 mt-auto">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Supported Networks</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      We currently support Ethereum, Polygon, and Binance Smart Chain for investments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="technical" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <WalletProviderChecker onSubmitKeys={handleSaveApiKeys} />
              </div>
              <div className="md:col-span-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
                    <h3 className="text-lg font-medium">Secure Wallet</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    All blockchain connections are secure and your private keys are never stored on our servers.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    The API keys you provide are used only for reading blockchain data, and they don't give us access to your funds.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800 mt-4">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Supported Networks</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      We currently support Ethereum, Polygon, and Binance Smart Chain for investments.
                    </p>
                  </div>
                  <a 
                    href="/wallet/transactions" 
                    className="mt-4 flex justify-center items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    View Transactions
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {!isApiKeySaved && currentTab === 'technical' && (
          <div className="col-span-full mt-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-100 dark:border-amber-800">
              <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                API Keys Required
              </h4>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                To fully utilize crypto features, please provide API keys for blockchain networks. Without these, some features may be limited.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CryptoWalletPage;