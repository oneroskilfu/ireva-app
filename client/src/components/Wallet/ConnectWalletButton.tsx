import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tabs,
  Tab,
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Wallet, 
  Info, 
  CheckCircle, 
  AccountBalanceWallet,
  HelpOutline,
  ErrorOutline,
  Link as LinkIcon
} from '@mui/icons-material';
import { SiBitcoin } from 'react-icons/si';
import { FaEthereum, FaWallet, FaCreditCard } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

// Web3 wallet connection types
export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase'
}

// Supported networks
export enum NetworkType {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon'
}

// Connection status
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

interface WalletState {
  type: WalletType | null;
  status: ConnectionStatus;
  address: string | null;
  network: NetworkType | null;
  balance: string | null;
  chainId: number | null;
  error: string | null;
}

interface ConnectWalletButtonProps {
  onWalletConnected?: (walletState: WalletState) => void;
  buttonText?: string;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onWalletConnected,
  buttonText = 'Connect Wallet',
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  size = 'medium'
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [walletState, setWalletState] = useState<WalletState>({
    type: null,
    status: ConnectionStatus.DISCONNECTED,
    address: null,
    network: null,
    balance: null,
    chainId: null,
    error: null
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if MetaMask is already connected
    const checkExistingConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const network = getNetworkFromChainId(parseInt(chainId, 16));
            
            setWalletState({
              type: WalletType.METAMASK,
              status: ConnectionStatus.CONNECTED,
              address: accounts[0],
              network,
              chainId: parseInt(chainId, 16),
              balance: await getBalance(accounts[0]),
              error: null
            });
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      }
    };

    checkExistingConnection();

