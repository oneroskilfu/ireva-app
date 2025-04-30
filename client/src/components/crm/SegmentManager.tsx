import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSegments } from '../../hooks/useSegments';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Verified as VerifiedIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterListIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface SegmentFormData {
  name: string;
  filters: {
    minInvestment?: number | null;
    lastActivityDays?: number | null;
    kycStatus?: string[];
    investorType?: string[];
    registrationDateFrom?: string | null;
    registrationDateTo?: string | null;
  };
}

const SegmentManager: React.FC = () => {
  const { segments, isLoading, createSegment } = useSegments();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<SegmentFormData>({
    defaultValues: {
      name: '',
      filters: {
        minInvestment: null,
        lastActivityDays: null,
        kycStatus: [],
        investorType: [],
        registrationDateFrom: null,
        registrationDateTo: null
      }
    }
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onSubmit = async (data: SegmentFormData) => {
    try {
      // Remove null values from filters
      const filters = Object.entries(data.filters).reduce((acc, [key, value]) => {
        if (value !== null && (Array.isArray(value) ? value.length > 0 : value !== '')) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      await createSegment.mutateAsync({
        name: data.name,
        filters
      });
      reset();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating segment:', error);
    }
  };

  const renderFilterSummary = (filters: any) => {
    if (!filters || Object.keys(filters).length === 0) {
      return <Typography variant="body2" color="text.secondary">No filters applied</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {filters.minInvestment && (
          <Chip
            icon={<MoneyIcon fontSize="small" />}
            label={`Min Investment: $${filters.minInvestment}`}
            size="small"
            variant="outlined"
          />
        )}
        {filters.lastActivityDays && (
          <Chip
            icon={<CalendarIcon fontSize="small" />}
            label={`Active in last ${filters.lastActivityDays} days`}
            size="small"
            variant="outlined"
          />
        )}
        {filters.kycStatus && filters.kycStatus.length > 0 && (
          <Chip
            icon={<VerifiedIcon fontSize="small" />}
            label={`KYC: ${filters.kycStatus.join(', ')}`}
            size="small"
            variant="outlined"
          />
        )}
        {filters.investorType && filters.investorType.length > 0 && (
          <Chip
            icon={<PersonAddIcon fontSize="small" />}
            label={`Type: ${filters.investorType.join(', ')}`}
            size="small"
            variant="outlined"
          />
        )}
        {filters.registrationDateFrom && (
          <Chip
            icon={<CalendarIcon fontSize="small" />}
            label={`From: ${new Date(filters.registrationDateFrom).toLocaleDateString()}`}
            size="small"
            variant="outlined"
          />
        )}
        {filters.registrationDateTo && (
          <Chip
            icon={<CalendarIcon fontSize="small" />}
            label={`To: ${new Date(filters.registrationDateTo).toLocaleDateString()}`}
            size="small"
            variant="outlined"
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                User Segments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage segments to target specific user groups
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={showForm ? <CancelIcon /> : <AddIcon />}
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) reset();
              }}
            >
              {showForm ? 'Cancel' : 'New Segment'}
            </Button>
          </Grid>

          {showForm && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6">Create New Segment</Typography>
                      <Divider sx={{ my: 1 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Segment Name"
                        variant="outlined"
                        {...register('name', { required: 'Segment name is required' })}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Minimum Investment ($)"
                        variant="outlined"
                        type="number"
                        {...register('filters.minInvestment', {
                          valueAsNumber: true,
                          min: { value: 0, message: 'Minimum investment must be positive' }
                        })}
                        error={!!errors.filters?.minInvestment}
                        helperText={errors.filters?.minInvestment?.message}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Active in Last X Days"
                        variant="outlined"
                        type="number"
                        {...register('filters.lastActivityDays', {
                          valueAsNumber: true,
                          min: { value: 1, message: 'Days must be 1 or more' }
                        })}
                        error={!!errors.filters?.lastActivityDays}
                        helperText={errors.filters?.lastActivityDays?.message}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>KYC Status</InputLabel>
                        <Controller
                          name="filters.kycStatus"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label="KYC Status"
                              multiple
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {(selected as string[]).map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                  ))}
                                </Box>
                              )}
                            >
                              {['pending', 'approved', 'rejected', 'incomplete'].map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Investor Type</InputLabel>
                        <Controller
                          name="filters.investorType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label="Investor Type"
                              multiple
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {(selected as string[]).map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                  ))}
                                </Box>
                              )}
                            >
                              {['retail', 'accredited', 'institutional'].map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Registration Date From"
                        variant="outlined"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        {...register('filters.registrationDateFrom')}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Registration Date To"
                        variant="outlined"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        {...register('filters.registrationDateTo')}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <CircularProgress size={24} /> : 'Save Segment'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Existing Segments
            </Typography>

            <TableContainer>
              <Table sx={{ minWidth: 650 }} size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Filters</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Loading segments...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : segments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1">
                          No segments found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create your first segment to target specific user groups
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    segments
                      ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((segment) => (
                        <TableRow key={segment.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="body2" fontWeight="medium">
                                {segment.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{renderFilterSummary(segment.filters)}</TableCell>
                          <TableCell>
                            {segment.createdAt ? (
                              <Tooltip title={new Date(segment.createdAt).toLocaleString()}>
                                <Typography variant="body2">
                                  {formatDistanceToNow(new Date(segment.createdAt), { addSuffix: true })}
                                </Typography>
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Tooltip title="View Users">
                                <IconButton size="small" color="primary">
                                  <PeopleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {segments && segments.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={segments.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SegmentManager;