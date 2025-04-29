// client/src/components/admin/InvestmentManagementTable.tsx

import { useEffect, useState } from 'react';
import {
  Table, TableHead, TableBody, TableCell, TableRow,
  TableContainer, Paper, Typography, Button, CircularProgress
} from '@mui/material';
import axios from 'axios';

interface Investment {
  id: string;
  investorName: string;
  projectName: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'flagged';
  date: string;
}

export default function InvestmentManagementTable() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    try {
      const res = await axios.get('/api/admin/investments');
      setInvestments(res.data);
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'confirmed' | 'flagged') => {
    try {
      await axios.post(`/api/admin/investments/${id}/update`, { status });
      setInvestments(investments.map(i => i.id === id ? { ...i, status } : i));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>All Investments</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Investor</TableCell>
            <TableCell>Project</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {investments.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.investorName}</TableCell>
              <TableCell>{inv.projectName}</TableCell>
              <TableCell>₦{inv.amount.toLocaleString()}</TableCell>
              <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
              <TableCell>{inv.status}</TableCell>
              <TableCell align="right">
                {inv.status === 'pending' && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      onClick={() => updateStatus(inv.id, 'confirmed')}
                      sx={{ mr: 1 }}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => updateStatus(inv.id, 'flagged')}
                    >
                      Flag
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}