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
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Business,
  LocationOn,
  AttachMoney,
  MoreVert,
  CalendarToday
} from '@mui/icons-material';

// Define property status types
type PropertyStatus = 'active' | 'fully-funded' | 'completed' | 'draft';

// Define the property interface
interface Property {
  id: number;
  name: string;
  location: string;
  type: string;
  totalValue: number;
  fundingGoal: number;
  fundingProgress: number;
  investors: number;
  status: PropertyStatus;
  returnRate: number;
  maturityDate: string;
  imageUrl?: string;
}

// Sample property data
const sampleProperties: Property[] = [
  {
    id: 1,
    name: 'Lekki Gardens Phase 2',
    location: 'Lekki, Lagos',
    type: 'Residential',
    totalValue: 350000000,
    fundingGoal: 250000000,
    fundingProgress: 175000000,
    investors: 112,
    status: 'active',
    returnRate: 12,
    maturityDate: '2030-04-25',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'
  },
  {
    id: 2,
    name: 'Victoria Island Office Complex',
    location: 'Victoria Island, Lagos',
    type: 'Commercial',
    totalValue: 1200000000,
    fundingGoal: 800000000,
    fundingProgress: 800000000,
    investors: 45,
    status: 'fully-funded',
    returnRate: 14.5,
    maturityDate: '2031-02-15',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'
  },
  {
    id: 3,
    name: 'Abuja Heights Apartments',
    location: 'Maitama, Abuja',
    type: 'Residential',
    totalValue: 450000000,
    fundingGoal: 300000000,
    fundingProgress: 180000000,
    investors: 78,
    status: 'active',
    returnRate: 13,
    maturityDate: '2030-08-10',
    imageUrl: 'https://images.unsplash.com/photo-1460317442991-0ec209397118'
  },
  {
    id: 4,
    name: 'Port Harcourt Marina',
    location: 'Port Harcourt, Rivers',
    type: 'Mixed-Use',
    totalValue: 750000000,
    fundingGoal: 500000000,
    fundingProgress: 50000000,
    investors: 28,
    status: 'active',
    returnRate: 15,
    maturityDate: '2032-01-15',
    imageUrl: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048'
  },
];

const ProjectManagementPanel: React.FC = () => {
  // State for add/edit property dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePropertyId, setDeletePropertyId] = useState<number | null>(null);
  
  // Define property types and statuses for dropdown options
  const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed-Use'];
  const propertyStatuses: PropertyStatus[] = ['active', 'fully-funded', 'completed', 'draft'];
  
  // Format currency in Nigerian Naira
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };
  
  // Calculate funding percentage
  const calculateFundingPercentage = (property: Property): number => {
    return Math.round((property.fundingProgress / property.fundingGoal) * 100);
  };
  
  // Get status chip based on property status
  const getStatusChip = (status: PropertyStatus) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'fully-funded':
        return <Chip label="Fully Funded" color="primary" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="secondary" size="small" />;
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };
  
  // Handler for opening the add property dialog
  const handleAddProperty = () => {
    setEditMode(false);
    setSelectedProperty(null);
    setDialogOpen(true);
  };
  
  // Handler for opening the edit property dialog
  const handleEditProperty = (property: Property) => {
    setEditMode(true);
    setSelectedProperty(property);
    setDialogOpen(true);
  };
  
  // Handler for closing the property dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handler for saving a property (add or edit)
  const handleSaveProperty = () => {
    // Handle saving property logic here
    console.log('Saving property', selectedProperty);
    setDialogOpen(false);
  };
  
  // Handler for opening the delete confirmation dialog
  const handleDeleteConfirmOpen = (propertyId: number) => {
    setDeletePropertyId(propertyId);
    setDeleteDialogOpen(true);
  };
  
  // Handler for closing the delete confirmation dialog
  const handleDeleteConfirmClose = () => {
    setDeleteDialogOpen(false);
    setDeletePropertyId(null);
  };
  
  // Handler for confirming property deletion
  const handleConfirmDelete = () => {
    // Handle delete property logic here
    console.log('Deleting property', deletePropertyId);
    setDeleteDialogOpen(false);
    setDeletePropertyId(null);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Property Management
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddProperty}
        >
          Add Property
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {sampleProperties.map((property) => (
          <Grid item xs={12} md={6} key={property.id}>
            <Card sx={{ 
              display: 'flex', 
              height: '100%',
              boxShadow: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              } 
            }}>
              <CardMedia
                component="img"
                sx={{ width: 140 }}
                image={property.imageUrl || 'https://via.placeholder.com/140x200'}
                alt={property.name}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {property.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {property.location}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getStatusChip(property.status)}
                      <IconButton size="small" sx={{ ml: 0.5 }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {property.type}
                    </Typography>
                    
                    <AttachMoney sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.returnRate}% ROI
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Funding Progress
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {calculateFundingPercentage(property)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateFundingPercentage(property)} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Funding Goal</Typography>
                      <Typography variant="body2" fontWeight="medium">{formatCurrency(property.fundingGoal)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Investors</Typography>
                      <Typography variant="body2" fontWeight="medium">{property.investors}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Maturity</Typography>
                      <Typography variant="body2" fontWeight="medium">{new Date(property.maturityDate).getFullYear()}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<Edit />} 
                    sx={{ mr: 1 }}
                    onClick={() => handleEditProperty(property)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<Delete />}
                    onClick={() => handleDeleteConfirmOpen(property.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Property Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Property Name"
                fullWidth
                required
                value={selectedProperty?.name || ''}
                // onChange handler would go here
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                fullWidth
                required
                value={selectedProperty?.location || ''}
                // onChange handler would go here
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Property Type"
                fullWidth
                required
                value={selectedProperty?.type || ''}
                // onChange handler would go here
              >
                {propertyTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                fullWidth
                required
                value={selectedProperty?.status || 'active'}
                // onChange handler would go here
              >
                {propertyStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Value (₦)"
                fullWidth
                required
                type="number"
                value={selectedProperty?.totalValue || ''}
                // onChange handler would go here
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Funding Goal (₦)"
                fullWidth
                required
                type="number"
                value={selectedProperty?.fundingGoal || ''}
                // onChange handler would go here
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ROI Rate (%)"
                fullWidth
                required
                type="number"
                value={selectedProperty?.returnRate || ''}
                // onChange handler would go here
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Maturity Date"
                fullWidth
                required
                type="date"
                value={selectedProperty?.maturityDate || ''}
                InputLabelProps={{ shrink: true }}
                // onChange handler would go here
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Property Image URL"
                fullWidth
                value={selectedProperty?.imageUrl || ''}
                // onChange handler would go here
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Property Description"
                fullWidth
                multiline
                rows={4}
                // value would go here
                // onChange handler would go here
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveProperty}>
            {editMode ? 'Update Property' : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteConfirmClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this property? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagementPanel;