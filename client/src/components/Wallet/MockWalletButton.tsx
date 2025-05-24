import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

/**
 * MOCK WALLET BUTTON - FOR DEVELOPMENT USE ONLY
 * This component simulates a wallet connection for development purposes.
 * It should NEVER be used in production.
 */

type NetworkType = 'ethereum' | 'polygon' | 'binance';

interface MockWalletButtonProps {
  onWalletConnected?: (address: string, network: NetworkType) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const MockWalletButton: React.FC<MockWalletButtonProps> = ({
  onWalletConnected,
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mockAddress, setMockAddress] = useState('0x1234567890123456789012345678901234567890');
  const [mockNetwork, setMockNetwork] = useState<NetworkType>('ethereum');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onWalletConnected) {
        onWalletConnected(mockAddress, mockNetwork);
      }
      
      // Send wallet info to backend
      try {
        await apiRequest('POST', '/api/crypto/wallet', {
          address: mockAddress,
          network: mockNetwork
        });
      } catch (error) {
        console.error('Error saving mock wallet connection:', error);
      }
      
      toast({
        title: 'Mock Wallet Connected',
        description: `Successfully connected to address ${mockAddress.substring(0, 6)}...${mockAddress.substring(mockAddress.length - 4)} on ${mockNetwork}`,
        variant: 'default',
      });
      
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect mock wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} bg-yellow-600 hover:bg-yellow-700 text-white`}
        onClick={() => setIsDialogOpen(true)}
      >
        Connect Mock Wallet (Dev Only)
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Mock Wallet</DialogTitle>
            <DialogDescription>
              FOR DEVELOPMENT USE ONLY. This simulates connecting a cryptocurrency wallet without requiring MetaMask.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Wallet Address
              </Label>
              <Input
                id="address"
                value={mockAddress}
                onChange={(e) => setMockAddress(e.target.value)}
                className="col-span-3"
                placeholder="0x1234..."
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network" className="text-right">
                Network
              </Label>
              <select
                id="network"
                value={mockNetwork}
                onChange={(e) => setMockNetwork(e.target.value as NetworkType)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="binance">Binance Smart Chain</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MockWalletButton;