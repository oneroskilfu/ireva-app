import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  InputAdornment,
  Skeleton,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';
import { fetchRoiTransactions } from '../../services/investorRoiService';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ROITransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc');
  const [projectFilter, setProjectFilter] = useState('');
  const [projects, setProjects] = useState([]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetchRoiTransactions(
        page + 1, 
        rowsPerPage, 
        sortOrder, 
        projectFilter || null
      );
      
      setTransactions(response.data);
      setTotalCount(response.totalCount);
      
      // Extract unique projects for filter dropdown
      const uniqueProjects = [];
      const projectIds = new Set();
      
      response.data.forEach(transaction => {
        if (transaction.propertyId && !projectIds.has(transaction.propertyId)) {
          projectIds.add(transaction.propertyId);
          uniqueProjects.push({
            id: transaction.propertyId,
            name: transaction.propertyName
          });
        }
      });
      
      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Failed to load ROI transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, rowsPerPage, sortOrder, projectFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleProjectFilterChange = (event) => {
    setProjectFilter(event.target.value);
    setPage(0);
  };

  const resetFilters = () => {
    setSortOrder('desc');
    setProjectFilter('');
    setPage(0);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const generateReceipt = (transaction) => {
    const doc = new jsPDF();
    
    // Add receipt header
    doc.setFontSize(20);
    doc.setTextColor(75, 59, 42); // #4B3B2A
    doc.text('iREVA ROI Payment Receipt', 105, 20, { align: 'center' });
    
    // Add date and reference
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${formatDate(transaction.date)}`, 20, 40);
    doc.text(`Reference: ${transaction.reference || 'N/A'}`, 20, 50);
    
    // Add transaction details
    doc.text('Transaction Details:', 20, 70);
    
    // Create a table for the transaction
    const tableData = [
      ['Property', transaction.propertyName || 'Unknown'],
      ['Location', transaction.propertyLocation || 'N/A'],
      ['Amount', formatCurrency(transaction.amount)],
      ['Status', transaction.status]
    ];
    
    doc.autoTable({
      startY: 75,
      head: [['Description', 'Value']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [75, 59, 42], textColor: [255, 255, 255] }
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.text('This is an automatically generated receipt.', 105, 180, { align: 'center' });
    doc.text('iREVA Real Estate Investment', 105, 190, { align: 'center' });
    
    // Save the PDF
    doc.save(`ROI_Receipt_${transaction.reference || 'unknown'}.pdf`);
    
    toast.success('Receipt downloaded successfully');
  };

  return (
    <Paper sx={{ p: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#4B3B2A' }}>
        ROI Transaction History
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-order-label">Sort By</InputLabel>
          <Select
            labelId="sort-order-label"
            value={sortOrder}
            label="Sort By"
            onChange={handleSortOrderChange}
            size="small"
            startAdornment={
              <InputAdornment position="start">
                <SortIcon fontSize="small" />
              </InputAdornment>
            }
          >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="project-filter-label">Filter by Project</InputLabel>
          <Select
            labelId="project-filter-label"
            value={projectFilter}
            label="Filter by Project"
            onChange={handleProjectFilterChange}
            size="small"
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            }
          >
            <MenuItem value="">All Projects</MenuItem>
            {projects.map(project => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={resetFilters}
          sx={{ 
            borderColor: '#4B3B2A', 
            color: '#4B3B2A',
            '&:hover': {
              borderColor: '#6A5140',
              backgroundColor: 'rgba(75, 59, 42, 0.04)'
            }
          }}
        >
          Reset Filters
        </Button>
      </Box>
      
      {/* Transactions Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#F3F3F3' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Receipt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  sx={{ '&:nth-of-type(even)': { backgroundColor: '#F9F9F9' } }}
                >
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.propertyName}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.status} 
                      size="small" 
                      color={getStatusColor(transaction.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => generateReceipt(transaction)}
                      sx={{ 
                        color: '#4B3B2A',
                        '&:hover': {
                          backgroundColor: 'rgba(75, 59, 42, 0.04)'
                        }
                      }}
                    >
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <ReceiptIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No transactions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {projectFilter ? 'Try changing your filters or selecting another project' : 'Your ROI transactions will appear here'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

export default ROITransactions;