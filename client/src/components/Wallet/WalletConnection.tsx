import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ConnectWalletButton from './ConnectWalletButton';
import { 
  Wallet, 
  ArrowDownUp, 
  RefreshCw, 
  Shield, 
  Clock, 
  ExternalLink,
  Check,
  XCircle,
  BarChart4
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type NetworkType = 'ethereum' | 'polygon' | 'binance';

interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive' | 'invest' | 'withdraw';
  amount: string;
  date: string;
  status: 'pending' | 'confirmed' | 'failed';
  propertyId?: number;
  propertyName?: string;
}

interface WalletConnectionProps {
  onWalletConnected?: (address: string, network: NetworkType) => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onWalletConnected }) => {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkType>('ethereum');
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions();
    }
  }, [walletAddress, network]);

  const handleWalletConnected = (address: string, networkType: NetworkType) => {
    setWalletAddress(address);
    setNetwork(networkType);
    
    if (onWalletConnected) {
      onWalletConnected(address, networkType);
    }
  };

  const fetchTransactions = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', `/api/crypto/transactions?address=${walletAddress}&network=${network}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchTransactions();
      toast({
        title: 'Refreshed',
        description: 'Wallet data has been updated',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowDownUp className="h-4 w-4 text-orange-500 transform rotate-45" />;
      case 'receive':
        return <ArrowDownUp className="h-4 w-4 text-green-500 transform -rotate-45" />;
      case 'invest':
        return <BarChart4 className="h-4 w-4 text-blue-500" />;
      case 'withdraw':
        return <ArrowDownUp className="h-4 w-4 text-purple-500" />;
      default:
        return <ArrowDownUp className="h-4 w-4" />;
    }
  };

  const openTransactionExplorer = (hash: string) => {
    if (!hash) return;
    
    let url = '';
    switch (network) {
      case 'ethereum':
        url = `https://etherscan.io/tx/${hash}`;
        break;
      case 'polygon':
        url = `https://polygonscan.com/tx/${hash}`;
        break;
      case 'binance':
        url = `https://bscscan.com/tx/${hash}`;
        break;
      default:
        url = `https://etherscan.io/tx/${hash}`;
    }
    window.open(url, '_blank');
  };

  const getNetworkIcon = () => {
    switch (network) {
      case 'ethereum':
        return (
          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
          </svg>
        );
      case 'polygon':
        return (
          <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.629 0 12 0ZM5.92 14.604l2.09-2.082 2.075 2.082-2.09 2.082-2.075-2.082Zm5.348-5.348-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Zm0 10.695L9.18 17.866l8.266-8.266 2.09 2.082-8.266 8.266v.003Zm9.181-9.18-2.09 2.082-2.075-2.082 2.09-2.082 2.075 2.082Z" />
          </svg>
        );
      case 'binance':
        return (
          <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6365 4.6355-4.6375zm0-9.4862l2.7175 2.7164-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6365 4.6355-4.6375zm-4.6365-4.4094l-11.9885 11.988 2.7175 2.7164 9.271-9.2699 9.271 9.2699 2.7175-2.7164-11.9885-11.988z" />
          </svg>
        );
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getCurrencySymbol = () => {
    switch (network) {
      case 'ethereum':
        return 'ETH';
      case 'polygon':
        return 'MATIC';
      case 'binance':
        return 'BNB';
      default:
        return 'ETH';
    }
  };

  const TransactionsList = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Once you start using your wallet with iREVA, your transactions will appear here.
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                    {getTransactionTypeIcon(tx.type)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{tx.type}</div>
                    {tx.propertyName && (
                      <div className="text-xs text-muted-foreground">{tx.propertyName}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className={`font-medium ${tx.type === 'receive' || tx.type === 'withdraw' ? 'text-green-600' : ''}`}>
                  {tx.type === 'receive' || tx.type === 'withdraw' ? '+' : ''}{tx.amount} {getCurrencySymbol()}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatDate(tx.date)}</div>
              </TableCell>
              <TableCell>
                {getTransactionStatusBadge(tx.status)}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => openTransactionExplorer(tx.hash)}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>Connect your crypto wallet to invest in properties</CardDescription>
      </CardHeader>
      <CardContent>
        {!walletAddress ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 space-y-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-medium">Connect Your Wallet</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Connect your crypto wallet to view your balance, track transactions, and invest in properties.
              </p>
            </div>
            <ConnectWalletButton 
              onWalletConnected={handleWalletConnected}
              variant="default"
              size="lg"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-full">
                  {getNetworkIcon()}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Connected Wallet</p>
                  <p className="font-mono text-sm truncate max-w-[200px] sm:max-w-[300px]">
                    {walletAddress}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:items-end">
                <p className="text-sm text-muted-foreground">Balance</p>
                <div className="flex items-center">
                  {balance ? (
                    <p className="text-xl font-semibold">{balance} {getCurrencySymbol()}</p>
                  ) : (
                    <Skeleton className="h-7 w-24" />
                  )}
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
                <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {balance ? balance : '0.00'} {getCurrencySymbol()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Available for investments
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">0.00 {getCurrencySymbol()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Across all properties
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">0.00 {getCurrencySymbol()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned from investments
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Recent Transactions</CardTitle>
                        <Button variant="ghost" size="sm" onClick={refreshData} disabled={isRefreshing}>
                          {isRefreshing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {TransactionsList()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions" className="pt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Transaction History</CardTitle>
                      <Button variant="ghost" size="sm" onClick={refreshData} disabled={isRefreshing}>
                        {isRefreshing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {TransactionsList()}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Wallet Security</CardTitle>
                    <CardDescription>
                      Review your wallet security status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-500/10 p-1 rounded-full">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Connection Secure</h4>
                          <p className="text-sm text-muted-foreground">
                            Your wallet is securely connected to iREVA using encrypted methods.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-500/10 p-1 rounded-full">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Transaction Signing</h4>
                          <p className="text-sm text-muted-foreground">
                            All transactions require your explicit approval via your wallet.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-yellow-500/10 p-1 rounded-full">
                          <Shield className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Security Recommendations</h4>
                          <p className="text-sm text-muted-foreground">
                            Never share your wallet seed phrase or private keys with anyone, including iREVA support.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg mt-6">
                        <h3 className="text-sm font-medium mb-2">Smart Contract Interactions</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          When investing in properties, you'll interact with verified smart contracts that handle the transaction securely on the blockchain.
                        </p>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          All smart contracts are verified and audited for security
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      {walletAddress && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {walletAddress ? 'Wallet connected successfully' : 'Connect your wallet to continue'}
          </p>
          <ConnectWalletButton 
            onWalletConnected={handleWalletConnected}
            variant="secondary"
            size="sm"
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default WalletConnection;