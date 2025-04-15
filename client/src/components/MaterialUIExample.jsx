import React, { useState } from 'react';
import { 
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress
} from '@mui/material';

/**
 * Example component showcasing various Material UI components
 */
const MaterialUIExample = () => {
  const [searchValue, setSearchValue] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [includeActive, setIncludeActive] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setAlertOpen(true);
    }, 1500);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Property Search
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use the form below to search for real estate investment opportunities in Nigeria.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Stack spacing={3}>
          <TextField 
            label="Search Properties" 
            variant="outlined" 
            fullWidth
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter property name or location"
            helperText="Search by property name, location, or description"
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="property-type-label">Property Type</InputLabel>
              <Select
                labelId="property-type-label"
                id="property-type"
                value={propertyType}
                label="Property Type"
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="industrial">Industrial</MenuItem>
                <MenuItem value="land">Land</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="roi-range-label">ROI Range</InputLabel>
              <Select
                labelId="roi-range-label"
                id="roi-range"
                label="ROI Range"
                defaultValue="medium"
              >
                <MenuItem value="low">5-10%</MenuItem>
                <MenuItem value="medium">10-15%</MenuItem>
                <MenuItem value="high">15-20%</MenuItem>
                <MenuItem value="premium">20%+</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={includeActive} 
                  onChange={() => setIncludeActive(!includeActive)}
                />
              } 
              label="Include active investments only" 
            />
          </Box>
        </Stack>
        
        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSearch}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Search Properties'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary"
          disabled={loading}
        >
          Reset
        </Button>
      </CardActions>
      
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={5000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          Properties found matching your criteria!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default MaterialUIExample;