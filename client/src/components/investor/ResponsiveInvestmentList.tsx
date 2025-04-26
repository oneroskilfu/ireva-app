import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Badge,
  Box,
  useMediaQuery,
  Chip,
  Grid
} from '@mui/material';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Investment } from '@shared/schema';
import { CalendarClock, TrendingUp, BadgeCheck, AlertTriangle } from 'lucide-react';

interface ResponsiveInvestmentListProps {
  investments: Investment[];
  loading?: boolean;
}

export default function ResponsiveInvestmentList({ investments, loading = false }: ResponsiveInvestmentListProps) {
  const isMobile = useMediaQuery('(max-width:768px)');
  
  const getStatusBadge = (status: string) => {
    const statusColor = {
      active: 'success',
      completed: 'primary',
      cancelled: 'error',
      refunded: 'warning',
      pending: 'secondary'
    };
    
    const statusIcon = {
      active: <TrendingUp size={16} />,
      completed: <BadgeCheck size={16} />,
      cancelled: <AlertTriangle size={16} />,
      refunded: <AlertTriangle size={16} />,
      pending: <CalendarClock size={16} />
    };
    
    // @ts-ignore - The type system doesn't know our mapping
    return <Chip color={statusColor[status] || 'default'} 
      icon={statusIcon[status]} 
      label={status.charAt(0).toUpperCase() + status.slice(1)} 
      size="small" />;
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading investments...</Typography>
      </Box>
    );
  }
  
  if (!investments || investments.length === 0) {
    return (
      <Card sx={{ p: 2, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="body1" color="textSecondary">
            You don't have any investments yet.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Start investing to grow your portfolio.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  if (isMobile) {
    return (
      <Grid container spacing={2}>
        {investments.map((investment) => (
          <Grid item xs={12} key={investment.id}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {investment.property?.name || 'Property Investment'}
                  </Typography>
                  {getStatusBadge(investment.status || 'pending')}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">Amount</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(Number(investment.totalAmount))}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">ROI Earned</Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    {investment.roiEarned ? formatCurrency(Number(investment.roiEarned)) : 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">Units</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {investment.unitsInvested}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Date</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {investment.investedAt ? formatDate(investment.investedAt) : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
  
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Property</strong></TableCell>
            <TableCell><strong>Amount</strong></TableCell>
            <TableCell><strong>Units</strong></TableCell>
            <TableCell><strong>ROI Earned</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {investments.map((investment) => (
            <TableRow key={investment.id}>
              <TableCell>{investment.property?.name || 'Property Investment'}</TableCell>
              <TableCell>{formatCurrency(Number(investment.totalAmount))}</TableCell>
              <TableCell>{investment.unitsInvested}</TableCell>
              <TableCell sx={{ color: 'success.main' }}>
                {investment.roiEarned ? formatCurrency(Number(investment.roiEarned)) : 'N/A'}
              </TableCell>
              <TableCell>{investment.investedAt ? formatDate(investment.investedAt) : 'N/A'}</TableCell>
              <TableCell>{getStatusBadge(investment.status || 'pending')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}