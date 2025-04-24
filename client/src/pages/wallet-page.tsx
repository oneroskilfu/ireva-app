import React, { useState } from 'react';
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WalletConnection from "@/components/Wallet/WalletConnection";
import CryptoEducationCard from "@/components/education/CryptoEducationCard";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  ArrowRight, 
  BarChart4, 
  CheckCircle, 
  CreditCard, 
  HelpCircle, 
  Info, 
  Send, 
  Shield 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type NetworkType = 'ethereum' | 'polygon' | 'binance';

interface WalletPageProps {}

const WalletPage: React.FC<WalletPageProps> = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkType>('ethereum');
  const [activeTab, setActiveTab] = useState('wallet');

  const handleWalletConnected = (address: string, networkType: NetworkType) => {
    setWalletAddress(address);
    setNetwork(networkType);
    setIsConnected(true);
    
    toast({
      title: "Wallet Connected",
      description: "Your crypto wallet has been successfully connected to iREVA.",
    });
  };

  const getCryptoInfo = () => {
    switch (network) {
      case 'ethereum':
        return {
          name: 'Ethereum',
          icon: (
            <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
            </svg>
          ),
          color: 'text-blue-600',
          bg: 'bg-blue-500/10',
          border: 'border-blue-200',
        };
      case 'polygon':
        return {
          name: 'Polygon',
          icon: (
            <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.629 0 12 0ZM5.92 14.604l2.09-2.082 2.075 2.082-2.09 2.082-2.075-2.082Zm5.348-5.348-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Zm0 10.695L9.18 17.866l8.266-8.266 2.09 2.082-8.266 8.266v.003Zm9.181-9.18-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Z" />
            </svg>
          ),
          color: 'text-purple-600',
          bg: 'bg-purple-500/10',
          border: 'border-purple-200',
        };
      case 'binance':
        return {
          name: 'Binance Smart Chain',
          icon: (
            <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6365 4.6355-4.6375zm0-9.4862l2.7175 2.7164-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6365 4.6355-4.6375zm-4.6365-4.4094l-11.9885 11.988 2.7175 2.7164 9.271-9.2699 9.271 9.2699 2.7175-2.7164-11.9885-11.988z" />
            </svg>
          ),
          color: 'text-yellow-600',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-200',
        };
      default:
        return {
          name: 'Ethereum',
          icon: (
            <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
            </svg>
          ),
          color: 'text-blue-600',
          bg: 'bg-blue-500/10',
          border: 'border-blue-200',
        };
    }
  };

  const cryptoInfo = getCryptoInfo();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crypto Wallet</h1>
            <p className="text-muted-foreground mt-2">
              Connect your cryptocurrency wallet to invest in properties directly with crypto
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                  <WalletConnection onWalletConnected={handleWalletConnected} />
                </div>
                
                <div className="space-y-6">
                  {isConnected && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Connected Network</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`flex items-center space-x-3 p-3 rounded-md ${cryptoInfo.bg} ${cryptoInfo.border} border`}>
                          {cryptoInfo.icon}
                          <div>
                            <div className={`font-medium ${cryptoInfo.color}`}>{cryptoInfo.name}</div>
                            <div className="text-xs text-muted-foreground">Active network</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-xs text-muted-foreground">
                          <p className="flex items-start mb-2">
                            <Info className="h-3 w-3 mr-1 mt-0.5" />
                            Make sure your wallet is connected to the correct network
                          </p>
                          <p className="flex items-start">
                            <Shield className="h-3 w-3 mr-1 mt-0.5" />
                            All transactions are securely processed on {cryptoInfo.name}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        disabled={!isConnected}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        disabled={!isConnected}
                      >
                        <BarChart4 className="mr-2 h-4 w-4" />
                        Invest
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        disabled={!isConnected}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Buy Crypto
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/wallet/crypto">
                          <Shield className="mr-2 h-4 w-4" />
                          Advanced Crypto Settings
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Having trouble with your wallet connection or transactions?
                      </p>
                      <Button variant="secondary" className="w-full">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="guides" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How to Use Cryptocurrency with iREVA</CardTitle>
                  <CardDescription>
                    Follow these guides to start investing in real estate using cryptocurrency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center mr-3">1</div>
                      Getting Started with Crypto Wallets
                    </h3>
                    <div className="pl-11 space-y-3">
                      <p className="text-muted-foreground">
                        A crypto wallet is your gateway to blockchain transactions. Here's how to set one up:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Install a wallet like MetaMask from their official website</li>
                        <li>Create a new wallet and securely save your recovery phrase</li>
                        <li>Add funds to your wallet through an exchange or direct transfer</li>
                        <li>Connect your wallet to iREVA using the "Connect Wallet" button</li>
                      </ul>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href="/crypto-education#wallet-setup" className="flex items-center text-blue-600">
                          View detailed guide
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 flex items-center justify-center mr-3">2</div>
                      Investing in Properties with Cryptocurrency
                    </h3>
                    <div className="pl-11 space-y-3">
                      <p className="text-muted-foreground">
                        iREVA makes it easy to invest in real estate using your crypto assets:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Browse properties and select one you'd like to invest in</li>
                        <li>Choose "Cryptocurrency" as your payment method</li>
                        <li>Select which cryptocurrency you want to use</li>
                        <li>Confirm transaction details and approve in your wallet</li>
                        <li>Receive tokenized property rights in your wallet</li>
                      </ul>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href="/crypto-education#investing" className="flex items-center text-blue-600">
                          View detailed guide
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 flex items-center justify-center mr-3">3</div>
                      Managing Your Blockchain Investments
                    </h3>
                    <div className="pl-11 space-y-3">
                      <p className="text-muted-foreground">
                        Track and manage your property investments on the blockchain:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>View your tokenized property shares in your iREVA dashboard</li>
                        <li>Track property performance and ROI distribution</li>
                        <li>Claim your returns directly to your wallet</li>
                        <li>Verify all transactions on the blockchain</li>
                      </ul>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href="/crypto-education#managing-investments" className="flex items-center text-blue-600">
                          View detailed guide
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  Never share your wallet's private keys or recovery phrase with anyone, including iREVA support.
                  All legitimate transactions will only require you to approve them through your wallet's interface.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Common questions about using cryptocurrency with iREVA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">What cryptocurrencies does iREVA accept?</h3>
                    <p className="text-sm text-muted-foreground">
                      iREVA currently accepts Ethereum (ETH), Polygon (MATIC), and Binance Coin (BNB) for property investments. 
                      We're continuously expanding our supported cryptocurrencies based on user demand.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">How are my crypto investments secured?</h3>
                    <p className="text-sm text-muted-foreground">
                      Your investments are secured through smart contracts on the blockchain. These contracts are audited by 
                      security firms and publicly verifiable. Your property rights are tokenized, providing transparent 
                      and immutable proof of ownership.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">What are the benefits of investing with cryptocurrency?</h3>
                    <p className="text-sm text-muted-foreground">
                      Cryptocurrency investments offer several advantages including faster transactions, reduced fees for 
                      international investments, enhanced security through blockchain technology, and potential tax benefits 
                      depending on your jurisdiction.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">Can I sell my property tokens before the maturity period?</h3>
                    <p className="text-sm text-muted-foreground">
                      Yes, iREVA offers a secondary marketplace where you can list your property tokens for sale. 
                      However, early exits may be subject to fees as outlined in the investment terms for each property.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">What happens if I lose access to my wallet?</h3>
                    <p className="text-sm text-muted-foreground">
                      If you lose access to your wallet, your investments remain safe on the blockchain, but you'll need to 
                      restore your wallet using your recovery phrase to access them. This is why securely backing up your 
                      recovery phrase is essential. iREVA cannot recover your wallet for you.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Still have questions?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Our support team is available to answer any questions about cryptocurrency investments or technical issues.
                  </p>
                  <div className="flex space-x-3">
                    <Button>Contact Support</Button>
                    <Button variant="outline" asChild>
                      <Link href="/crypto-education">View Documentation</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;