import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tab,
  Tabs
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Search,
  FilterList
} from '@mui/icons-material';

// Define KYC status types
type KycStatus = 'pending' | 'approved' | 'rejected';

// Define the user interface
interface KycUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  documentType: string;
  submissionDate: string;
  status: KycStatus;
}

// Sample user data
const sampleUsers: KycUser[] = [
  {
    id: 1,
    name: 'John Adebayo',
    email: 'john.adebayo@example.com',
    phoneNumber: '+234 803 123 4567',
    documentType: 'National ID',
    submissionDate: '2025-04-26',
    status: 'pending'
  },
  {
    id: 2,
    name: 'Sarah Okonkwo',
    email: 'sarah.o@example.com',
    phoneNumber: '+234 705 987 6543',
    documentType: 'Passport',
    submissionDate: '2025-04-25',
    status: 'pending'
  },
  {
    id: 3,
    name: 'Michael Ibrahim',
    email: 'michael.i@example.com',
    phoneNumber: '+234 812 456 7890',
    documentType: 'Driver\'s License',
    submissionDate: '2025-04-24',
    status: 'pending'
  },
  {
    id: 4,
    name: 'Chioma Eze',
    email: 'chioma.e@example.com',
    phoneNumber: '+234 902 345 6789',
    documentType: 'Voter\'s Card',
    submissionDate: '2025-04-23',
    status: 'approved'
  },
  {
    id: 5,
    name: 'David Nwachukwu',
    email: 'david.n@example.com',
    phoneNumber: '+234 701 234 5678',
    documentType: 'National ID',
    submissionDate: '2025-04-22',
    status: 'rejected'
  },
];

const KycUserTable: React.FC = () => {
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // State for filtering
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for document preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<KycUser | null>(null);

  // Filter users based on status and search query
  const filteredUsers = sampleUsers.filter(user => {
    const matchesStatus = filterStatus ? user.status === filterStatus : true;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle document preview
  const handlePreviewOpen = (user: KycUser) => {
    setSelectedUser(user);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  // Handle approve/reject KYC
  const handleApproveKyc = (userId: number) => {
    // Handle KYC approval logic here
    console.log(`Approving KYC for user ${userId}`);
  };

  const handleRejectKyc = (userId: number) => {
    // Handle KYC rejection logic here
    console.log(`Rejecting KYC for user ${userId}`);
  };

  // Get status chip based on KYC status
  const getStatusChip = (status: KycStatus) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          KYC Verification Requests
        </Typography>
        
        {/* Filter and Search */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ fontSize: '1.2rem', mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ mr: 2 }}
          />
          
          <Tabs 
            value={filterStatus} 
            onChange={(e, newValue) => setFilterStatus(newValue)}
            indicatorColor="primary"
            textColor="primary"
            sx={{ minHeight: 'auto' }}
          >
            <Tab 
              label="All" 
              value={null} 
              sx={{ minHeight: 'auto', py: 0.5 }} 
            />
            <Tab 
              label="Pending" 
              value="pending" 
              sx={{ minHeight: 'auto', py: 0.5 }} 
            />
            <Tab 
              label="Approved" 
              value="approved" 
              sx={{ minHeight: 'auto', py: 0.5 }} 
            />
            <Tab 
              label="Rejected" 
              value="rejected" 
              sx={{ minHeight: 'auto', py: 0.5 }} 
            />
          </Tabs>
        </Box>
      </Box>

      <Paper elevation={0} variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Document Type</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.documentType}</TableCell>
                    <TableCell>{user.submissionDate}</TableCell>
                    <TableCell>{getStatusChip(user.status)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handlePreviewOpen(user)}
                          sx={{ mr: 1 }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        
                        {user.status === 'pending' && (
                          <>
                            <IconButton 
                              size="small" 
                              color="success" 
                              onClick={() => handleApproveKyc(user.id)}
                              sx={{ mr: 1 }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleRejectKyc(user.id)}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onClose={handlePreviewClose} maxWidth="md" fullWidth>
        <DialogTitle>
          KYC Verification Details
          {selectedUser && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedUser.name} - {selectedUser.documentType}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              {/* Mock document preview - in a real app, this would display actual user documents */}
              <Box sx={{ 
                height: 300, 
                bgcolor: 'background.default', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 2
              }}>
                <Typography color="text.secondary">
                  {selectedUser.documentType} Document Preview
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" sx={{ mb: 1 }}>User Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body2">{selectedUser.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body2">{selectedUser.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body2">{selectedUser.phoneNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Submission Date</Typography>
                  <Typography variant="body2">{selectedUser.submissionDate}</Typography>
                </Box>
              </Box>
              
              {selectedUser.status === 'pending' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Verification Notes</Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Add notes about this verification (optional)"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose}>Close</Button>
          
          {selectedUser && selectedUser.status === 'pending' && (
            <>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => {
                  handleRejectKyc(selectedUser.id);
                  handlePreviewClose();
                }}
              >
                Reject
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => {
                  handleApproveKyc(selectedUser.id);
                  handlePreviewClose();
                }}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KycUserTable;