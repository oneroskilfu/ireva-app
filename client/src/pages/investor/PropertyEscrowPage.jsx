import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Divider, Alert } from '@mui/material';
import { Link } from 'wouter';
import EscrowDashboard from '../../components/investor/EscrowDashboard';
import { useAuth } from '@/hooks/use-auth'; // Using alias path for auth hook

const PropertyEscrowPage = () => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Simulated wallet connection - in a real app, use Web3 or ethers.js to connect to MetaMask
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } else {
        setError('MetaMask is not installed. Please install it to use this feature.');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet: ' + (err.message || 'Unknown error'));
    } finally {
      setIsConnecting(false);
    }
  };

  // Check for connected wallet on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (newAccounts) => {
            setWalletAddress(newAccounts.length > 0 ? newAccounts[0] : '');
          });
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };
    
    checkConnection();
    
    // Clean up event listener
    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Property Investment Escrow
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Securely invest in real estate properties through our blockchain-based escrow system. 
          Your funds are held in a smart contract and only released when project milestones are met.
        </Typography>
        
        {!user && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please <Link href="/auth"><Button color="primary">login</Button></Link> to access all escrow features.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!walletAddress ? (
          <Box sx={{ mb: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Connect your Ethereum wallet to view your investments and invest in properties
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 4 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Alert>
          </Box>
        )}
        
        <Divider sx={{ my: 3 }} />
      </Box>
      
      <EscrowDashboard userWalletAddress={walletAddress} />
    </Container>
  );
};

export default PropertyEscrowPage;