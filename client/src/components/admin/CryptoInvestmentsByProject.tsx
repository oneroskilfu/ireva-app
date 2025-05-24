import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip
} from '@mui/material';
import axios from 'axios';

interface CryptoProjectSummary {
  propertyId: number;
  propertyName: string;
  totalInvested: string;
  transactionCount: number;
  currencies: Array<{
    currency: string;
    amount: string;
  }>;
}

export default function CryptoInvestmentsByProject() {
  const [data, setData] = useState<CryptoProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with the actual API endpoint when available
        const response = await axios.get('/api/admin/crypto/investments-by-project');
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load crypto investments summary');
        setLoading(false);
        
        // For development, use mock data when API fails or doesn't exist yet
        const mockData: CryptoProjectSummary[] = [
          {
            propertyId: 1,
            propertyName: "Palmview Heights",
            totalInvested: "1250.75",
            transactionCount: 4,
            currencies: [
              { currency: "BTC", amount: "0.0125" },
              { currency: "ETH", amount: "0.75" }
            ]
          },
          {
            propertyId: 2,
            propertyName: "Westfield Retail Center",
            totalInvested: "500.00",
            transactionCount: 1,
            currencies: [
              { currency: "USDT", amount: "500.00" }
            ]
          },
          {
            propertyId: 3,
            propertyName: "Green Energy Industrial Park",
            totalInvested: "1000.00",
            transactionCount: 1,
            currencies: [
              { currency: "USDC", amount: "1000.00" }
            ]
          }
        ];
        
        setData(mockData);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Crypto Investments by Project
      </Typography>
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell align="right">Total Invested (USD)</TableCell>
              <TableCell align="right">Transactions</TableCell>
              <TableCell>Currencies</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.propertyId}>
                <TableCell component="th" scope="row">
                  {row.propertyName}
                </TableCell>
                <TableCell align="right">${row.totalInvested}</TableCell>
                <TableCell align="right">{row.transactionCount}</TableCell>
                <TableCell>
                  {row.currencies.map((curr) => (
                    <Chip 
                      key={curr.currency}
                      label={`${curr.amount} ${curr.currency}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}