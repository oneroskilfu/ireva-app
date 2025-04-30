import { useState, useEffect } from 'react';
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
  Button, 
  TextField, 
  InputAdornment,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  Search, 
  Edit, 
  Delete, 
  Block, 
  CheckCircle, 
  Refresh,
  AccountBalance,
  MoreVert
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import UserDetailsDialog from './UserDetailsDialog';
import UserWalletDialog from './UserWalletDialog';

// Types for users
interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  status: 'active' | 'inactive' | 'suspended';
  kycStatus: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin' | 'super_admin' | 'investor';
  walletBalance: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

const UserManagement = () => {
  // State for filters and pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [kycStatusFilter, setKycStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  
  // State for user dialogs
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userWalletOpen, setUserWalletOpen] = useState(false);
  const [userStatusDialogOpen, setUserStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  
  // Initialize react-query client
  const queryClient = useQueryClient();
  
  // Fetch users with filters
  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ['admin-users', page, rowsPerPage, searchQuery, statusFilter, kycStatusFilter, roleFilter],
    queryFn: () => 
      apiRequest(
        "GET", 
        `/api/admin/users?page=${page + 1}&limit=${rowsPerPage}${searchQuery ? `&search=${searchQuery}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${kycStatusFilter ? `&kycStatus=${kycStatusFilter}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`
      ).then(res => res.json()),
  });
  
  // Update user details mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData: Partial<User> & { id: string }) => 
      apiRequest("PATCH", `/api/admin/users/${userData.id}`, userData)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-users', page, rowsPerPage, searchQuery, statusFilter, kycStatusFilter, roleFilter] 
      });
      toast({
        title: "User Updated",
        description: "User details have been updated successfully.",
        variant: "success"
      });
      setUserDetailsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user details.",
        variant: "destructive"
      });
    }
  });
  
  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) => 
      apiRequest("PATCH", `/api/admin/users/${userId}/status`, { status })
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-users', page, rowsPerPage, searchQuery, statusFilter, kycStatusFilter, roleFilter] 
      });
      toast({
        title: "Status Updated",
        description: `User has been ${newStatus === 'active' ? 'activated' : newStatus === 'inactive' ? 'deactivated' : 'suspended'} successfully.`,
        variant: "success"
      });
      setUserStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Status Update Failed",
        description: error.message || "Failed to update user status.",
        variant: "destructive"
      });
    }
  });
  
  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle opening the user details dialog
  const handleOpenUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };
  
  // Handle opening the user wallet dialog
  const handleOpenUserWallet = (user: User) => {
    setSelectedUser(user);
    setUserWalletOpen(true);
  };
  
  // Handle opening the user status change dialog
  const handleOpenStatusDialog = (user: User, initialStatus: 'active' | 'inactive' | 'suspended') => {
    setSelectedUser(user);
    setNewStatus(initialStatus);
    setUserStatusDialogOpen(true);
  };
  
  // Handle user status change
  const handleUpdateStatus = () => {
    if (!selectedUser) return;
    
    updateUserStatusMutation.mutate({
      userId: selectedUser.id,
      status: newStatus
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setKycStatusFilter('');
    setRoleFilter('');
    setPage(0);
  };
  
  // Render status chip with appropriate color
  const renderStatusChip = (status: string) => {
    let color: 'success' | 'error' | 'warning' | 'default' = 'default';
    
    switch (status) {
      case 'active':
        color = 'success';
        break;
      case 'inactive':
        color = 'warning';
        break;
      case 'suspended':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };
  
  // Render KYC status chip with appropriate color
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
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };
  
  // Render role chip with appropriate color
  const renderRoleChip = (role: string) => {
    let color: 'primary' | 'secondary' | 'info' | 'default' = 'default';
    
    switch (role) {
      case 'admin':
        color = 'primary';
        break;
      case 'super_admin':
        color = 'secondary';
        break;
      case 'investor':
        color = 'info';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={role} color={color} size="small" />;
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        User Management
      </Typography>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search Users"
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>KYC Status</InputLabel>
              <Select
                label="KYC Status"
                value={kycStatusFilter}
                onChange={(e) => setKycStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="investor">Investor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={resetFilters}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Email/Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>KYC Status</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Wallet Balance</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={30} sx={{ my: 3 }} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="error">
                    Error loading users. Please try again.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data && data.users.length > 0 ? (
              data.users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{user.email}</Typography>
                    <Typography variant="caption" color="textSecondary">{user.username}</Typography>
                  </TableCell>
                  <TableCell>{user.fullName || '—'}</TableCell>
                  <TableCell>{renderStatusChip(user.status)}</TableCell>
                  <TableCell>{renderKycStatusChip(user.kycStatus)}</TableCell>
                  <TableCell>{renderRoleChip(user.role)}</TableCell>
                  <TableCell>${parseFloat(user.walletBalance).toFixed(2)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenUserDetails(user)}
                        title="Edit User"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleOpenUserWallet(user)}
                        title="Wallet Details"
                      >
                        <AccountBalance fontSize="small" />
                      </IconButton>
                      
                      {user.status === 'active' ? (
                        <IconButton 
                          size="small" 
                          color="warning"
                          onClick={() => handleOpenStatusDialog(user, 'inactive')}
                          title="Deactivate User"
                        >
                          <Block fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleOpenStatusDialog(user, 'active')}
                          title="Activate User"
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" sx={{ py: 2 }}>
                    No users found matching the filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data?.pagination.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* User Status Change Dialog */}
      <Dialog open={userStatusDialogOpen} onClose={() => setUserStatusDialogOpen(false)}>
        <DialogTitle>
          {newStatus === 'active' ? 'Activate User' : 
            newStatus === 'inactive' ? 'Deactivate User' : 'Suspend User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to 
              {newStatus === 'active' ? ' activate ' : 
                newStatus === 'inactive' ? ' deactivate ' : ' suspend '}
              {selectedUser?.email}?
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive' | 'suspended')}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={newStatus === 'active' ? 'success' : 
              newStatus === 'inactive' ? 'warning' : 'error'}
            onClick={handleUpdateStatus}
            disabled={updateUserStatusMutation.isPending}
          >
            {updateUserStatusMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              newStatus === 'active' ? 'Activate' : 
                newStatus === 'inactive' ? 'Deactivate' : 'Suspend'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog - import this component separately */}
      {selectedUser && (
        <>
          {userDetailsOpen && (
            <UserDetailsDialog
              open={userDetailsOpen}
              onClose={() => setUserDetailsOpen(false)}
              user={selectedUser}
              onUpdateUser={updateUserMutation.mutate}
              isUpdating={updateUserMutation.isPending}
            />
          )}
          
          {userWalletOpen && (
            <UserWalletDialog
              open={userWalletOpen}
              onClose={() => setUserWalletOpen(false)}
              userId={selectedUser.id}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default UserManagement;