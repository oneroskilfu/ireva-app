import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid as MuiGrid, 
  Button, 
  Divider, 
  Chip, 
  CircularProgress, 
  Alert, 
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Link
} from '@mui/material';
import { 
  ContentCopy, 
  Launch, 
  Share, 
  Download,
  VerifiedUser,
  AccessTime,
  QuestionMark,
  Info
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode.react';
import { SiEthereum } from 'react-icons/si';

// NFT Investment data structure
interface NFTInvestment {
  id: string;
  tokenId: string;
  contractAddress: string;
  network: string;
  propertyId: number;
  propertyName: string;
  investorId: number;
  investorName: string;
  investorAddress: string;
  amount: string;
  units: number;
  mintedAt: Date;
  mintTxHash: string;
  imageUrl: string;
  status: 'minting' | 'minted' | 'claimed' | 'failed';
  metadataUrl?: string;
  description?: string;
  attributes?: NFTAttribute[];
}

// NFT attribute structure
interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// Component props
interface InvestmentProofProps {
  propertyId: number;
  investmentId: string;
  userId: number;
  onSuccess?: () => void;
}

const InvestmentProof: React.FC<InvestmentProofProps> = ({
  propertyId,
  investmentId,
  userId,
  onSuccess
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  
  // Fetch NFT data
  const { data: nft, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/nft/investment-proof', investmentId],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/nft/investment-proof/${investmentId}`);
        return await res.json();
      } catch (error) {
        console.error('Error fetching NFT data:', error);
        throw error;
      }
    }
  });
  
  // Mint NFT
  const mintNFTMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/nft/mint', {
        investmentId,
        propertyId,
        userId
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'NFT Minting Initiated',
        description: 'Your investment proof NFT is being minted on the blockchain',
        variant: 'default'
      });
      refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'NFT Minting Failed',
        description: error.message || 'Failed to mint NFT. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Copy to clipboard
  const copyToClipboard = (text: string, label: string = 'Text') => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
      variant: 'default'
    });
  };
  
  // Format address
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get explorer URL
  const getExplorerUrl = (network: string, txHash: string): string => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txHash}`;
      default:
        return '#';
    }
  };
  
  // Get token explorer URL
  const getTokenExplorerUrl = (network: string, contractAddress: string, tokenId: string): string => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
      case 'polygon':
        return `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;
      default:
        return '#';
    }
  };
  
  // Get status chip details
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'minted':
        return {
          icon: <VerifiedUser fontSize="small" />,
          color: 'success' as const,
          label: 'Minted'
        };
      case 'minting':
        return {
          icon: <AccessTime fontSize="small" />,
          color: 'warning' as const,
          label: 'Minting'
        };
      case 'claimed':
        return {
          icon: <VerifiedUser fontSize="small" />,
          color: 'info' as const,
          label: 'Claimed'
        };
      case 'failed':
        return {
          icon: <Info fontSize="small" />,
          color: 'error' as const,
          label: 'Failed'
        };
      default:
        return {
          icon: <QuestionMark fontSize="small" />,
          color: 'default' as const,
          label: status
        };
    }
  };
  
  // Render NFT metadata
  const renderMetadata = () => {
    if (!nft) return null;
    
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>NFT Metadata</Typography>
        <Box bgcolor="rgba(0,0,0,0.04)" p={2} borderRadius={1} mb={2}>
          <Typography variant="body2" component="div">
            <Box fontWeight="bold" component="span">Token ID: </Box> 
            {nft.tokenId}
          </Typography>
          <Typography variant="body2" component="div" mt={1}>
            <Box fontWeight="bold" component="span">Contract: </Box>
            <Tooltip title="Copy contract address">
              <Box 
                component="span" 
                sx={{ cursor: 'pointer', fontFamily: 'monospace' }}
                onClick={() => copyToClipboard(nft.contractAddress, 'Contract address')}
              >
                {formatAddress(nft.contractAddress)}
              </Box>
            </Tooltip>
          </Typography>
          <Typography variant="body2" component="div" mt={1}>
            <Box fontWeight="bold" component="span">Network: </Box>
            <Chip 
              icon={<SiEthereum />} 
              label={nft.network} 
              size="small" 
              variant="outlined"
            />
          </Typography>
          <Typography variant="body2" component="div" mt={1}>
            <Box fontWeight="bold" component="span">Minted: </Box>
            {new Date(nft.mintedAt).toLocaleString()}
          </Typography>
          {nft.mintTxHash && (
            <Typography variant="body2" component="div" mt={1}>
              <Box fontWeight="bold" component="span">Transaction: </Box>
              <Link 
                href={getExplorerUrl(nft.network, nft.mintTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                {formatAddress(nft.mintTxHash)}
              </Link>
            </Typography>
          )}
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>Investment Details</Typography>
        <Box bgcolor="rgba(0,0,0,0.04)" p={2} borderRadius={1}>
          <Typography variant="body2" component="div">
            <Box fontWeight="bold" component="span">Property: </Box>
            {nft.propertyName}
          </Typography>
          <Typography variant="body2" component="div" mt={1}>
            <Box fontWeight="bold" component="span">Investment: </Box>
            {nft.amount}
          </Typography>
          <Typography variant="body2" component="div" mt={1}>
            <Box fontWeight="bold" component="span">Units: </Box>
            {nft.units}
          </Typography>
          <Typography variant="body2" component="div" mt={1}>
            <Box fontWeight="bold" component="span">Investor: </Box>
            {nft.investorName}
          </Typography>
        </Box>
      </Box>
    );
  };
  
  // Render share dialog
  const renderShareDialog = () => {
    if (!nft) return null;
    
    const shareUrl = nft.metadataUrl || getTokenExplorerUrl(nft.network, nft.contractAddress, nft.tokenId);
    
    return (
      <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Your Investment NFT</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mt={2} mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Property: {nft.propertyName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Scan this QR code to view the NFT details
            </Typography>
            <Box mt={2} p={2} bgcolor="white" borderRadius={1}>
              <QRCode value={shareUrl} size={200} />
            </Box>
          </Box>
          
          <Box bgcolor="rgba(0,0,0,0.04)" p={2} borderRadius={1} mb={2} display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {shareUrl}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(shareUrl, 'NFT URL')}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Share this link with others to show proof of your investment in {nft.propertyName}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render details dialog
  const renderDetailsDialog = () => {
    if (!nft) return null;
    
    return (
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>NFT Investment Proof Details</DialogTitle>
        <DialogContent>
          <MuiGrid container spacing={3}>
            <MuiGrid item xs={12} md={6}>
              <Box 
                component="img" 
                src={nft.imageUrl} 
                alt={`NFT for ${nft.propertyName}`}
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 1,
                  boxShadow: 1
                }}
              />
            </MuiGrid>
            <MuiGrid item xs={12} md={6}>
              {renderMetadata()}
            </MuiGrid>
          </MuiGrid>
          
          {nft.attributes && nft.attributes.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>NFT Attributes</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {nft.attributes.map((attr, index) => (
                  <Chip 
                    key={index}
                    label={`${attr.trait_type}: ${attr.value}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {nft.description && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>Description</Typography>
              <Typography variant="body2">
                {nft.description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="outlined"
            startIcon={<Launch />}
            href={getTokenExplorerUrl(nft.network, nft.contractAddress, nft.tokenId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on OpenSea
          </Button>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load NFT investment proof data. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // If NFT doesn't exist yet, show minting option
  if (!nft) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>NFT Investment Proof</Typography>
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mint a digital NFT certificate as proof of your investment in this property.
              This NFT can be viewed in any NFT wallet and shared with others.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => mintNFTMutation.mutate()}
            disabled={mintNFTMutation.isPending}
            startIcon={mintNFTMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {mintNFTMutation.isPending ? 'Minting...' : 'Mint NFT Investment Proof'}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Show existing NFT
  const statusChip = getStatusChip(nft.status);
  const isActionable = nft.status === 'minted' || nft.status === 'claimed';
  
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">NFT Investment Proof</Typography>
          <Chip 
            icon={statusChip.icon}
            label={statusChip.label}
            color={statusChip.color}
            size="small"
          />
        </Box>
        
        <MuiGrid container spacing={3}>
          <MuiGrid item xs={12} sm={4}>
            {nft.imageUrl ? (
              <Box 
                component="img" 
                src={nft.imageUrl} 
                alt={`NFT for ${nft.propertyName}`}
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 1,
                  cursor: 'pointer',
                  boxShadow: 1,
                  '&:hover': { opacity: 0.9 }
                }}
                onClick={() => setShowDetailsDialog(true)}
              />
            ) : (
              <Skeleton variant="rectangular" width="100%" height={200} />
            )}
          </MuiGrid>
          
          <MuiGrid item xs={12} sm={8}>
            <Typography variant="subtitle1" gutterBottom>
              {nft.propertyName} - Investment Certificate
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              This NFT represents your investment of {nft.amount} in {nft.propertyName}.
              It can be used as digital proof of ownership and investment participation.
            </Typography>
            
            <Box mt={2} mb={2}>
              <Typography variant="body2" component="div">
                <Box fontWeight="bold" component="span">Token ID: </Box> 
                {formatAddress(nft.tokenId)}
              </Typography>
              
              <Typography variant="body2" component="div" mt={0.5}>
                <Box fontWeight="bold" component="span">Network: </Box>
                {nft.network}
              </Typography>
              
              <Typography variant="body2" component="div" mt={0.5}>
                <Box fontWeight="bold" component="span">Minted: </Box>
                {new Date(nft.mintedAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            {nft.status === 'minting' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Your NFT is currently being minted on the blockchain. This process may take a few minutes.
              </Alert>
            )}
            
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Info />}
                onClick={() => setShowDetailsDialog(true)}
              >
                View Details
              </Button>
              
              {isActionable && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Share />}
                    onClick={() => setShowShareDialog(true)}
                  >
                    Share
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Launch />}
                    href={getTokenExplorerUrl(nft.network, nft.contractAddress, nft.tokenId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on OpenSea
                  </Button>
                </>
              )}
            </Box>
          </MuiGrid>
        </MuiGrid>
      </CardContent>
      
      {/* Dialogs */}
      {renderShareDialog()}
      {renderDetailsDialog()}
    </Card>
  );
};

export default InvestmentProof;