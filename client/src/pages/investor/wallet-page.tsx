import React from 'react';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import Wallet from '@/components/Wallet';
import { Wallet as WalletIcon } from 'lucide-react';

const WalletPage: React.FC = () => {
  return (
    <InvestorLayout>
      <div className="container mx-auto py-6 max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">My Wallet</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage your funds and track transactions</p>
        </header>
        
        <Wallet />
      </div>
    </InvestorLayout>
  );
};

export default WalletPage;