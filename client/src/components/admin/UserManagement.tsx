import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { Edit, AccountBalanceWallet, Download, Refresh } from '@mui/icons-material';
import { StatusToggle } from './StatusToggle';
import { UserFilters } from './UserFilters';
import { UserDetailsDialog } from './UserDetailsDialog';
import UserWalletDialog from './UserWalletDialog';
import { io } from 'socket.io-client';
import axios from 'axios';

interface User {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  kycStatus: string;
  role: string;
  createdAt?: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: [] as string[],
    kycStatus: [] as string[],
    search: ''
  });
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    
    // Set up Socket.IO for real-time updates
    const socket = io();
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('user:updated', (updatedUser) => {
      console.log('User updated:', updatedUser);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        )
      );
    });
    
    socket.on('user:created', (newUser) => {
      console.log('New user created:', newUser);
      fetchUsers(); // Refetch to ensure pagination is correct
    });
    
    return () => {
      socket.disconnect();
    };
  }, [page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/admin/users?page=${page}`;
      
      if (filters.status.length > 0) {
        url += `&status=${filters.status.join(',')}`;
      }
      
      if (filters.kycStatus.length > 0) {
        url += `&kycStatus=${filters.kycStatus.join(',')}`;
      }
      
      if (filters.search) {
        url += `&search=${filters.search}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.users) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setUsers(response.data);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string | number, newStatus: string) => {
    try {
      await axios.post(`/api/admin/users/${userId}/status`, { status: newStatus });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.response?.data?.error || 'Failed to update user status');
      return Promise.reject(err);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterSubmit = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleExportUsers = async () => {
    setExportLoading(true);
    try {
      let url = '/api/admin/users/export';
      
      if (filters.status.length > 0) {
        url += `?status=${filters.status.join(',')}`;
      }
      
      if (filters.kycStatus.length > 0) {
        url += `${url.includes('?') ? '&' : '?'}kycStatus=${filters.kycStatus.join(',')}`;
      }
      
      if (filters.search) {
        url += `${url.includes('?') ? '&' : '?'}search=${filters.search}`;
      }
      
      const response = await axios.get(url, { responseType: 'blob' });
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error exporting users:', err);
      setError(err.response?.data?.error || 'Failed to export users');
    } finally {
      setExportLoading(false);
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'not_started': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          User Management
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={fetchUsers}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<Download />} 
            onClick={handleExportUsers}
            disabled={exportLoading}
          >
            {exportLoading ? 'Exporting...' : 'Export Users'}
          </Button>
        </Box>
      </Box>
      
      <Box mb={3}>
        <UserFilters onSubmit={handleFilterSubmit} />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>KYC Status</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusToggle 
                          userId={user.id} 
                          currentStatus={user.status} 
                          onStatusChange={handleStatusChange} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.kycStatus} 
                          color={getKYCStatusColor(user.kycStatus) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setWalletDialogOpen(true);
                            }}
                          >
                            <AccountBalanceWallet fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      )}
      
      <UserDetailsDialog 
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        userId={selectedUserId}
      />
      
      {selectedUserId && (
        <UserWalletDialog 
          open={walletDialogOpen}
          onClose={() => setWalletDialogOpen(false)}
          userId={selectedUserId.toString()}
        />
      )}
    </Box>
  );
};