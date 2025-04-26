import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Avatar,
  Divider,
  Button,
  useTheme
} from '@mui/material';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Investment } from '@shared/schema';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface InvestmentHistoryCardProps {
  investment: Investment;
  onViewDetails?: (id: string) => void;
}

export default function InvestmentHistoryCard({ 
  investment,
  onViewDetails
}: InvestmentHistoryCardProps) {
  const theme = useTheme();
  
  // Status chip appearance based on investment status
  const getStatusChip = (status: string) => {
    const statusConfig = {
      active: {
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
        label: 'Active'
      },
      pending: {
        icon: <HourglassEmptyIcon fontSize="small" />,
        color: 'warning',
        label: 'Pending'
      },
      completed: {
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'primary',
        label: 'Completed'
      },
      cancelled: {
        icon: <WarningIcon fontSize="small" />,
        color: 'error',
        label: 'Cancelled'
      },
      refunded: {
        icon: <WarningIcon fontSize="small" />,
        color: 'error',
        label: 'Refunded'
      }
    };
    
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    
    return (
      <Chip 
        icon={config.icon}
        label={config.label}
        color={config.color as any}
        size="small"
        sx={{ fontWeight: 'medium' }}
      />
    );
  };
  
  const handleViewDetailsClick = () => {
    if (onViewDetails && investment.id) {
      onViewDetails(investment.id.toString());
    }
  };
  
  return (
    <Card 
      sx={{ 
        marginBottom: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        // Add subtle border
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header with property name and status */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {investment.property?.name || 'Property Investment'}
          </Typography>
          {getStatusChip(investment.status || 'pending')}
        </Box>
        
        {/* Main content */}
        <Box sx={{ p: 2 }}>
          {/* Investment amount */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            gap: 1
          }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.light,
                width: 32,
                height: 32
              }}
            >
              <AccountBalanceIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Investment Amount
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {formatCurrency(Number(investment.totalAmount))}
              </Typography>
            </Box>
          </Box>
          
          {/* Investment units */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            gap: 1
          }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.secondary.light,
                width: 32,
                height: 32
              }}
            >
              <LocalOfferIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Units Invested
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {investment.unitsInvested} {investment.unitsInvested === 1 ? 'Unit' : 'Units'}
              </Typography>
            </Box>
          </Box>
          
          {/* ROI earned */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            gap: 1
          }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.success.light,
                width: 32,
                height: 32
              }}
            >
              <TimelineIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ROI Earned
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="success.main">
                {investment.roiEarned ? formatCurrency(Number(investment.roiEarned)) : 'N/A'}
              </Typography>
            </Box>
          </Box>
          
          {/* Investment date */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 1.5,
            gap: 1
          }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.info.light,
                width: 32,
                height: 32
              }}
            >
              <CalendarTodayIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Investment Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {investment.investedAt ? formatDate(investment.investedAt) : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider />
        
        {/* Footer with view details button */}
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            endIcon={<ArrowForwardIcon />}
            onClick={handleViewDetailsClick}
            sx={{ 
              minHeight: '42px', 
              borderRadius: '8px',
              px: 2,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}