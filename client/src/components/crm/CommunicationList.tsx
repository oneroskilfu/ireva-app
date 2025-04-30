import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  CircularProgress, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider, 
  Grid, 
  IconButton, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow, 
  TextField, 
  Tooltip, 
  Typography 
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Send as SendIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Sms as SmsIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useCommunications, Communication, CommunicationFilters } from '../../hooks/useCommunications';
import { formatDistanceToNow } from 'date-fns';

interface CommunicationListProps {
  onEdit?: (communication: Communication) => void;
}

const CommunicationList: React.FC<CommunicationListProps> = ({ onEdit }) => {
  const [filters, setFilters] = useState<CommunicationFilters>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { communications, isLoading, sendCommunication } = useCommunications(filters);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      query: searchQuery
    }));
    setPage(0);
  };

  const handleSendNow = (communication: Communication) => {
    setSelectedCommunication(communication);
    setConfirmDialogOpen(true);
  };

  const confirmSend = async () => {
    if (selectedCommunication) {
      await sendCommunication.mutateAsync(selectedCommunication.id);
      setConfirmDialogOpen(false);
      setSelectedCommunication(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'scheduled': return 'info';
      case 'sent': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EmailIcon fontSize="small" />;
      case 'push': return <NotificationsIcon fontSize="small" />;
      case 'sms': return <SmsIcon fontSize="small" />;
      default: return <EmailIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Communications
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              View and manage all communications sent to users.
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Search and filters */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by title..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    size="small" 
                    onClick={handleSearch}
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>

          {/* Status filter chips */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['all', 'draft', 'scheduled', 'sent', 'failed'].map((status) => (
                <Chip
                  key={status}
                  label={status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    status: status === 'all' ? undefined : status
                  }))}
                  color={filters.status === status ? 'primary' : 'default'}
                  variant={filters.status === status || (status === 'all' && !filters.status) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Grid>

          {/* Table */}
          <Grid item xs={12}>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="communications table">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Channel</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={30} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Loading communications...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : communications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1">
                          No communications found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try changing your search or filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    communications
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((communication) => (
                        <TableRow key={communication.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {communication.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 250 }}>
                              {communication.content.substring(0, 50)}
                              {communication.content.length > 50 ? '...' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getChannelIcon(communication.channel)}
                              label={communication.channel}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={communication.status}
                              size="small"
                              color={getStatusColor(communication.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {communication.createdAt ? (
                              <Tooltip title={new Date(communication.createdAt).toLocaleString()}>
                                <Typography variant="body2">
                                  {formatDistanceToNow(new Date(communication.createdAt), { addSuffix: true })}
                                </Typography>
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {communication.scheduledAt ? (
                              <Tooltip title={new Date(communication.scheduledAt).toLocaleString()}>
                                <Typography variant="body2">
                                  {formatDistanceToNow(new Date(communication.scheduledAt), { addSuffix: true })}
                                </Typography>
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              {onEdit && (
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => onEdit(communication)}
                                    disabled={communication.status === 'sent'}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {['draft', 'scheduled'].includes(communication.status) && (
                                <Tooltip title="Send Now">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleSendNow(communication)}
                                    color="primary"
                                  >
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
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
              count={communications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Send Communication Now?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to send this communication immediately to all recipients? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmSend} 
            color="primary" 
            variant="contained"
            startIcon={<SendIcon />}
            disabled={sendCommunication.isPending}
          >
            {sendCommunication.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Send Now'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunicationList;