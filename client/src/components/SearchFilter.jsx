import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Paper, 
  Typography,
  InputAdornment,
  Slider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const SearchFilter = ({ data, onFilter }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [roiMin, setRoiMin] = useState('');
  const [roiMax, setRoiMax] = useState('');
  const [roiRange, setRoiRange] = useState([0, 25]);
  const [useSlider, setUseSlider] = useState(false);

  const handleFilter = () => {
    const min = useSlider ? roiRange[0] : (roiMin === '' ? 0 : parseFloat(roiMin));
    const max = useSlider ? roiRange[1] : (roiMax === '' ? 100 : parseFloat(roiMax));
    
    let filtered = data.filter(item => {
      const matchesSearch =
        search === '' || 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === '' || item.status === status;
      const matchesRoi = item.roi >= min && item.roi <= max;

      return matchesSearch && matchesStatus && matchesRoi;
    });

    onFilter(filtered);
  };

  // Apply filter on each input change
  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    setter(value);
    
    // Delay filter execution for better performance
    setTimeout(handleFilter, 300);
  };

  // Handle ROI range slider change
  const handleRoiRangeChange = (event, newValue) => {
    setRoiRange(newValue);
    setTimeout(handleFilter, 300);
  };
  
  // Toggle between slider and text inputs for ROI
  const toggleRoiControl = () => {
    setUseSlider(!useSlider);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <FilterListIcon sx={{ mr: 1 }} />
        Property Filter
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search Properties"
            placeholder="Enter name or location"
            value={search}
            onChange={handleInputChange(setSearch)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={status}
              label="Status"
              onChange={handleInputChange(setStatus)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {useSlider ? (
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>
              ROI Range: {roiRange[0]}% - {roiRange[1]}%
            </Typography>
            <Slider
              value={roiRange}
              onChange={handleRoiRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={25}
              step={0.5}
              marks={[
                { value: 0, label: '0%' },
                { value: 10, label: '10%' },
                { value: 25, label: '25%' }
              ]}
              sx={{ mt: 2, mb: 1 }}
            />
            <Button 
              size="small" 
              variant="text" 
              onClick={toggleRoiControl}
              sx={{ mt: 1 }}
            >
              Use Manual Input
            </Button>
          </Grid>
        ) : (
          <Grid item xs={12} md={4}>
            <Grid container spacing={1}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Min ROI %"
                  placeholder="0"
                  type="number"
                  value={roiMin}
                  onChange={handleInputChange(setRoiMin)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1">to</Typography>
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Max ROI %"
                  placeholder="25"
                  type="number"
                  value={roiMax}
                  onChange={handleInputChange(setRoiMax)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Button 
              size="small" 
              variant="text" 
              onClick={toggleRoiControl}
              sx={{ mt: 1 }}
            >
              Use Slider
            </Button>
          </Grid>
        )}
        
        <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleFilter}
            fullWidth
          >
            Filter
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchFilter;