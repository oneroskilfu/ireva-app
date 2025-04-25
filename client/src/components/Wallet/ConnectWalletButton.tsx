import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wallet, ChevronDown, AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

type NetworkType = 'ethereum' | 'polygon' | 'binance';

interface ConnectWalletButtonProps {
  onWalletConnected?: (address: string, network: NetworkType) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onWalletConnected,
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkType>('ethereum');
  const [isOpen, setIsOpen] = useState(false);

  // Check if window.ethereum is available (MetaMask or similar Ethereum provider)
  const hasProvider = typeof window !== 'undefined' && window.ethereum !== undefined;

  useEffect(() => {
    // Check for existing connection on component mount
    const checkConnection = async () => {
      if (hasProvider && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            fetchBalance(accounts[0]);
            detectNetwork();
            
            if (onWalletConnected) {
              onWalletConnected(accounts[0], network);
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (hasProvider && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (hasProvider && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [hasProvider]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setWalletAddress(null);
      setBalance(null);
      toast({
        title: 'Wallet disconnected',
        description: 'Your wallet has been disconnected from the application.',
        variant: 'default',
      });
    } else {
      // User switched accounts
      setWalletAddress(accounts[0]);
      fetchBalance(accounts[0]);
      
      if (onWalletConnected) {
        onWalletConnected(accounts[0], network);
      }
      
      toast({
        title: 'Account changed',
        description: 'Your wallet account has been updated.',
        variant: 'default',
      });
    }
  };

  const handleChainChanged = (chainId: string) => {
    // Handle chain/network change
    detectNetwork(chainId);
    
    toast({
      title: 'Network changed',
      description: `You've switched to ${getNetworkName(chainId)}`,
      variant: 'default',
    });
    
    // Reload the page to ensure all components are in sync with the new network
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!hasProvider || !window.ethereum) {
      toast({
        title: 'Wallet provider not found',
        description: 'Please install MetaMask or another Ethereum wallet extension.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        fetchBalance(accounts[0]);
        detectNetwork();
        
        if (onWalletConnected) {
          onWalletConnected(accounts[0], network);
        }
      }

      // Send wallet info to backend
      try {
        await apiRequest('POST', '/api/crypto/wallet', {
          address: accounts[0],
          network: network
        });
      } catch (error) {
        console.error('Error saving wallet connection:', error);
      }

      toast({
        title: 'Wallet connected',
        description: 'Your wallet has been successfully connected.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchBalance = async (address: string) => {
    if (!window.ethereum) return;
    
    try {
      const result = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert balance from wei to ETH
      const balanceInEth = parseInt(result, 16) / 1e18;
      setBalance(balanceInEth.toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    }
  };

  const detectNetwork = (chainId?: string) => {
    if (!chainId && hasProvider && window.ethereum) {
      chainId = window.ethereum.chainId;
    }
    
    // Set network based on chainId
    if (chainId === '0x1' || chainId === '0x5') { // Ethereum Mainnet or Goerli
      setNetwork('ethereum');
    } else if (chainId === '0x89' || chainId === '0x13881') { // Polygon or Mumbai
      setNetwork('polygon');
    } else if (chainId === '0x38' || chainId === '0x61') { // Binance Smart Chain or BSC Testnet
      setNetwork('binance');
    } else {
      // Default to Ethereum
      setNetwork('ethereum');
    }
  };

  const getNetworkName = (chainId: string): string => {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
      '0x38': 'Binance Smart Chain',
      '0x61': 'BSC Testnet'
    };
    
    return networks[chainId] || 'Unknown Network';
  };

  const getCurrentNetworkName = (): string => {
    if (!hasProvider || !window.ethereum || !window.ethereum.chainId) return 'No Provider';
    return getNetworkName(window.ethereum.chainId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Address copied',
      description: 'Wallet address copied to clipboard',
      variant: 'default',
    });
  };

  const truncateAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getNetworkIcon = (network: NetworkType) => {
    switch (network) {
      case 'ethereum':
        return (
          <svg className="w-4 h-4 text-blue-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
          </svg>
        );
      case 'polygon':
        return (
          <svg className="w-4 h-4 text-purple-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.629 0 12 0ZM5.92 14.604l2.09-2.082 2.075 2.082-2.09 2.082-2.075-2.082Zm5.348-5.348-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Zm0 10.695L9.18 17.866l8.266-8.266 2.09 2.082-8.266 8.266v.003Zm9.181-9.18-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Z" />
          </svg>
        );
      case 'binance':
        return (
          <svg className="w-4 h-4 text-yellow-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6365 4.6355-4.6375zm0-9.4862l2.7175 2.7164-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6365 4.6355-4.6375zm-4.6365-4.4094l-11.9885 11.988 2.7175 2.7164 9.271-9.2699 9.271 9.2699 2.7175-2.7164-11.9885-11.988z" />
          </svg>
        );
      default:
        return <Wallet className="w-4 h-4 mr-2" />;
    }
  };

  const openWalletExplorer = () => {
    let url = '';
    if (walletAddress) {
      switch (network) {
        case 'ethereum':
          url = `https://etherscan.io/address/${walletAddress}`;
          break;
        case 'polygon':
          url = `https://polygonscan.com/address/${walletAddress}`;
          break;
        case 'binance':
          url = `https://bscscan.com/address/${walletAddress}`;
          break;
        default:
          url = `https://etherscan.io/address/${walletAddress}`;
      }
      window.open(url, '_blank');
    }
  };

  return (
    <>
      {walletAddress ? (
        // If wallet is connected, show popover with wallet info
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={`${className} pl-3 pr-3`}
              disabled={isConnecting}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key="connected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                  aria-label={`Connected wallet ${truncateAddress(walletAddress)} on ${getCurrentNetworkName()}`}
                >
                  {getNetworkIcon(network)}
                  <span className="mr-1">{truncateAddress(walletAddress)}</span>
                  <ChevronDown className="h-4 w-4 ml-1" aria-hidden="true" />
                </motion.div>
              </AnimatePresence>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-4" role="dialog" aria-label="Wallet Information">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getNetworkIcon(network)}
                  <span className="font-semibold">{getCurrentNetworkName()}</span>
                </div>
                
                <div className="flex items-center" aria-live="polite">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" aria-hidden="true" />
                  <span className="text-xs text-green-600">Connected</span>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground" id="wallet-address-label">Wallet Address</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => walletAddress && copyToClipboard(walletAddress)}
                      aria-label="Copy wallet address to clipboard"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={openWalletExplorer}
                      aria-label="View on blockchain explorer"
                      title="View on blockchain explorer"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div 
                  className="text-sm font-mono break-all" 
                  aria-labelledby="wallet-address-label"
                >
                  {walletAddress}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Balance</span>
                <div className="flex items-center" aria-live="polite">
                  {balance ? (
                    <span className="font-medium">{balance} {network === 'ethereum' ? 'ETH' : network === 'polygon' ? 'MATIC' : 'BNB'}</span>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-muted-foreground text-sm mr-2">Loading</span>
                      <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-muted-foreground animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Connected to iREVA</h4>
                  <p className="text-xs text-muted-foreground">
                    This wallet is now connected to iREVA platform. You can use it for property investments, payments, and receiving returns.
                  </p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        // If wallet is not connected, show connect button
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isConnecting}
          onClick={connectWallet}
        >
          <AnimatePresence mode="wait">
            {isConnecting ? (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
                aria-live="polite"
                role="status"
              >
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connecting...</span>
                <span className="sr-only">Connecting wallet, please wait</span>
              </motion.div>
            ) : (
              <motion.div
                key="connect"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Connect Wallet</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      )}
    </>
  );
};

export default ConnectWalletButton;