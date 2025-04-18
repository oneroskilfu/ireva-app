import React, { useRef } from 'react';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import WalletMUI from '@/components/Wallet/WalletMUI';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Button as MuiButton } from '@mui/material';
import { Link } from 'wouter';
import { Home as HomeIcon, Wallet as WalletIcon, HelpCircle } from 'lucide-react';
import { OnboardingTour, TourButton } from '@/components/OnboardingTour';
import { Step } from 'react-joyride';

const WalletMUIPage = () => {
  // References for tour elements
  const walletCardRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  
  // Tour steps for Material UI Wallet
  const tourSteps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to the Material UI version of your iREVA Wallet! This modern interface provides all the features you need to manage your investments.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.mui-wallet-card',
      content: 'Here\'s your wallet overview showing your current balance and recent activity.',
      placement: 'bottom',
    },
    {
      target: '.mui-wallet-tabs',
      content: 'These tabs let you switch between different wallet views: Overview, Transactions, and Payment Methods.',
      placement: 'top',
    },
    {
      target: '.mui-transaction-table',
      content: 'This table shows your transaction history with details like date, amount, and status.',
      placement: 'top',
    },
    {
      target: '.mui-wallet-actions',
      content: 'Use these buttons to perform quick actions like depositing or withdrawing funds.',
      placement: 'left',
    },
    {
      target: 'body',
      content: 'That\'s it! You can now easily manage your investments with this Material UI wallet interface.',
      placement: 'center',
    }
  ];
  
  // Function to start the tour manually
  const startTour = () => {
    // Reset tour and start again
    const existingTours = localStorage.getItem('iREVA-completed-tours');
    if (existingTours) {
      const tours = JSON.parse(existingTours);
      const filteredTours = tours.filter((tour: string) => tour !== 'wallet-mui-tour');
      localStorage.setItem('iREVA-completed-tours', JSON.stringify(filteredTours));
    }
    // Refresh page to trigger tour
    window.location.reload();
  };

  return (
    <InvestorLayout>
      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        tourId="wallet-mui-tour"
      />
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/investor/dashboard">
              <MuiLink 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }} 
                color="inherit"
              >
                <HomeIcon size={16} style={{ marginRight: '4px' }} />
                Dashboard
              </MuiLink>
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <WalletIcon size={16} style={{ marginRight: '4px' }} />
              Wallet
            </Typography>
          </Breadcrumbs>
          
          <TourButton 
            onClick={startTour}
            label="Tour Wallet"
            tooltipText="Take a guided tour of your Material UI wallet"
          />
        </Box>
        
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          My Wallet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Manage your funds, view transaction history, and invest in properties
        </Typography>
      </Box>
      
      <WalletMUI />
    </InvestorLayout>
  );
};

export default WalletMUIPage;