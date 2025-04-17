import WalletOverview from '@/components/wallet/WalletOverview';
import InvestorLayout from '@/components/layouts/InvestorLayout';

const WalletPage = () => {
  return (
    <InvestorLayout>
      <WalletOverview />
    </InvestorLayout>
  );
};

export default WalletPage;