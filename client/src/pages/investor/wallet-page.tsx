import React, { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowBigDownDash, 
  ArrowBigUpDash,
  BarChart3,
  CreditCard,
  DollarSign,
  HelpCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import WalletCard from '@/components/Wallet/WalletCard';
import WalletTransactionList from '@/components/Wallet/WalletTransactionList';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import { OnboardingTour, TourButton } from '@/components/OnboardingTour';
import { Step } from 'react-joyride';

// Summary Card Component
const SummaryCard = ({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode; 
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function WalletPage() {
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['/api/wallet'],
  });

  // These would typically come from APIs, but we're mocking them for now
  const totalFunded = 1250000;
  const totalWithdrawn = 450000;
  const totalInvested = 750000;
  const monthlyReturns = 25000;
  
  // Refs for the tour
  const walletCardRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);
  
  // Tour steps for the wallet page
  const tourSteps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to your iREVA Wallet! Let\'s walk through the key features to help you manage your investments.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.wallet-card',
      content: 'This is your wallet balance. Here you can see your available funds and quickly deposit or withdraw money.',
      placement: 'bottom',
    },
    {
      target: '.wallet-tabs',
      content: 'Use these tabs to navigate between different sections of your wallet.',
      placement: 'bottom',
    },
    {
      target: '.summary-cards',
      content: 'These cards show a summary of your wallet activity, including total funding, withdrawals, investments, and returns.',
      placement: 'left',
    },
    {
      target: '.transaction-list',
      content: 'Here you can view your recent transactions. Click on any transaction to see more details.',
      placement: 'top',
    },
    {
      target: 'body',
      content: 'That\'s it! You\'re now ready to manage your real estate investments through your iREVA wallet.',
      placement: 'center',
    }
  ];
  
  // Function to start the tour manually
  const startTour = () => {
    // Reset tour and start again
    const existingTours = localStorage.getItem('iREVA-completed-tours');
    if (existingTours) {
      const tours = JSON.parse(existingTours);
      const filteredTours = tours.filter((tour: string) => tour !== 'wallet-tour');
      localStorage.setItem('iREVA-completed-tours', JSON.stringify(filteredTours));
    }
    // Refresh page to trigger tour
    window.location.reload();
  };

  return (
    <InvestorLayout>
      <Helmet>
        <title>Wallet | iREVA Real Estate Investments</title>
      </Helmet>
      
      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        tourId="wallet-tour"
      />
      
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Wallet</h1>
          <TourButton 
            onClick={startTour}
            label="Tour Wallet"
            tooltipText="Take a guided tour of your wallet features"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6 wallet-tabs" ref={tabsRef}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="wallet-card md:col-span-2" ref={walletCardRef}>
                <WalletCard className="h-full" />
              </div>
              
              <div className="summary-cards" ref={summaryCardRef}>
                <SummaryCard
                  title="Total Funded"
                  value={`₦${totalFunded.toLocaleString()}`}
                  description="Lifetime deposits"
                  icon={<ArrowBigDownDash className="h-4 w-4 text-green-500" />}
                />
              </div>
              
              <SummaryCard
                title="Total Withdrawn"
                value={`₦${totalWithdrawn.toLocaleString()}`}
                description="Lifetime withdrawals"
                icon={<ArrowBigUpDash className="h-4 w-4 text-orange-500" />}
              />
              
              <SummaryCard
                title="Total Invested"
                value={`₦${totalInvested.toLocaleString()}`}
                description="Active investments"
                icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
              />
              
              <SummaryCard
                title="Monthly Returns"
                value={`₦${monthlyReturns.toLocaleString()}`}
                description="Average monthly earnings"
                icon={<DollarSign className="h-4 w-4 text-green-500" />}
              />
            </div>
            
            <div className="transaction-list" ref={transactionsRef}>
              <WalletTransactionList className="mt-6" />
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            <WalletTransactionList />
          </TabsContent>
          
          <TabsContent value="payment-methods">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods for deposits and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <CreditCard className="h-8 w-8 mr-4 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">**** **** **** 4242</h3>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                      Default
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <svg className="h-8 w-8 mr-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002z" />
                      </svg>
                      <div>
                        <h3 className="font-medium">Cryptocurrency Wallet</h3>
                        <p className="text-sm text-muted-foreground">USDC/USDT Supported</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                      Alternative
                    </span>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Payment Preference</h3>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">Current preference: <strong>Fiat (Default)</strong></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fiat methods include credit card, bank transfer, and payment gateways.
                        Cryptocurrency is available as an alternative option.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </InvestorLayout>
  );
}