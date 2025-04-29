// client/src/components/admin/KycManagementTable.tsx

import { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, CircularProgress
} from '@mui/material';
import axios from 'axios';

interface KycEntry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function KycManagementTable() {
  const [kycs, setKycs] = useState<KycEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKycs = async () => {
    try {
      const res = await axios.get('/api/admin/kyc-submissions');
      setKycs(res.data);
    } catch (err) {
      console.error('Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await axios.post(`/api/admin/kyc-update/${id}`, { status });
      setKycs(kycs.map(k => (k.id === id ? { ...k, status } : k)));
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchKycs();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>KYC Submissions</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {kycs.map((kyc) => (
            <TableRow key={kyc.id}>
              <TableCell>{kyc.fullName}</TableCell>
              <TableCell>{kyc.email}</TableCell>
              <TableCell>{kyc.phone}</TableCell>
              <TableCell>{kyc.status}</TableCell>
              <TableCell align="right">
                {kyc.status === 'pending' && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => updateStatus(kyc.id, 'approved')}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => updateStatus(kyc.id, 'rejected')}
                    >
                      Reject
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