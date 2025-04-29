import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, Button
} from '@mui/material';
import axios from 'axios';

export default function ComplianceCenter() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/admin/compliance-logs', {
        params: { documentType: filter || undefined }
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching compliance logs:', error);
    }
  };

  const handleExportCSV = () => {
    // Create header row
    const csvRows = [
      ["User ID", "Document Type", "Document Version", "Accepted At", "IP Address"],
      ...logs.map(log => [
        log.userId, 
        log.documentType, 
        log.documentVersion,
        new Date(log.acceptedAt).toLocaleString(),
        log.ipAddress || 'N/A'
      ])
    ];
    
    // Create CSV content
    const blob = new Blob([csvRows.map(r => r.join(",")).join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Compliance Center</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Monitor user acceptance of legal documents and generate compliance reports
      </Typography>

      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Box>
          <Typography variant="body2" mb={1} color="text.secondary">
            Filter by document type:
          </Typography>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Documents</MenuItem>
            <MenuItem value="terms_of_service">Terms of Service</MenuItem>
            <MenuItem value="privacy_policy">Privacy Policy</MenuItem>
            <MenuItem value="investor_risk_disclosure">Investor Risk Disclosure</MenuItem>
            <MenuItem value="crypto_risk_disclosure">Crypto Risk Disclosure</MenuItem>
            <MenuItem value="aml_statement">AML Statement</MenuItem>
            <MenuItem value="gdpr_commitment">GDPR Commitment</MenuItem>
            <MenuItem value="cookies_policy">Cookies Policy</MenuItem>
          </Select>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleExportCSV}
          sx={{ mt: 3 }}
        >
          Export CSV Report
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.subtle' }}>
            <TableRow>
              <TableCell><strong>User ID</strong></TableCell>
              <TableCell><strong>Document Type</strong></TableCell>
              <TableCell><strong>Version</strong></TableCell>
              <TableCell><strong>Accepted At</strong></TableCell>
              <TableCell><strong>IP Address</strong></TableCell>
              <TableCell><strong>User Agent</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.userId}</TableCell>
                  <TableCell>
                    {log.documentType === 'terms_of_service' && 'Terms of Service'}
                    {log.documentType === 'privacy_policy' && 'Privacy Policy'}
                    {log.documentType === 'investor_risk_disclosure' && 'Investor Risk Disclosure'}
                    {log.documentType === 'crypto_risk_disclosure' && 'Crypto Risk Disclosure'}
                    {log.documentType === 'aml_statement' && 'AML Statement'}
                    {log.documentType === 'gdpr_commitment' && 'GDPR Commitment'}
                    {log.documentType === 'cookies_policy' && 'Cookies Policy'}
                  </TableCell>
                  <TableCell>{log.documentVersion}</TableCell>
                  <TableCell>{new Date(log.acceptedAt).toLocaleString()}</TableCell>
                  <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.userAgent ? log.userAgent.substring(0, 50) + (log.userAgent.length > 50 ? '...' : '') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No compliance logs available{filter ? ` for ${filter}` : ''}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}