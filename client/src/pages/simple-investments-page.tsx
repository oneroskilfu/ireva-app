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
  Chip,
  CircularProgress,
  styled
} from '@mui/material';
import { getUserInvestments, Investment } from '../api/investmentService';

const SimpleInvestmentsPage: React.FC = () => {
  const [investments, setInvestments] = React.useState<Investment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const data = await getUserInvestments();
        setInvestments(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch investments:', err);
        setError('Failed to load investments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ my: 4, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      Total Invested
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(investments.reduce((sum, inv) => sum + inv.amount, 0))}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      Total Returns
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(investments.reduce((sum, inv) => sum + inv.returns, 0))}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      Active Investments
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {investments.filter(inv => inv.status === 'active').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {investments.length === 0 ? (
            <Box sx={{ my: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="h6">You have no investments yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Browse our properties and make your first investment to get started
              </Typography>
            </Box>
          ) : (
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
                  {investments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell>{investment.property?.name || `Property #${investment.propertyId}`}</TableCell>
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
          )}
        </>
      )}
    </SimpleLayout>
  );
};

export default SimpleInvestmentsPage;