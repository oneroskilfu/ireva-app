import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Grid,
  Skeleton,
  Tooltip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Wallet as WalletIcon,
  AccountCircle as UserIcon,
  FilterList as FilterIcon,
  ClearAll as ClearIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import UserDetailsDialog from './UserDetailsDialog';
import UserWalletDialog from './UserWalletDialog';
import StatusToggle from './StatusToggle';

// Define User interface
interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  status: 'active' | 'inactive' | 'suspended' | 'deactivated';
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin' | 'super_admin' | 'investor';
  walletBalance: string;
  createdAt: string;
  phone?: string;
  country?: string;
  lastLogin?: string;
  referredBy?: string;
  referralCode?: string;
}

const UserManagement = () => {
  // State for filtering and pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for selected user and dialogs
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userWalletOpen, setUserWalletOpen] = useState(false);
  
  // Initialize query client
  const queryClient = useQueryClient();
  
  // Fetch users with filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('search', searchQuery);
    if (statusFilter) params.append('status', statusFilter);
    if (kycStatusFilter) params.append('kycStatus', kycStatusFilter);
    if (roleFilter) params.append('role', roleFilter);
    
    params.append('page', (page + 1).toString());
    params.append('limit', rowsPerPage.toString());
    
    return params.toString();
  };
  
  const { 
    data: usersData, 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['admin-users', page, rowsPerPage, searchQuery, statusFilter, kycStatusFilter, roleFilter],
    queryFn: () => apiRequest("GET", `/api/admin/users?${buildQueryParams()}`).then(res => res.json()),
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData: Partial<User> & { id: string }) => apiRequest(
      "PATCH", 
      `/api/admin/users/${userData.id}`, 
      userData
    ).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserDetailsOpen(false);
      toast({
        title: "User Updated",
        description: "User details have been updated successfully.",
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user details.",
        variant: "destructive"
      });
    }
  });
  
  // Handle user selection for details
  const handleOpenUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };
  
  // Handle user selection for wallet
  const handleOpenUserWallet = (user: User) => {
    setSelectedUser(user);
    setUserWalletOpen(true);
  };
  
  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page on search
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setKycStatusFilter('');
    setRoleFilter('');
    setPage(0);
  };
  
  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Render appropriate chip for status
  const renderStatusChip = (status: string) => {
    let color: 'success' | 'error' | 'warning' | 'default' = 'default';
    
    switch (status) {
      case 'active':
        color = 'success';
        break;
      case 'suspended':
        color = 'error';
        break;
      case 'inactive':
        color = 'warning';
        break;
      case 'deactivated':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };
  
  // Render appropriate chip for KYC status
  const renderKycStatusChip = (status: string) => {
    let color: 'success' | 'error' | 'warning' | 'default' = 'default';
    
    switch (status) {
      case 'approved':
        color = 'success';
        break;
      case 'rejected':
        color = 'error';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'not_started':
        color = 'default';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Search by email, username or name"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Tooltip title="Toggle Filters">
              <IconButton onClick={toggleFilters} color={showFilters ? "primary" : "default"}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            
            {(statusFilter || kycStatusFilter || roleFilter || searchQuery) && (
              <Tooltip title="Clear Filters">
                <IconButton onClick={handleResetFilters} color="error">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
        
        {showFilters && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="deactivated">Deactivated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>KYC Status</InputLabel>
                  <Select
                    value={kycStatusFilter}
                    label="KYC Status"
                    onChange={(e) => setKycStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All KYC Statuses</MenuItem>
                    <MenuItem value="not_started">Not Started</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="investor">Investor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>KYC Status</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Wallet Balance</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" width={200} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={150} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="error">Error loading users. Please try again.</Typography>
                  </TableCell>
                </TableRow>
              ) : usersData?.users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>No users found matching the criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                usersData?.users?.map((user: User) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <UserIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">{user.email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.fullName || user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusToggle user={user} onUpdate={() => refetch()} />
                    </TableCell>
                    <TableCell>
                      {renderKycStatusChip(user.kycStatus)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role}
                        color={user.role === 'super_admin' ? 'error' : user.role === 'admin' ? 'warning' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={parseFloat(user.walletBalance) > 0 ? 'bold' : 'normal'}>
                        ${parseFloat(user.walletBalance).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit User">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenUserDetails(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage Wallet">
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleOpenUserWallet(user)}
                          >
                            <WalletIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={usersData?.pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* User Details Dialog */}
      {selectedUser && (
        <UserDetailsDialog
          open={userDetailsOpen}
          onClose={() => setUserDetailsOpen(false)}
          user={selectedUser}
          onUpdateUser={updateUserMutation.mutate}
          isUpdating={updateUserMutation.isPending}
        />
      )}
      
      {/* User Wallet Dialog */}
      {selectedUser && (
        <UserWalletDialog
          open={userWalletOpen}
          onClose={() => setUserWalletOpen(false)}
          userId={selectedUser.id}
        />
      )}
    </Box>
  );
};

export default UserManagement;