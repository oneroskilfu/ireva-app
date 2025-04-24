import { useState } from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Lightbulb, 
  Search, 
  Youtube, 
  BookMarked, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap,
  Link as LinkIcon,
  Download,
  Wallet,
  Coins,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
  type: 'guide' | 'tutorial' | 'faq' | 'article';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function CryptoEducationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const resources: ResourceItem[] = [
    {
      id: '1',
      title: 'Getting Started with Cryptocurrency',
      description: 'Learn the basics of cryptocurrency, blockchain technology, and how to set up your first wallet.',
      icon: <Wallet className="h-6 w-6 text-blue-500" />,
      link: '/resources/crypto-basics',
      type: 'guide',
      difficulty: 'beginner',
    },
    {
      id: '2',
      title: 'How to Buy and Store Cryptocurrencies',
      description: 'A step-by-step guide on purchasing crypto from exchanges and securely storing it.',
      icon: <Coins className="h-6 w-6 text-green-500" />,
      link: '/resources/buying-crypto',
      type: 'tutorial',
      difficulty: 'beginner',
    },
    {
      id: '3',
      title: 'Real Estate Tokenization Explained',
      description: 'Understand how properties are tokenized on the blockchain and how ownership is distributed.',
      icon: <Building className="h-6 w-6 text-purple-500" />,
      link: '/resources/tokenization',
      type: 'article',
      difficulty: 'intermediate',
    },
    {
      id: '4',
      title: 'Security Best Practices for Crypto Investors',
      description: 'Essential security measures to protect your cryptocurrency investments.',
      icon: <CheckCircle2 className="h-6 w-6 text-red-500" />,
      link: '/resources/crypto-security',
      type: 'guide',
      difficulty: 'intermediate',
    },
    {
      id: '5',
      title: 'Advanced Blockchain Concepts',
      description: 'Dive deeper into smart contracts, consensus mechanisms, and DeFi concepts.',
      icon: <GraduationCap className="h-6 w-6 text-amber-500" />,
      link: '/resources/advanced-blockchain',
      type: 'article',
      difficulty: 'advanced',
    },
    {
      id: '6',
      title: 'Video Tutorial: Connecting MetaMask to iREVA',
      description: 'A visual guide to connecting your MetaMask wallet to the iREVA platform.',
      icon: <Youtube className="h-6 w-6 text-red-500" />,
      link: '/resources/metamask-tutorial',
      type: 'tutorial',
      difficulty: 'beginner',
    },
    {
      id: '7',
      title: 'Understanding Investment ROI and Distributions',
      description: 'Learn how returns are calculated, distributed, and claimed on property investments.',
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      link: '/resources/crypto-roi',
      type: 'guide',
      difficulty: 'intermediate',
    },
    {
      id: '8',
      title: 'Tax Implications of Crypto Real Estate Investments',
      description: 'Important tax considerations for cryptocurrency property investments in Nigeria and beyond.',
      icon: <BookMarked className="h-6 w-6 text-green-500" />,
      link: '/resources/crypto-taxes',
      type: 'article',
      difficulty: 'advanced',
    },
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'What cryptocurrencies does iREVA accept for property investments?',
      answer: 'iREVA currently accepts Ethereum (ETH), Polygon (MATIC), and Binance Coin (BNB) for property investments. We are continuously evaluating and adding support for additional cryptocurrencies based on market stability and user demand.'
    },
    {
      id: 'faq-2',
      question: 'How secure are cryptocurrency investments on iREVA?',
      answer: 'iREVA employs multiple layers of security to protect your cryptocurrency investments. All property investments are secured through smart contracts that have been audited by third-party security firms. Your property rights are tokenized and recorded on the blockchain, providing transparent and immutable proof of ownership. We also implement industry-standard security practices such as multi-signature wallets, cold storage, and regular security audits.'
    },
    {
      id: 'faq-3',
      question: 'Do I need technical knowledge to invest with cryptocurrency?',
      answer: 'No, iREVA is designed to be user-friendly even for those new to cryptocurrency. Our platform provides step-by-step guidance, and our educational resources can help you understand the basics. All you need is a cryptocurrency wallet like MetaMask, and we'll guide you through the rest of the process.'
    },
    {
      id: 'faq-4',
      question: 'What happens if I lose access to my crypto wallet?',
      answer: 'If you lose access to your crypto wallet, your investments are still recorded on the blockchain and associated with your wallet address. However, without your private keys or recovery phrase, you won't be able to access or manage these investments. iREVA cannot recover your wallet for you, which is why we strongly recommend securely backing up your recovery phrase and private keys. Contact our support team for guidance on next steps if this occurs.'
    },
    {
      id: 'faq-5',
      question: 'How are property returns distributed for crypto investors?',
      answer: 'Returns on property investments are distributed directly to your connected wallet in the same cryptocurrency you used for investment. The distribution occurs automatically through smart contracts based on the property's performance and your ownership percentage. You can track all distributions in your iREVA dashboard and verify them on the blockchain.'
    },
    {
      id: 'faq-6',
      question: 'Are there additional fees for cryptocurrency transactions?',
      answer: 'When investing with cryptocurrency, you'll need to pay network gas fees, which vary depending on network congestion and the blockchain you're using. iREVA does not charge additional platform fees for cryptocurrency investments beyond our standard investment fees, which are transparently disclosed before you complete any transaction.'
    },
    {
      id: 'faq-7',
      question: 'Can I sell my property tokens before the investment term ends?',
      answer: 'Currently, property tokens on iREVA are designed as long-term investments with a predefined maturity period. However, we're developing a secondary marketplace that will allow investors to trade their property tokens with other iREVA users before the term ends, subject to certain conditions and regulatory requirements.'
    },
    {
      id: 'faq-8',
      question: 'How does iREVA handle cryptocurrency price volatility?',
      answer: 'To mitigate the effects of cryptocurrency price volatility, iREVA converts the cryptocurrency value to the local currency (NGN) at the time of investment using real-time exchange rates. Your investment amount and returns are then tracked in the local currency, ensuring that property valuations remain stable regardless of crypto market fluctuations.'
    },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || resource.difficulty === difficultyFilter;
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Beginner</span>;
      case 'intermediate':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Intermediate</span>;
      case 'advanced':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Advanced</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'guide':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Guide</span>;
      case 'tutorial':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Tutorial</span>;
      case 'faq':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">FAQ</span>;
      case 'article':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Article</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white"
              >
                Crypto Education Center
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-10"
              >
                Learn everything you need to know about cryptocurrency and blockchain-based real estate investing
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative max-w-lg mx-auto"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for guides, tutorials, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-lg rounded-lg w-full"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="resources" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="resources">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Resources
                  </TabsTrigger>
                  <TabsTrigger value="faq">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="support">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Support
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-8">
                <div className="flex flex-wrap gap-4 justify-center mb-6">
                  <div>
                    <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      id="difficulty-filter"
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content Type
                    </label>
                    <select
                      id="type-filter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="guide">Guides</option>
                      <option value="tutorial">Tutorials</option>
                      <option value="article">Articles</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.length > 0 ? (
                    filteredResources.map((resource) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <Link href={resource.link || '#'}>
                          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow duration-300">
                            <CardHeader>
                              <div className="flex justify-between items-center mb-2">
                                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                  {resource.icon}
                                </div>
                                <div className="flex space-x-2">
                                  {getDifficultyBadge(resource.difficulty)}
                                  {getTypeBadge(resource.type)}
                                </div>
                              </div>
                              <CardTitle>{resource.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-600 dark:text-gray-400 mb-4">{resource.description}</p>
                              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                                Read more
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10">
                      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No resources found</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        We couldn't find any resources matching your search criteria. Try adjusting your filters or search term.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center mt-12">
                  <h3 className="text-xl font-semibold mb-4">New to Cryptocurrency?</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                    Start with our beginner-friendly guides to learn the fundamentals of blockchain technology and cryptocurrency investing.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Learning
                  </Button>
                </div>
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      Common questions about cryptocurrency and blockchain-based real estate investing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-600 dark:text-gray-400">
                              {faq.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 mt-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-gray-700 p-2 rounded-full">
                      <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Didn't find what you're looking for?</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Our support team is ready to help with any questions you have about cryptocurrency investments.
                      </p>
                      <Button variant="outline" className="mr-4">
                        Contact Support
                      </Button>
                      <Button variant="link" className="text-blue-600 dark:text-blue-400 p-0">
                        Visit Knowledge Base
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Support Tab */}
              <TabsContent value="support" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Support</CardTitle>
                      <CardDescription>
                        Get personalized help from our crypto specialists
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Email Us</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">crypto-support@ireva.ng</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Live Chat</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Available 9am-5pm WAT, Mon-Fri</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Phone Support</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">+234 (0) 800-IREVA-CRYPTO</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Schedule a Consultation</h4>
                        <Button className="w-full">Book a Crypto Specialist</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Downloadable Resources</CardTitle>
                      <CardDescription>
                        Comprehensive guides you can download and read offline
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Beginner's Guide to Crypto</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">PDF • 2.4MB</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium">MetaMask Setup Tutorial</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">PDF • 3.1MB</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Crypto Security Checklist</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">PDF • 1.8MB</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Crypto Terms Glossary</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">PDF • 5.2MB</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>External Resources</CardTitle>
                    <CardDescription>
                      Trusted third-party resources to expand your cryptocurrency knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a href="https://ethereum.org/en/what-is-ethereum/" target="_blank" rel="noopener noreferrer" className="block">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                              <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Ethereum.org</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Official Ethereum Foundation resource</p>
                            </div>
                          </div>
                        </div>
                      </a>
                      
                      <a href="https://academy.binance.com/" target="_blank" rel="noopener noreferrer" className="block">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center space-x-3">
                            <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                              <LinkIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Binance Academy</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Educational resources from Binance</p>
                            </div>
                          </div>
                        </div>
                      </a>
                      
                      <a href="https://polygon.technology/blog" target="_blank" rel="noopener noreferrer" className="block">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                              <LinkIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Polygon Blog</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Updates and guides from Polygon</p>
                            </div>
                          </div>
                        </div>
                      </a>
                      
                      <a href="https://metamask.io/learn/" target="_blank" rel="noopener noreferrer" className="block">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center space-x-3">
                            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                              <LinkIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">MetaMask Learn</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Tutorials for using MetaMask wallet</p>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-blue-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated on Crypto Education</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Subscribe to our newsletter to receive the latest guides, tutorials, and cryptocurrency news relevant to real estate investing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-grow"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}