    // Listen for account and chain changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      // Clean up listeners
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Update parent component when wallet state changes
  useEffect(() => {
    if (walletState.status === ConnectionStatus.CONNECTED && walletState.address) {
      onWalletConnected?.(walletState);
    }
  }, [walletState, onWalletConnected]);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      setWalletState({
        ...walletState,
        status: ConnectionStatus.DISCONNECTED,
        address: null,
        balance: null
      });
    } else {
      // Account changed
      setWalletState({
        ...walletState,
        address: accounts[0],
        balance: await getBalance(accounts[0])
      });
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    const network = getNetworkFromChainId(chainId);
    
    setWalletState({
      ...walletState,
      chainId,
      network
    });
    
    // Force page reload on chain change as recommended by MetaMask
    window.location.reload();
  };

  const getNetworkFromChainId = (chainId: number): NetworkType | null => {
    // Ethereum mainnet
    if (chainId === 1) return NetworkType.ETHEREUM;
    // Polygon mainnet
    if (chainId === 137) return NetworkType.POLYGON;
    // Ethereum testnet (Rinkeby)
    if (chainId === 4) return NetworkType.ETHEREUM;
    // Polygon testnet (Mumbai)
    if (chainId === 80001) return NetworkType.POLYGON;
    
    return null;
  };

  const getBalance = async (address: string): Promise<string> => {
    if (!window.ethereum) return '0';
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert from wei to ETH
      const ethBalance = parseInt(balance, 16) / 1e18;
      return ethBalance.toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  const connectMetaMask = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      setWalletState({
        ...walletState,
        status: ConnectionStatus.ERROR,
        error: 'MetaMask is not installed. Please install MetaMask to connect.'
      });
      return;
    }

    try {
      setWalletState({
        ...walletState,
        status: ConnectionStatus.CONNECTING,
        type: WalletType.METAMASK
      });

      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const network = getNetworkFromChainId(parseInt(chainId, 16));
      const balance = await getBalance(accounts[0]);

      setWalletState({
        type: WalletType.METAMASK,
        status: ConnectionStatus.CONNECTED,
        address: accounts[0],
        network,
        chainId: parseInt(chainId, 16),
        balance,
        error: null
      });

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${accounts[0].substring(0, 8)}...${accounts[0].substring(36)}`,
        variant: 'default'
      });

      // Close dialog after successful connection
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      setWalletState({
        ...walletState,
        status: ConnectionStatus.ERROR,
        error: error.message || 'Failed to connect to MetaMask'
      });
    }
  };

  const connectWalletConnect = async () => {
    try {
      setWalletState({
        ...walletState,
        status: ConnectionStatus.CONNECTING,
        type: WalletType.WALLET_CONNECT
      });

      // In a real implementation, you'd import and use WalletConnect:
      // const provider = new WalletConnectProvider({
      //   infuraId: "YOUR_INFURA_ID",
      // });
      // await provider.enable();

      // For now, show coming soon message
      setWalletState({
        ...walletState,
        status: ConnectionStatus.ERROR,
        error: 'WalletConnect integration coming soon!'
      });
    } catch (error: any) {
      console.error('Error connecting with WalletConnect:', error);
      setWalletState({
        ...walletState,
        status: ConnectionStatus.ERROR,
        error: error.message || 'Failed to connect with WalletConnect'
      });
    }
  };

  const connectCoinbaseWallet = async () => {
    try {
      setWalletState({
        ...walletState,
        status: ConnectionStatus.CONNECTING,
        type: WalletType.COINBASE
      });

      // In a real implementation, you'd import and use Coinbase Wallet SDK:
      // const coinbaseWallet = new CoinbaseWalletSDK({
      //   appName: "iREVA",
      //   appLogoUrl: "YOUR_APP_LOGO_URL"
      // });
      // const ethereum = coinbaseWallet.makeWeb3Provider();
      // await ethereum.request({ method: 'eth_requestAccounts' });

      // For now, show coming soon message
      setWalletState({
        ...walletState,
        status: ConnectionStatus.ERROR,
        error: 'Coinbase Wallet integration coming soon!'
      });
    } catch (error: any) {
      console.error('Error connecting to Coinbase Wallet:', error);
      setWalletState({
        ...walletState,
        status: ConnectionStatus.ERROR,
        error: error.message || 'Failed to connect to Coinbase Wallet'
      });
    }
  };

  const disconnectWallet = async () => {
    // Note: MetaMask doesn't support programmatic disconnection
    // We just clear the local state
    setWalletState({
      type: null,
      status: ConnectionStatus.DISCONNECTED,
      address: null,
      network: null,
      balance: null,
      chainId: null,
      error: null
    });

    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
      variant: 'default'
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <>
      {/* Main button */}
      {walletState.status === ConnectionStatus.CONNECTED && walletState.address ? (
        <Button
          variant={variant}
          color={color}
          fullWidth={fullWidth}
          size={size}
          startIcon={<Wallet />}
          onClick={() => setDialogOpen(true)}
        >
          {walletState.address.substring(0, 6)}...{walletState.address.substring(38)}
        </Button>
      ) : (
        <Button
          variant={variant}
          color={color}
          fullWidth={fullWidth}
          size={size}
          startIcon={<Wallet />}
          onClick={() => setDialogOpen(true)}
        >
          {buttonText}
        </Button>
      )}

      {/* Connection dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {walletState.status === ConnectionStatus.CONNECTED
                ? 'Wallet Connected'
                : 'Connect Your Wallet'}
            </Typography>
            {walletState.status === ConnectionStatus.CONNECTED && (
              <Chip 
                label={walletState.network || 'Unknown Network'} 
                color="success" 
                size="small"
                icon={<CheckCircle />}
              />
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {walletState.status === ConnectionStatus.CONNECTED && walletState.address ? (
            // Connected wallet view
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Wallet Details</Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AccountBalanceWallet /></ListItemIcon>
                      <ListItemText 
                        primary="Address" 
                        secondary={`${walletState.address.substring(0, 12)}...${walletState.address.substring(32)}`}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon><LinkIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Network" 
                        secondary={walletState.network || 'Unknown'}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon><Wallet /></ListItemIcon>
                      <ListItemText 
                        primary="Balance" 
                        secondary={`${walletState.balance || '0'} ${walletState.network === NetworkType.ETHEREUM ? 'ETH' : 'MATIC'}`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Connected with {walletState.type}</AlertTitle>
                Your wallet is connected and ready to transact. You can now make crypto payments for property investments.
              </Alert>
            </Box>
          ) : (
            // Connect wallet view
            <Box>
              <Tabs 
                value={tabIndex} 
                onChange={handleTabChange} 
                indicatorColor="primary" 
                textColor="primary" 
                centered
                sx={{ mb: 3 }}
              >
                <Tab label="Beginner's Guide" />
                <Tab label="Technical Setup" />
              </Tabs>
              
              {tabIndex === 0 ? (
                // Beginner's guide
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <AlertTitle>What is a Crypto Wallet?</AlertTitle>
                    A crypto wallet is a digital tool that allows you to securely store and manage your cryptocurrency.
                    It's needed to make crypto payments on our platform.
                  </Alert>
                  
                  <Typography variant="subtitle1" gutterBottom>Follow these simple steps:</Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Step 1: Install a wallet (MetaMask is recommended for beginners)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Step 2: Set up your wallet and create a password" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Step 3: Securely save your recovery phrase" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Step 4: Connect your wallet below" />
                    </ListItem>
                  </List>
                  
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <AlertTitle>Important Safety Tips</AlertTitle>
                    <Typography variant="body2">
                      • Never share your recovery phrase with anyone.<br />
                      • Beware of phishing attempts.<br />
                      • Keep your wallet software updated.
                    </Typography>
                  </Alert>
                </Box>
              ) : (
                // Technical setup
                <Box>
                  {walletState.status === ConnectionStatus.ERROR && walletState.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <AlertTitle>Connection Error</AlertTitle>
                      {walletState.error}
                    </Alert>
                  )}
                  
                  {walletState.status === ConnectionStatus.CONNECTING && (
                    <Box display="flex" justifyContent="center" my={3}>
                      <CircularProgress />
                    </Box>
                  )}
                  
                  <Typography variant="subtitle1" gutterBottom>Select a wallet provider:</Typography>
                  
                  <Card onClick={connectMetaMask} sx={{ mb: 2, cursor: 'pointer', bgcolor: walletState.type === WalletType.METAMASK ? 'action.selected' : 'background.paper' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <Box mr={2}>
                          <FaEthereum size={40} />
                        </Box>
                        <Box>
                          <Typography variant="h6">MetaMask</Typography>
                          <Typography variant="body2" color="textSecondary">
                            The most popular Ethereum wallet
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card onClick={connectWalletConnect} sx={{ mb: 2, cursor: 'pointer', bgcolor: walletState.type === WalletType.WALLET_CONNECT ? 'action.selected' : 'background.paper' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <Box mr={2}>
                          <FaWallet size={40} />
                        </Box>
                        <Box>
                          <Typography variant="h6">WalletConnect</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Connect via QR code (Coming Soon)
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card onClick={connectCoinbaseWallet} sx={{ mb: 2, cursor: 'pointer', bgcolor: walletState.type === WalletType.COINBASE ? 'action.selected' : 'background.paper' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <Box mr={2}>
                          <SiBitcoin size={40} />
                        </Box>
                        <Box>
                          <Typography variant="h6">Coinbase Wallet</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Connect with Coinbase Wallet (Coming Soon)
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
                    <HelpOutline fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      Don't have a wallet? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Download MetaMask</a>
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          {walletState.status === ConnectionStatus.CONNECTED ? (
            <Button onClick={disconnectWallet} color="error">
              Disconnect Wallet
            </Button>
          ) : (
            <Button onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConnectWalletButton;

// Add window.ethereum type to fix TypeScript errors
declare global {
  interface Window {
    ethereum?: any;
  }
}