import React from 'react';
import { useForm } from 'react-hook-form';
import { Grid, Button, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

type Filters = {
  status: string[];
  kycStatus: string[];
  search: string;
};

interface UserFiltersProps {
  onSubmit: (filters: Filters) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({ onSubmit }) => {
  const { register, handleSubmit, reset } = useForm<Filters>({
    defaultValues: {
      status: [],
      kycStatus: [],
      search: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Account Status</InputLabel>
            <Select
              labelId="status-label"
              label="Account Status"
              multiple
              {...register('status')}
              defaultValue={[]}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="deactivated">Deactivated</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="kyc-label">KYC Status</InputLabel>
            <Select
              labelId="kyc-label"
              label="KYC Status"
              multiple
              {...register('kycStatus')}
              defaultValue={[]}
            >
              <MenuItem value="not_started">Not Started</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            label="Search"
            fullWidth
            placeholder="Email, Name"
            {...register('search')}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type="submit" variant="contained" color="primary">
              Apply Filters
            </Button>
            <Button 
              type="button" 
              variant="outlined"
              onClick={() => {
                reset({
                  status: [],
                  kycStatus: [],
                  search: ''
                });
                onSubmit({
                  status: [],
                  kycStatus: [],
                  search: ''
                });
              }}
            >
              Clear
            </Button>
          </div>
        </Grid>
      </Grid>
    </form>
  );
};