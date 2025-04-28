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
      console.error("Error fetching compliance logs:", error);
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["User ID", "Document Type", "Document Version", "Accepted At", "IP Address"],
      ...logs.map(log => [
        log.userId, 
        formatDocumentType(log.documentType), 
        log.documentVersion,
        new Date(log.acceptedAt).toLocaleString(),
        log.ipAddress
      ])
    ];
    const blob = new Blob([csvRows.map(r => r.join(",")).join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance_logs.csv';
    a.click();
  };

  const formatDocumentType = (type) => {
    if (!type) return '';
    
    // Convert from backend enum format to human-readable format
    const typeMapping = {
      'terms_of_service': 'Terms of Service',
      'privacy_policy': 'Privacy Policy',
      'investor_risk_disclosure': 'Investor Risk Disclosure',
      'crypto_risk_disclosure': 'Crypto Risk Disclosure',
      'aml_statement': 'AML Statement',
      'gdpr_commitment': 'GDPR Commitment',
      'cookies_policy': 'Cookies Policy'
    };
    
    return typeMapping[type] || type;
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Compliance Center</Typography>
      <Typography variant="body1" mb={4} color="text.secondary">
        Track when users accept legal documents and terms of service
      </Typography>

      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          displayEmpty
          size="small"
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
        <Button variant="outlined" onClick={handleExportCSV}>Export CSV</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Document Type</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Accepted At</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.userId}</TableCell>
                  <TableCell>{formatDocumentType(log.documentType)}</TableCell>
                  <TableCell>{log.documentVersion}</TableCell>
                  <TableCell>{new Date(log.acceptedAt).toLocaleString()}</TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No compliance logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}