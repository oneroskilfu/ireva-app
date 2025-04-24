import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  CopyIcon, 
  Download, 
  ExternalLink, 
  FileText, 
  Info, 
  Lock, 
  Wallet, 
  Shield,
  WalletCards,
  LineChart,
  HelpCircle,
  Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'wouter';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
  type: 'guide' | 'tutorial' | 'faq' | 'article';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const educationalResources: ResourceItem[] = [
  {
    id: 'intro-crypto',
    title: 'Introduction to Cryptocurrency',
    description: 'Learn the basics of blockchain technology and how digital currencies work',
    icon: <BookOpen className="h-6 w-6" />,
    type: 'guide',
    difficulty: 'beginner'
  },
  {
    id: 'wallet-setup',
    title: 'Setting Up Your Crypto Wallet',
    description: 'Step-by-step guide to creating and securing a wallet for your digital assets',
    icon: <Wallet className="h-6 w-6" />,
    type: 'tutorial',
    difficulty: 'beginner'
  },
  {
    id: 'wallet-connection',
    title: 'Connecting Your Wallet to iREVA',
    description: 'Learn how to connect your cryptocurrency wallet to the iREVA platform',
    icon: <WalletCards className="h-6 w-6" />,
    type: 'tutorial',
    difficulty: 'beginner'
  },
  {
    id: 'security',
    title: 'Crypto Security Best Practices',
    description: 'Essential tips for securing your cryptocurrency and protecting your investments',
    icon: <Shield className="h-6 w-6" />,
    type: 'guide',
    difficulty: 'intermediate'
  },
  {
    id: 'blockchain-real-estate',
    title: 'Blockchain in Real Estate',
    description: 'How blockchain technology is revolutionizing property investment and ownership',
    icon: <FileText className="h-6 w-6" />,
    type: 'article',
    difficulty: 'intermediate'
  },
  {
    id: 'crypto-investment',
    title: 'Investing in Properties with Crypto',
    description: 'Complete guide to using cryptocurrency for real estate investment on iREVA',
    icon: <LineChart className="h-6 w-6" />,
    type: 'guide',
    difficulty: 'intermediate'
  },
  {
    id: 'crypto-faq',
    title: 'Cryptocurrency FAQ',
    description: 'Answers to frequently asked questions about using crypto on iREVA',
    icon: <HelpCircle className="h-6 w-6" />,
    type: 'faq',
    difficulty: 'beginner'
  },
  {
    id: 'tokenization',
    title: 'Property Tokenization Explained',
    description: 'Understanding how real estate assets are tokenized and traded on the blockchain',
    icon: <FileText className="h-6 w-6" />,
    type: 'article',
    difficulty: 'advanced'
  }
];

