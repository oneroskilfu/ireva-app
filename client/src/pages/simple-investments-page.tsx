import * as React from 'react';
import SimpleLayout from '../components/layout/SimpleLayout';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

interface Investment {
  id: number;
  property: string;
  amount: number;
  date: string;
  status: 'active' | 'pending' | 'completed';
  returns: number;
}

const mockInvestments: Investment[] = [
  {
    id: 1,
    property: 'Lagos Waterfront Apartments',
    amount: 2000000,
    date: '2023-01-15',
    status: 'active',
    returns: 280000
  },
  {
    id: 2,
    property: 'Abuja Heights Complex',
    amount: 1500000,
    date: '2023-02-22',
    status: 'active',
    returns: 187500
  },
  {
    id: 3,
    property: 'Lekki Phase 1 Commercial Center',
    amount: 3000000,
    date: '2023-03-10',
    status: 'pending',
    returns: 0
  }
];

const SimpleInvestmentsPage: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <SimpleLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Investments
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          View and manage your real estate investments
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Total Invested
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(mockInvestments.reduce((sum, inv) => sum + inv.amount, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Total Returns
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(mockInvestments.reduce((sum, inv) => sum + inv.returns, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Active Investments
              </Typography>
              <Typography variant="h4" color="primary">
                {mockInvestments.filter(inv => inv.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Returns</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockInvestments.map((investment) => (
              <TableRow key={investment.id}>
                <TableCell>{investment.property}</TableCell>
                <TableCell>{formatCurrency(investment.amount)}</TableCell>
                <TableCell>{new Date(investment.date).toLocaleDateString('en-NG')}</TableCell>
                <TableCell>
                  <Chip 
                    label={investment.status.charAt(0).toUpperCase() + investment.status.slice(1)} 
                    color={getStatusColor(investment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatCurrency(investment.returns)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SimpleLayout>
  );
};

export default SimpleInvestmentsPage;