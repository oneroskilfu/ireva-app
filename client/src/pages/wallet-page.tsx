import React from 'react';
import InvestorLayout from '@/layouts/InvestorLayout';
import WalletOverview from '@/components/Investor/WalletOverview';
import { Helmet } from 'react-helmet-async';

const WalletPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>My Wallet | iREVA</title>
      </Helmet>
      <InvestorLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Wallet & Transactions</h1>
          <WalletOverview />
        </div>
      </InvestorLayout>
    </>
  );
};

export default WalletPage;