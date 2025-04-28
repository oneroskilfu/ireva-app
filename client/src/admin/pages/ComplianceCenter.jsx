import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search, FileText, Calendar, CheckCircle, XCircle, Eye, Download, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import moment from 'moment';
import LegalPdfViewer from '../../components/legal/LegalPdfViewer';
import LegalTextViewer from '../../components/legal/LegalTextViewer';

const ComplianceCenter = () => {
  const [userAcceptanceLogs, setUserAcceptanceLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [documentFilter, setDocumentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState('text'); // 'text' or 'pdf'

  useEffect(() => {
    fetchComplianceLogs();
  }, []);

  // Apply filters whenever search query or filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, documentFilter, statusFilter, userAcceptanceLogs]);

  const fetchComplianceLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/compliance/logs');
      setUserAcceptanceLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching compliance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...userAcceptanceLogs];
    
    // Apply document type filter
    if (documentFilter !== 'all') {
      results = results.filter(log => log.documentType === documentFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(log => 
        statusFilter === 'accepted' ? log.status === 'accepted' : log.status !== 'accepted'
      );
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(log => 
        log.userName?.toLowerCase().includes(query) ||
        log.userEmail?.toLowerCase().includes(query) ||
        log.documentType?.toLowerCase().includes(query) ||
        log.ip?.includes(query)
      );
    }
    
    setFilteredLogs(results);
  };

  const formatDocumentType = (type) => {
    if (!type) return 'Unknown';
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDocument = (log) => {
    setSelectedDocument({
      documentType: log.documentType,
      version: log.version,
      title: formatDocumentType(log.documentType),
      pdfUrl: `/pdfs/${log.documentType}.pdf`,
      textContentUrl: `/api/legal/content/${log.documentType}`
    });
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Document Type', 'Version', 'Status', 'IP Address', 'Date Accepted'];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.userId,
        `"${log.userName || ''}"`,
        `"${log.userEmail || ''}"`,
        `"${formatDocumentType(log.documentType)}"`,
        log.version,
        log.status,
        log.ip || 'N/A',
        moment(log.acceptedAt).format('YYYY-MM-DD HH:mm:ss')
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `compliance_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" mb={3}>Compliance Center</Typography>
        
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" mb={2}>Legal Document Acceptance Logs</Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <TextField
              placeholder="Search users or documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="document-filter-label">Document Type</InputLabel>
                <Select
                  labelId="document-filter-label"
                  value={documentFilter}
                  label="Document Type"
                  onChange={(e) => setDocumentFilter(e.target.value)}
                >
                  <MenuItem value="all">All Documents</MenuItem>
                  <MenuItem value="terms_of_service">Terms of Service</MenuItem>
                  <MenuItem value="privacy_policy">Privacy Policy</MenuItem>
                  <MenuItem value="investor_risk_disclosure">Investor Risk Disclosure</MenuItem>
                  <MenuItem value="crypto_risk_disclosure">Crypto Risk Disclosure</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                startIcon={<RefreshCw size={16} />}
                onClick={fetchComplianceLogs}
              >
                Refresh
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<Download size={16} />}
                onClick={handleExportCSV}
              >
                Export
              </Button>
            </Stack>
          </Box>
          
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600 }}>
            <Table stickyHeader sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Document</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                        Loading compliance logs...
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No compliance logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((log, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">{log.userName || 'N/A'}</Typography>
                            <Typography variant="caption" color="text.secondary">{log.userEmail}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FileText size={16} style={{ marginRight: 8 }} />
                            <Typography variant="body2">{formatDocumentType(log.documentType)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{log.version}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={log.status === 'accepted' ? 'Accepted' : 'Pending'} 
                            color={log.status === 'accepted' ? 'success' : 'warning'}
                            icon={log.status === 'accepted' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Calendar size={14} style={{ marginRight: 6 }} />
                            <Typography variant="body2">
                              {log.acceptedAt ? moment(log.acceptedAt).format('MMM D, YYYY • h:mm A') : 'N/A'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            IP: {log.ip || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => handleViewDocument(log)}>
                            <Eye size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        
        <Dialog
          open={viewerOpen}
          onClose={handleCloseViewer}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedDocument?.title}
            <Typography variant="caption" display="block" color="text.secondary">
              Version: {selectedDocument?.version}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
              <Button
                variant={viewMode === 'text' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('text')}
                size="small"
                sx={{ mr: 1 }}
              >
                Text View
              </Button>
              <Button
                variant={viewMode === 'pdf' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('pdf')}
                size="small"
              >
                PDF View
              </Button>
            </Box>
            
            {selectedDocument && viewMode === 'text' ? (
              <LegalTextViewer
                documentType={selectedDocument.documentType}
                documentUrl={selectedDocument.textContentUrl}
                variant="dialog"
              />
            ) : selectedDocument && (
              <Box sx={{ height: '60vh' }}>
                <iframe
                  src={selectedDocument.pdfUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title={selectedDocument.title}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewer}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default ComplianceCenter;