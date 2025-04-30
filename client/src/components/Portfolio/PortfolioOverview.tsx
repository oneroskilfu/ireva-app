import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DataGrid, 
  GridColDef, 
  GridToolbar,
  GridRowParams
} from '@mui/x-data-grid';
import { 
  Chip, 
  Paper, 
  Stack, 
  TextField, 
  Select, 
  MenuItem, 
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { apiRequest } from "@/lib/queryClient";
import { format } from 'date-fns';
import { Investment } from '@shared/schema';
import { Loader2 } from 'lucide-react';

// Define column configuration with proper access to nested objects
const columns: GridColDef[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 90 
  },
  { 
    field: 'investedAt', 
    headerName: 'Date', 
    width: 120,
    valueFormatter: ({ value }) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
  },
  { 
    field: 'user', 
    headerName: 'Investor', 
    width: 200,
    valueGetter: (params) => params.row.user?.email || params.row.user?.username || '-'
  },
  { 
    field: 'property', 
    headerName: 'Project', 
    width: 230,
    valueGetter: (params) => params.row.property?.title || '-'
  },
  { 
    field: 'amount', 
    headerName: 'Amount', 
    width: 130,
    valueFormatter: ({ value }) => value ? `$${Number(value).toLocaleString()}` : '-'
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 130,
    renderCell: ({ value }) => (
      <Chip 
        label={value} 
        color={
          value === 'active' ? 'success' : 
          value === 'matured' ? 'warning' : 
          value === 'completed' ? 'info' :
          value === 'defaulted' ? 'error' : 'default'
        } 
        size="small"
      />
    )
  },
  { 
    field: 'projectedROI', 
    headerName: 'Projected ROI', 
    width: 130,
    valueFormatter: ({ value }) => value ? `${value}%` : '-'
  },
  { 
    field: 'actualROI', 
    headerName: 'Actual ROI', 
    width: 130,
    valueFormatter: ({ value }) => value ? `${value}%` : '-'
  },
  {
    field: 'maturityDate',
    headerName: 'Maturity Date',
    width: 130,
    valueFormatter: ({ value }) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
  }
];

// Investment detail interface
interface InvestmentDetail extends Investment {
  user?: {
    id: string;
    email?: string;
    username?: string;
    name?: string;
  };
  property?: {
    id: string;
    title: string;
    location?: string;
    fundingGoal?: number;
  };
}

export const PortfolioOverview = () => {
  // State for filters and selected investment
  const [filters, setFilters] = useState({
    status: '',
    propertyId: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    search: ''
  });
  
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch portfolio data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/portfolio', filters],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.propertyId) params.append('propertyId', filters.propertyId);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.search) params.append('search', filters.search);
      
      const response = await apiRequest(
        'GET', 
        `/api/admin/portfolio?${params.toString()}`
      );
      const result = await response.json();
      return result;
    }
  });

  // Handle opening the investment detail dialog
  const handleRowClick = (params: GridRowParams) => {
    setSelectedInvestment(params.row as InvestmentDetail);
    setDetailOpen(true);
  };

  // Handle closing the investment detail dialog
  const handleDetailClose = () => {
    setDetailOpen(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Investment Portfolio Overview
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField 
              label="Search by Investor or Project"
              fullWidth
              variant="outlined"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              displayEmpty
              fullWidth
              variant="outlined"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="matured">Matured</MenuItem>
              <MenuItem value="withdrawn">Withdrawn</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="defaulted">Defaulted</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12} md={3}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
              slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
              slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
            />
          </Grid>
        </Grid>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Loader2 className="h-8 w-8 animate-spin" />
          </Box>
        ) : (
          <DataGrid
            rows={data || []}
            columns={columns}
            onRowClick={handleRowClick}
            slots={{ toolbar: GridToolbar }}
            sx={{ 
              height: 600,
              boxShadow: 'none',
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: {
                sortModel: [{ field: 'investedAt', sort: 'desc' }],
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            getRowClassName={(params) => 
              params.indexRelativeToCurrentPage % 2 === 0 ? 'bg-gray-50' : ''
            }
          />
        )}
      </Paper>

      <PerformanceComparison />

      {/* Investment Detail Dialog */}
      <Dialog 
        open={detailOpen} 
        onClose={handleDetailClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Investment Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedInvestment && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Investment ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvestment.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip 
                    label={selectedInvestment.status} 
                    color={
                      selectedInvestment.status === 'active' ? 'success' : 
                      selectedInvestment.status === 'matured' ? 'warning' : 
                      selectedInvestment.status === 'completed' ? 'info' :
                      selectedInvestment.status === 'defaulted' ? 'error' : 'default'
                    }
                    size="small"
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Investor
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvestment.user?.email || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Property
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvestment.property?.title || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" gutterBottom>
                  ${selectedInvestment.amount.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Investment Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvestment.investedAt 
                    ? format(new Date(selectedInvestment.investedAt), 'PPP') 
                    : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Maturity Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvestment.maturityDate 
                    ? format(new Date(selectedInvestment.maturityDate), 'PPP') 
                    : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Projected ROI
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvestment.projectedROI ? `${selectedInvestment.projectedROI}%` : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Actual ROI
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvestment.actualROI ? `${selectedInvestment.actualROI}%` : 'Pending'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvestment.paymentMethod || 'N/A'}
                </Typography>
              </Grid>
              
              {selectedInvestment.withdrawnAt && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Withdrawn Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {format(new Date(selectedInvestment.withdrawnAt), 'PPP')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>Close</Button>
          {selectedInvestment && selectedInvestment.status === 'active' && (
            <Button variant="contained" color="primary">
              Manage Investment
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Performance Visualization Component
const PerformanceComparison = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/portfolio/performance'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/portfolio/performance');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading portfolio performance data...
        </Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No performance data available
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Performance metrics will appear here once investments mature.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Project Performance vs Projections
      </Typography>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis tickFormatter={(value) => `${value}%`} />
          <Tooltip 
            formatter={(value) => [`${value}%`, '']}
            labelFormatter={(label) => `Project: ${label}`}
          />
          <Legend />
          <Bar dataKey="projectedROI" name="Projected ROI" fill="#8884d8" />
          <Bar dataKey="actualROI" name="Actual ROI" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          This chart compares the projected vs actual ROI across all investment properties. 
          Properties with higher actual ROI than projected are performing above expectations.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PortfolioOverview;