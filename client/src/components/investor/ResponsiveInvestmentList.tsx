import React from 'react';
import { 
  useMediaQuery, 
  useTheme, 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Button
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import InvestmentHistoryCard from './InvestmentHistoryCard';

// Sample investment data
const investmentData = [
  {
    id: 1,
    name: "Lagos Heights",
    location: "Lagos",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    type: "residential",
    targetReturn: "14.5",
    term: 60,
    totalFunding: 850000000,
    currentFunding: 645000000,
    investmentDate: "Jan 15, 2025",
    investmentAmount: 500000,
    returnPaid: 72500,
    nextPaymentDate: "May 15, 2025",
  },
  {
    id: 2,
    name: "Westfield Retail Center",
    location: "Lagos",
    imageUrl: "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    type: "commercial",
    targetReturn: "9.8",
    term: 60,
    totalFunding: 900000000,
    currentFunding: 740000000,
    investmentDate: "Feb 3, 2025",
    investmentAmount: 250000,
    returnPaid: 24500,
    nextPaymentDate: "May 3, 2025",
  },
  {
    id: 3,
    name: "Green Energy Industrial Park",
    location: "Port Harcourt",
    imageUrl: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    type: "industrial",
    targetReturn: "12.2",
    term: 48,
    totalFunding: 1200000000,
    currentFunding: 950000000,
    investmentDate: "Mar 22, 2025",
    investmentAmount: 750000,
    returnPaid: 30500,
    nextPaymentDate: "Jun 22, 2025",
  }
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);
};

const ResponsiveInvestmentList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleViewDetails = (id: number) => {
    console.log(`View details for investment ${id}`);
    // Navigation logic would go here
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
        Your Investments
      </Typography>
      
      {isMobile ? (
        // Mobile view - cards
        <Box>
          {investmentData.map((investment) => (
            <InvestmentHistoryCard 
              key={investment.id}
              property={investment}
              onClick={handleViewDetails}
            />
          ))}
        </Box>
      ) : (
        // Desktop view - table
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: theme.palette.primary.light,
              }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Investment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Term</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Return</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Paid</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Next Payment</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investmentData.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box 
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: 1, 
                          backgroundImage: `url(${investment.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }} 
                      />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">{investment.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{investment.location}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatCurrency(investment.investmentAmount)}</TableCell>
                  <TableCell>{investment.investmentDate}</TableCell>
                  <TableCell>{investment.term} months</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${investment.targetReturn}%`} 
                      color="success" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(investment.returnPaid)}</TableCell>
                  <TableCell>{investment.nextPaymentDate}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForward />}
                      onClick={() => handleViewDetails(investment.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ResponsiveInvestmentList;