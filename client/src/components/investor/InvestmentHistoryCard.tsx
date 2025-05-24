import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import TouchOptimizedButton from '../ui/TouchOptimizedButton';
import { ArrowForward } from '@mui/icons-material';

interface InvestmentHistoryCardProps {
  property: {
    id: number;
    name: string;
    location: string;
    imageUrl: string;
    type: string;
    targetReturn: string;
    term: number;
    totalFunding: number;
    currentFunding: number;
    investmentDate?: string;
    investmentAmount?: number;
    returnPaid?: number;
    nextPaymentDate?: string;
  };
  onClick?: (id: number) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);
};

const InvestmentHistoryCard: React.FC<InvestmentHistoryCardProps> = ({ property, onClick }) => {
  const theme = useTheme();
  const progress = (property.currentFunding / property.totalFunding) * 100;
  
  const handleClick = () => {
    if (onClick) {
      onClick(property.id);
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.shadows[3]
      }}
    >
      {/* Property image (as a header) */}
      <Box 
        sx={{ 
          position: 'relative',
          height: 140,
          backgroundImage: `url(${property.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            p: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            {property.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            {property.location} • {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {/* Display primary information about the investment */}
        <Box sx={{ mb: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary">Your Investment</Typography>
            <Chip 
              label={`${property.targetReturn}% ROI`} 
              color="success" 
              size="small"
              sx={{ height: 24, fontWeight: 'medium' }}
            />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
            {property.investmentAmount ? formatCurrency(property.investmentAmount) : 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {property.investmentDate ? `Invested on ${property.investmentDate}` : ''}
          </Typography>
        </Box>

        {/* Funding progress */}
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary">
              Funding Progress
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box display="flex" justifyContent="space-between" mt={0.5}>
            <Typography variant="caption" color="text.secondary">
              {formatCurrency(property.currentFunding)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatCurrency(property.totalFunding)}
            </Typography>
          </Box>
        </Box>

        {/* Additional information */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Term</Typography>
            <Typography variant="body1" fontWeight="medium">
              {property.term} months
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Return Paid</Typography>
            <Typography variant="body1" fontWeight="medium">
              {property.returnPaid ? formatCurrency(property.returnPaid) : '₦0'}
            </Typography>
          </Box>
        </Box>

        {/* Action button */}
        <TouchOptimizedButton
          endIcon={<ArrowForward />}
          onClick={handleClick}
          size="medium"
          fullWidth
        >
          View Details
        </TouchOptimizedButton>
      </CardContent>
    </Card>
  );
};

export default InvestmentHistoryCard;