export default function CryptoEducationPage() {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  
  const filteredResources = educationalResources.filter(resource => {
    if (selectedTab !== 'all' && resource.type !== selectedTab) return false;
    if (selectedDifficulty !== 'all' && resource.difficulty !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crypto Education Center</h1>
            <p className="text-muted-foreground mt-2">
              Learn about cryptocurrency, blockchain technology, and how to use digital assets for real estate investment
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-blue-700 dark:text-blue-400">New to Crypto?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-700/80 dark:text-blue-400/80 mb-4">
                      Start with our beginner guides to understand the basics of cryptocurrency and blockchain technology.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        document.getElementById('intro-crypto')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-purple-700 dark:text-purple-400">Connect Your Wallet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-700/80 dark:text-purple-400/80 mb-4">
                      Learn how to connect your cryptocurrency wallet to iREVA and start investing in properties.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        document.getElementById('wallet-connection')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      View Guide <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Educational Resources</h2>
                  <div className="flex space-x-2">
                    <select 
                      className="text-sm border rounded-md px-2 py-1 bg-background"
                      value={selectedTab}
                      onChange={(e) => setSelectedTab(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="guide">Guides</option>
                      <option value="tutorial">Tutorials</option>
                      <option value="article">Articles</option>
                      <option value="faq">FAQs</option>
                    </select>
                    <select 
                      className="text-sm border rounded-md px-2 py-1 bg-background"
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {filteredResources.map((resource) => (
                    <div key={resource.id} id={resource.id}>
                      <Card className="group transition-all hover:border-blue-200 dark:hover:border-blue-800">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                  {resource.icon}
                                </div>
                                <div>
                                  <h3 className="font-medium text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {resource.title}
                                  </h3>
                                  <p className="text-muted-foreground text-sm">
                                    {resource.description}
                                  </p>
                                  <div className="flex items-center mt-2 space-x-2">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {resource.type}
                                    </Badge>
                                    <Badge variant={
                                      resource.difficulty === 'beginner' 
                                        ? 'outline' 
                                        : resource.difficulty === 'intermediate' 
                                          ? 'secondary' 
                                          : 'default'
                                    } className="text-xs capitalize">
                                      {resource.difficulty}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                  
                  {filteredResources.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No resources match your selected filters.</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSelectedTab('all');
                          setSelectedDifficulty('all');
                        }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div id="intro-crypto">
                <h2 className="text-2xl font-bold mb-4">Introduction to Cryptocurrency</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="mb-4">
                      Cryptocurrency is a digital or virtual form of currency that uses cryptography for security, making it difficult to counterfeit. Unlike traditional currencies issued by governments (fiat currencies), cryptocurrencies operate on decentralized networks based on blockchain technology—a distributed ledger enforced by a network of computers.
                    </p>
                    <h3 className="text-lg font-medium mt-6 mb-2">Key Cryptocurrency Concepts</h3>
                    <ul className="space-y-3 list-disc pl-5">
                      <li>
                        <span className="font-medium">Blockchain Technology:</span> A distributed ledger that records all transactions across a network of computers. Once recorded, the data cannot be altered retroactively.
                      </li>
                      <li>
                        <span className="font-medium">Decentralization:</span> No central authority controls cryptocurrency networks. They operate on a peer-to-peer basis.
                      </li>
                      <li>
                        <span className="font-medium">Digital Wallets:</span> Software programs that store private and public keys, allowing users to send and receive digital currencies and monitor their balance.
                      </li>
                      <li>
                        <span className="font-medium">Mining:</span> The process by which transactions are verified and added to the blockchain, and also the means through which new coins are released.
                      </li>
                    </ul>
                    
                    <h3 className="text-lg font-medium mt-6 mb-2">Popular Cryptocurrencies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Bitcoin (BTC)</h4>
                            <p className="text-xs text-muted-foreground">Original cryptocurrency</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Ethereum (ETH)</h4>
                            <p className="text-xs text-muted-foreground">Smart contract platform</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.629 0 12 0ZM5.92 14.604l2.09-2.082 2.075 2.082-2.09 2.082-2.075-2.082Zm5.348-5.348-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Zm0 10.695L9.18 17.866l8.266-8.266 2.09 2.082-8.266 8.266v.003Zm9.181-9.18-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Polygon (MATIC)</h4>
                            <p className="text-xs text-muted-foreground">Ethereum scaling solution</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div id="wallet-connection">
                <h2 className="text-2xl font-bold mb-4">Connecting Your Wallet to iREVA</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Before you begin</AlertTitle>
                        <AlertDescription>
                          Make sure you have a cryptocurrency wallet like MetaMask installed and set up. If you don't have one yet, check our guide on setting up your first crypto wallet.
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-3">Step-by-Step Guide</h3>
                    <ol className="space-y-6 list-decimal pl-5">
                      <li>
                        <h4 className="font-medium">Navigate to the Wallet Page</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Go to your iREVA dashboard and click on the "Wallet" section in the navigation menu.
                        </p>
                        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs font-medium">
                            Screenshot: Wallet Page
                          </div>
                          <div className="p-4 bg-gray-100 dark:bg-gray-900 text-center">
                            [Wallet Page Screenshot]
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <h4 className="font-medium">Click "Connect Wallet"</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          On the wallet page, click the "Connect Wallet" button to initiate the connection process.
                        </p>
                      </li>
                      
                      <li>
                        <h4 className="font-medium">Select Your Wallet Provider</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Choose from the available wallet providers. iREVA currently supports MetaMask, WalletConnect, and Coinbase Wallet.
                        </p>
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          <div className="p-3 border rounded-lg flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                              <svg className="w-6 h-6 text-orange-600" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M32.9582 1L19.8241 10.7183L22.2665 5.09986L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2.04834 1L15.0182 10.809L12.7336 5.0999L2.04834 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span className="text-xs font-medium">MetaMask</span>
                          </div>
                          <div className="p-3 border rounded-lg flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 96 96" fill="currentColor">
                                <path d="M48 0C21.5 0 0 21.5 0 48C0 74.5 21.5 96 48 96C74.5 96 96 74.5 96 48C96 21.5 74.5 0 48 0ZM48.1 73.1C34.5 73.1 23.3 61.9 23.3 48.3C23.3 34.7 34.5 23.5 48.1 23.5C61.7 23.5 72.9 34.7 72.9 48.3C72.9 61.9 61.7 73.1 48.1 73.1Z"/>
                              </svg>
                            </div>
                            <span className="text-xs font-medium">WalletConnect</span>
                          </div>
                          <div className="p-3 border rounded-lg flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 1024 1024" fill="currentColor">
                                <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 938.7c-235.6 0-426.7-191-426.7-426.7S276.4 85.3 512 85.3 938.7 276.4 938.7 512 747.6 938.7 512 938.7z"/>
                                <path d="M512 426.7c-47.1 0-85.3 38.2-85.3 85.3s38.2 85.3 85.3 85.3 85.3-38.2 85.3-85.3-38.2-85.3-85.3-85.3z"/>
                              </svg>
                            </div>
                            <span className="text-xs font-medium">Coinbase Wallet</span>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <h4 className="font-medium">Authorize the Connection</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your selected wallet will prompt you to authorize the connection to iREVA. Review the permissions and click "Connect" or "Approve".
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3 flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-yellow-800">Security Note</span>
                            <p className="text-xs text-yellow-700 mt-1">
                              Always verify you're on the official iREVA website before connecting your wallet. Check the URL and look for the secure padlock icon in your browser.
                            </p>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <h4 className="font-medium">Confirm Successful Connection</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Once connected, you'll see your wallet address and balance displayed on the page. Your wallet is now ready to be used for cryptocurrency transactions on iREVA.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3 flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-green-800">Success Indicator</span>
                            <p className="text-xs text-green-700 mt-1">
                              A "Wallet Connected" confirmation message will appear, and your wallet address will be displayed in a shortened format (e.g., 0x1234...5678).
                            </p>
                          </div>
                        </div>
                      </li>
                    </ol>
                    
                    <h3 className="text-lg font-medium mt-8 mb-3">Troubleshooting Common Issues</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Wallet Not Detecting</h4>
                        <p className="text-sm text-muted-foreground">
                          If iREVA can't detect your wallet, try refreshing the page or restarting your browser. Make sure your wallet extension is enabled and up to date.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Network Mismatch</h4>
                        <p className="text-sm text-muted-foreground">
                          Ensure your wallet is connected to the correct blockchain network. iREVA supports Ethereum, Polygon, and Binance Smart Chain.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Connection Timeout</h4>
                        <p className="text-sm text-muted-foreground">
                          If the connection process times out, check your internet connection and try again. If the problem persists, try using a different browser.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex items-center justify-between">
                      <Link href="/wallet">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <span className="flex items-center">
                            Connect Your Wallet Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground"
                        onClick={() => {
                          document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <span className="flex items-center">
                          Read Security Guide
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div id="security">
                <h2 className="text-2xl font-bold mb-4">Crypto Security Best Practices</h2>
                <Card>
                  <CardContent className="pt-6">
                    <Alert className="mb-6 bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important Security Information</AlertTitle>
                      <AlertDescription>
                        Security is crucial when dealing with cryptocurrencies. Once a transaction is confirmed on the blockchain, it cannot be reversed, and if you lose access to your wallet, you might permanently lose your assets.
                      </AlertDescription>
                    </Alert>
                    
                    <h3 className="text-lg font-medium mb-4">Essential Security Measures</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                          <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Secure Your Recovery Phrase</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your recovery phrase (seed phrase) is the master key to your wallet. Write it down on paper and store it in a secure location. Never store it digitally or share it with anyone.
                          </p>
                          <div className="mt-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">Example (DO NOT USE):</span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <CopyIcon className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">1. apple</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">2. basket</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">3. camera</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">4. dance</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">5. entry</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">6. fruit</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">7. garden</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">8. house</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">9. island</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">10. jacket</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">11. kitchen</div>
                              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">12. lemon</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Use Strong Authentication</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Enable two-factor authentication (2FA) wherever possible. Use strong, unique passwords for your exchange accounts and wallet apps. Consider using a hardware wallet for storing large amounts of cryptocurrency.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Beware of Phishing Attempts</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Be vigilant about phishing attempts. Always verify URLs before entering your credentials or connecting your wallet. Never click on suspicious links in emails or messages.
                          </p>
                          <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 rounded-md p-3 text-xs text-yellow-800 dark:text-yellow-300">
                            <strong>Tip:</strong> The official iREVA URL is always <span className="font-mono bg-yellow-100 dark:bg-yellow-900/40 px-1 py-0.5 rounded">https://ireva.com</span> - Verify this in your browser's address bar.
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                          <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Regularly Update Your Software</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Keep your wallet software, browser extensions, and operating system up to date with the latest security patches. Outdated software may contain vulnerabilities that hackers can exploit.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-lg font-medium mb-4">iREVA's Security Measures</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      While you're responsible for the security of your wallet, iREVA implements several measures to protect your investments:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                            <Shield className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Smart Contract Audits</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              All smart contracts used on iREVA undergo rigorous security audits by independent third parties.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                            <Lock className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Secure Transaction Signing</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              We use secure transaction signing to ensure only authorized actions are processed on the blockchain.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                            <ExternalLink className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Transaction Transparency</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              All transactions are recorded on the blockchain and can be independently verified through block explorers.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                            <Video className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Transaction Confirmation</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Every transaction requires explicit confirmation in your wallet, giving you full control over your assets.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="mt-6 w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Crypto Security Checklist
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>
                    Jump to popular resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['wallet-connection', 'intro-crypto', 'security', 'crypto-investment'].map((link) => {
                    const resource = educationalResources.find(r => r.id === link);
                    if (!resource) return null;
                    
                    return (
                      <div 
                        key={link} 
                        className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => {
                          document.getElementById(link)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded mr-3">
                          {resource.icon}
                        </div>
                        <span className="text-sm font-medium">{resource.title}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    Get assistance with cryptocurrency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Our crypto experts are available to help you navigate the world of digital assets and blockchain technology.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="mr-2 h-4 w-4" />
                      Schedule a Demo
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      View Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Ready to Invest?</h3>
                <p className="text-sm text-blue-700/80 dark:text-blue-400/80 mb-4">
                  Apply your crypto knowledge and start investing in high-quality real estate properties today.
                </p>
                <Link href="/">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <span className="flex items-center">
                      Browse Properties
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}