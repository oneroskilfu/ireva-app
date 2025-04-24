import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WalletProviderChecker from '../components/Wallet/WalletProviderChecker';
import { apiRequest } from '@/lib/queryClient';
import { Wallet, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CryptoWalletPage: React.FC = () => {
  const { toast } = useToast();
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Crypto Wallet Management</h1>
          <p className="text-muted-foreground mt-2">
            Connect to blockchain networks and manage your crypto transactions for property investments.
          </p>
        </div>

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

          <div className="col-span-full">
            {!isApiKeySaved && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-100 dark:border-amber-800 mt-2">
                <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  API Keys Required
                </h4>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  To fully utilize crypto features, please provide API keys for blockchain networks. Without these, some features may be limited.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CryptoWalletPage;