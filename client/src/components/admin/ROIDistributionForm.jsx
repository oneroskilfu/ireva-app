import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  CircularProgress,
  Typography,
  FormHelperText
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ROIDistributionForm = ({ projects, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    roiPercentage: '',
    notes: '',
    distributionPeriod: '',
    distributionDate: new Date()
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is filled
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      distributionDate: date
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }
    
    if (!formData.roiPercentage) {
      newErrors.roiPercentage = 'ROI percentage is required';
    } else if (formData.roiPercentage <= 0) {
      newErrors.roiPercentage = 'ROI percentage must be greater than 0';
    } else if (formData.roiPercentage > 100) {
      newErrors.roiPercentage = 'ROI percentage cannot exceed 100%';
    }
    
    if (!formData.distributionPeriod) {
      newErrors.distributionPeriod = 'Distribution period is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            select
            label="Project"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.projectId}
            helperText={errors.projectId}
            disabled={loading}
          >
            <MenuItem value="">
              <em>Select a project</em>
            </MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="ROI Percentage"
            name="roiPercentage"
            type="number"
            value={formData.roiPercentage}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.roiPercentage}
            helperText={errors.roiPercentage}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{
              step: 0.01,
              min: 0.01,
              max: 100
            }}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Distribution Period"
            name="distributionPeriod"
            placeholder="e.g., April 2025"
            value={formData.distributionPeriod}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.distributionPeriod}
            helperText={errors.distributionPeriod}
            disabled={loading}
          />
          <FormHelperText>
            Example: Q1 2025, April 2025, Jan-Mar 2025
          </FormHelperText>
        </Grid>
        
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Distribution Date"
              value={formData.distributionDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
              disabled={loading}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Additional Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
          />
        </Grid>
      </Grid>
      
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Processing distribution...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ROIDistributionForm;