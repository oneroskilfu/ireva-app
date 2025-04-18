import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowBigDownDash, 
  ArrowBigUpDash,
  BarChart3,
  CreditCard,
  DollarSign
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestorLayout from '@/components/layouts/InvestorLayout';

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

  return (
    <InvestorLayout>
      <Helmet>
        <title>Wallet | iREVA Real Estate Investments</title>
      </Helmet>
      
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Wallet</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <WalletCard className="md:col-span-2" />
              
              <SummaryCard
                title="Total Funded"
                value={`₦${totalFunded.toLocaleString()}`}
                description="Lifetime deposits"
                icon={<ArrowBigDownDash className="h-4 w-4 text-green-500" />}
              />
              
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
            
            <WalletTransactionList className="mt-6" />
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
                  <div className="flex items-center p-4 border rounded-md">
                    <CreditCard className="h-8 w-8 mr-4 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">**** **** **** 4242</h3>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  
                  {/* Additional payment methods would go here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </InvestorLayout>
  );
}