import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField } from '@mui/material';

const mockData = [
  { investor: 'John Doe', project: 'CityView', amount: '₦500,000', status: 'Paid' },
  { investor: 'Jane Smith', project: 'Palm Estate', amount: '₦300,000', status: 'Pending' }
];

const ROITable = () => (
  <Paper style={{ marginTop: '2rem', padding: '1rem' }}>
    <TextField label="Search Investor" variant="outlined" fullWidth margin="normal" />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Investor</TableCell>
          <TableCell>Project</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {mockData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.investor}</TableCell>
            <TableCell>{row.project}</TableCell>
            <TableCell>{row.amount}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

export default ROITable;