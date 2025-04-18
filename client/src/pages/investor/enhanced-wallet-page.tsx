import React from 'react';
import EnhancedWallet from '@/components/Wallet/EnhancedWallet';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'wouter';
import { Home as HomeIcon, Wallet as WalletIcon } from 'lucide-react';

const EnhancedWalletPage = () => {
  return (
    <InvestorLayout>
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
        </Box>
      </Box>
      
      <EnhancedWallet />
    </InvestorLayout>
  );
};

export default EnhancedWalletPage;