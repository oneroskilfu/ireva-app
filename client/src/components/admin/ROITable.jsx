import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Paper, 
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  TableContainer
} from '@mui/material';
import { fetchTableData } from '@/services/roiService';

const ROITable = ({ data = null }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    project: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // If data is provided as a prop, use it directly
    if (data) {
      setTableData(data);
      setLoading(false);
    } else {
      // Otherwise fetch from API
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetchTableData(filters);
          setTableData(response.data.data || []);
          setTotalPages(Math.ceil((response.data.totalCount || 0) / 10));
        } catch (error) {
          console.error('Error fetching ROI table data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [data, filters, page]);

  const handleFilterChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value });
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        ROI Distribution Transactions
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField 
          label="Search Investor" 
          variant="outlined" 
          value={filters.search}
          onChange={handleFilterChange('search')}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={handleFilterChange('status')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={filters.project}
            label="Project"
            onChange={handleFilterChange('project')}
          >
            <MenuItem value="">All Projects</MenuItem>
            <MenuItem value="Skyline Apartments">Skyline Apartments</MenuItem>
            <MenuItem value="Palm Estate">Palm Estate</MenuItem>
            <MenuItem value="Ocean View">Ocean View</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : tableData.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No distribution records found matching your filters.
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Investor</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F3F3F3' }}
                  >
                    <TableCell>{row.investor}</TableCell>
                    <TableCell>{row.project}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>
                      <Box 
                        component="span" 
                        sx={{ 
                          px: 2, 
                          py: 0.5, 
                          borderRadius: 1,
                          backgroundColor: row.status === 'Paid' ? '#e6f7ee' : '#fff8e6',
                          color: row.status === 'Paid' ? '#2e7d32' : '#ed6c02'
                        }}
                      >
                        {row.status}
                      </Box>
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ROITable;