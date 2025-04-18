import React from 'react';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import WalletMUI from '@/components/Wallet/WalletMUI';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'wouter';
import { Home as HomeIcon, Wallet as WalletIcon } from 'lucide-react';

const WalletMUIPage = () => {
  return (
    <InvestorLayout>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
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