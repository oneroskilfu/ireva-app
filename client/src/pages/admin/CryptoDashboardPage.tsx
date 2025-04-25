import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, AlertCircle, CreditCard, Bitcoin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import CryptoTransactionTable from "@/components/admin/CryptoTransactionTable";
import CryptoInvestmentsByProject from "@/components/admin/CryptoInvestmentsByProject";
import { useToast } from "@/hooks/use-toast";

const StatCard = ({ title, value, description, icon }: { title: string; value: string; description?: string; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function CryptoDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch crypto transactions
  const { data: transactionsData, isLoading: isLoadingTransactions, isError: isErrorTransactions } = useQuery({
    queryKey: ['/api/admin/crypto/transactions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/crypto/transactions');
      return response.json();
    },
  });

  // Fetch crypto wallet balances
  const { data: balancesData, isLoading: isLoadingBalances, isError: isErrorBalances } = useQuery({
    queryKey: ['/api/admin/crypto/balances'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/crypto/balances');
      return response.json();
    },
  });

  // Fetch crypto alerts
  const { data: alertsData, isLoading: isLoadingAlerts, isError: isErrorAlerts } = useQuery({
    queryKey: ['/api/admin/crypto/alerts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/crypto/alerts');
      return response.json();
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto/transactions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto/balances'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto/alerts'] });
    toast({
      title: "Data refreshed",
      description: "The latest crypto data has been loaded",
    });
  };

  const isLoading = isLoadingTransactions || isLoadingBalances || isLoadingAlerts;
  const isError = isErrorTransactions || isErrorBalances || isErrorAlerts;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto my-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error Loading Crypto Dashboard
            </CardTitle>
            <CardDescription>
              There was a problem loading the crypto transaction data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transactions = transactionsData?.transactions || [];
  const balances = balancesData?.balances || [];
  const alerts = alertsData?.alerts || { highValue: [], failed: [] };

  // Calculate total transaction volume
  const totalVolume = transactions.reduce((sum, tx) => {
    // Only count completed transactions
    if (['completed', 'confirmed', 'paid'].includes(tx.status)) {
      return sum + Number(tx.amount);
    }
    return sum;
  }, 0);

  // Calculate pending transaction volume
  const pendingVolume = transactions.reduce((sum, tx) => {
    if (['pending', 'processing'].includes(tx.status)) {
      return sum + Number(tx.amount);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Crypto Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor all cryptocurrency transactions and investments</p>
        </div>
        <Button onClick={refreshData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          title="Total Transactions" 
          value={transactions.length.toString()} 
          description={`${transactions.filter(tx => ['completed', 'confirmed', 'paid'].includes(tx.status)).length} completed`} 
          icon={<CreditCard />}
        />
        <StatCard 
          title="Total Volume" 
          value={formatCurrency(totalVolume, true)} 
          description="From all completed transactions" 
          icon={<Bitcoin />}
        />
        <StatCard 
          title="Pending Volume" 
          value={formatCurrency(pendingVolume, true)} 
          description={`${transactions.filter(tx => ['pending', 'processing'].includes(tx.status)).length} pending transactions`} 
          icon={<RefreshCw />}
        />
        <StatCard 
          title="High-Value Alerts" 
          value={alerts.highValue.length.toString()} 
          description={`${alerts.failed.length} failed in last 24h`} 
          icon={<AlertCircle />}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Transactions</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
        </TabsList>
        
        {/* Transactions Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Recent Transactions */}
          <CryptoTransactionTable 
            transactions={transactions} 
            title="Recent Crypto Transactions" 
            description="View and manage all cryptocurrency transactions on the platform"
          />
          
          {/* High Value Transactions */}
          {alerts.highValue.length > 0 && (
            <CryptoTransactionTable 
              transactions={alerts.highValue} 
              title="High-Value Transactions" 
              description="Transactions that exceed threshold values and require attention"
            />
          )}
          
          {/* Failed Transactions */}
          {alerts.failed.length > 0 && (
            <CryptoTransactionTable 
              transactions={alerts.failed} 
              title="Failed Transactions (Last 24h)" 
              description="Recent transactions that failed or expired and may need follow-up"
            />
          )}
        </TabsContent>
        
        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-4">
          <CryptoInvestmentsByProject />
        </TabsContent>
        
        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Wallet Balances</CardTitle>
              <CardDescription>Current balances of all cryptocurrency wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {balances.map((balance, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Bitcoin className="h-4 w-4 mr-2" />
                        {balance.currency}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{balance.balance.toFixed(6)}</div>
                      <p className="text-xs text-muted-foreground">
                        {balance.pendingBalance > 0 ? `+ ${balance.pendingBalance.toFixed(6)} pending` : 'No pending deposits'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}