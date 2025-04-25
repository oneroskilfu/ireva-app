import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  Tooltip, 
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';

const CryptoWalletAddressDisplay = ({ 
  walletAddress, 
  currency, 
  amount, 
  qrCodeUrl,
  expiresAt,
  onCopyAddress,
  onDownloadQR,
  isLoading
}) => {
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleCopyClick = () => {
    if (walletAddress && onCopyAddress) {
      onCopyAddress();
    } else {
      navigator.clipboard.writeText(walletAddress);
    }
    setShowCopyNotification(true);
  };

  // Calculate remaining time if expiresAt is provided
  const getRemainingTime = () => {
    if (!expiresAt) return null;
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry - now;
    
    // If expired already
    if (diffMs <= 0) return "Expired";
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m remaining`;
    }
    return `${diffMins}m remaining`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 500, mx: 'auto', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Deposit {amount} {currency}
      </Typography>
      
      <Box sx={{ my: 2, textAlign: 'center' }}>
        {qrCodeUrl ? (
          <Box 
            component="img" 
            src={qrCodeUrl} 
            alt={`QR code for ${walletAddress}`}
            sx={{ 
              maxWidth: 200, 
              maxHeight: 200, 
              mx: 'auto', 
              display: 'block',
              border: '1px solid #eee',
              borderRadius: 1,
              p: 1
            }}
          />
        ) : (
          <Box sx={{ 
            p: 4, 
            bgcolor: '#f5f5f5', 
            borderRadius: 1, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            <QrCodeIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              QR Code will appear here
            </Typography>
          </Box>
        )}
      </Box>
      
      <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
        Send to this {currency} address:
      </Typography>
      
      <Box sx={{ 
        bgcolor: '#f9f9f9', 
        p: 2, 
        borderRadius: 1, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        wordBreak: 'break-all'
      }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mr: 1 }}>
          {walletAddress || 'Wallet address will appear here'}
        </Typography>
        
        <Tooltip title="Copy address">
          <Button 
            onClick={handleCopyClick}
            disabled={!walletAddress}
            size="small"
            sx={{ minWidth: 'auto' }}
          >
            <ContentCopyIcon fontSize="small" />
          </Button>
        </Tooltip>
      </Box>
      
      {expiresAt && (
        <Typography variant="caption" color={getRemainingTime() === "Expired" ? "error" : "text.secondary"} sx={{ display: 'block', mb: 2 }}>
          {getRemainingTime()}
        </Typography>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Important information:
        </Typography>
        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
          <li>
            <Typography variant="body2" color="text.secondary">
              Send only {currency} to this address.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              Deposit will be credited after blockchain confirmation.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              Minimum deposit: {currency === 'BTC' ? '0.0001 BTC' : currency === 'ETH' ? '0.01 ETH' : '10 USDT'}
            </Typography>
          </li>
        </ul>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          onClick={onDownloadQR}
          disabled={!qrCodeUrl}
        >
          Download QR Code
        </Button>
      </Box>
      
      <Snackbar
        open={showCopyNotification}
        autoHideDuration={3000}
        onClose={() => setShowCopyNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowCopyNotification(false)} severity="success" sx={{ width: '100%' }}>
          Address copied to clipboard!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CryptoWalletAddressDisplay;