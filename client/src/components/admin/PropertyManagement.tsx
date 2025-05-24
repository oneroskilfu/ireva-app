import { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  LinearProgress,
  IconButton,
  Box,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  Tab,
  Tabs,
  Tooltip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Archive as ArchiveIcon, 
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Image as ImageIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Property, Milestone, NewPropertyFormData, NewMilestoneFormData } from '../../types/property';
// Import directly from JSX file since it's not a TypeScript component
import AdminLayout from './AdminLayout.jsx';
import { format } from 'date-fns';

/**
 * Admin Property Management Component
 * Allows administrators to create, view, edit, and archive property listings.
 * Also manages property milestones, documents, and funding progress.
 */
const PropertyManagement = () => {
  // State for properties and selection
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Function to fetch all properties
  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/api/admin/properties');
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch a single property by ID (with milestones)
  const fetchPropertyDetails = async (id: string) => {
    setLoading(true);
    
    try {
      const response = await axios.get(`/api/admin/properties/${id}`);
      setSelectedProperty(response.data);
      setPropertyDialogOpen(true);
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new property
  const handleCreateProperty = async (formData: FormData) => {
    try {
      const response = await axios.post('/api/admin/properties', formData);
      setProperties([...properties, response.data]);
      setSuccessMessage('Property created successfully!');
      setPropertyDialogOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating property:', err);
      setError('Failed to create property. Please check your inputs and try again.');
    }
  };

  // Function to update a property
  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const response = await axios.put(`/api/admin/properties/${id}`, updates);
      
      // Update property in state
      setProperties(properties.map(p => p.id === id ? response.data : p));
      setSelectedProperty(response.data);
      setSuccessMessage('Property updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property. Please try again.');
    }
  };

  // Function to archive a property
  const handleArchiveProperty = async (id: string) => {
    try {
      await axios.post(`/api/admin/properties/${id}/archive`);
      
      // Update property in state
      setProperties(properties.filter(p => p.id !== id));
      setSuccessMessage('Property archived successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error archiving property:', err);
      setError('Failed to archive property. Please try again.');
    }
  };

  // Function to add a milestone to a property
  const handleAddMilestone = async (propertyId: string, milestoneData: NewMilestoneFormData) => {
    try {
      const response = await axios.post(`/api/admin/properties/${propertyId}/milestones`, milestoneData);
      
      // Update property with new milestone
      if (selectedProperty) {
        const updatedMilestones = [...selectedProperty.milestones, response.data];
        setSelectedProperty({...selectedProperty, milestones: updatedMilestones});
      }
      
      setMilestoneDialogOpen(false);
      setSuccessMessage('Milestone added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError('Failed to add milestone. Please try again.');
    }
  };

  // Function to update a milestone
  const handleUpdateMilestone = async (propertyId: string, milestoneId: string, updates: Partial<Milestone>) => {
    try {
      const response = await axios.patch(`/api/admin/properties/${propertyId}/milestones/${milestoneId}`, updates);
      
      // Update milestone in state
      if (selectedProperty) {
        const updatedMilestones = selectedProperty.milestones.map(m => 
          m.id === milestoneId ? response.data : m
        );
        setSelectedProperty({...selectedProperty, milestones: updatedMilestones});
      }
      
      setSuccessMessage('Milestone updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError('Failed to update milestone. Please try again.');
    }
  };

  // Function to upload a document
  const handleUploadDocument = async (propertyId: string, file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const response = await axios.post(`/api/admin/properties/${propertyId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update property in state
      if (selectedProperty) {
        setSelectedProperty(response.data);
      }
      
      setDocumentDialogOpen(false);
      setSuccessMessage('Document uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    }
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Reset error message
  const clearError = () => {
    setError('');
  };

  // Function to open the property dialog for creating a new property
  const openCreatePropertyDialog = () => {
    setSelectedProperty(null);
    setPropertyDialogOpen(true);
  };

  return (
    <AdminLayout>
      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Property Management
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={openCreatePropertyDialog}
          >
            Add New Property
          </Button>
        </Box>

        {/* Success message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Properties Table */}
        {loading ? (
          <LinearProgress sx={{ mb: 2 }} />
        ) : (
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Title</TableCell>
                  <TableCell sx={{ color: 'white' }}>Funding Progress</TableCell>
                  <TableCell sx={{ color: 'white' }}>ROI</TableCell>
                  <TableCell sx={{ color: 'white' }}>Tenor</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography sx={{ py: 2 }}>No properties found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  properties.map(property => (
                    <TableRow key={property.id} hover>
                      <TableCell>{property.title}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(property.currentFunding / property.fundingGoal) * 100}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 5 }}
                          />
                          <Typography variant="body2">
                            {Math.round((property.currentFunding / property.fundingGoal) * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{property.roiPercentage}%</TableCell>
                      <TableCell>{property.investmentTenor} months</TableCell>
                      <TableCell>
                        <Chip 
                          label={property.status.charAt(0).toUpperCase() + property.status.slice(1)} 
                          color={
                            property.status === 'active' ? 'success' : 
                            property.status === 'funded' ? 'primary' : 
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => fetchPropertyDetails(property.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Archive Property">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleArchiveProperty(property.id)}
                            >
                              <ArchiveIcon fontSize="small" />
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
        )}

        {/* Property Form Dialog */}
        <PropertyFormDialog 
          open={propertyDialogOpen}
          property={selectedProperty}
          onClose={() => setPropertyDialogOpen(false)}
          onSave={handleCreateProperty}
          onUpdate={handleUpdateProperty}
        />
        
        {/* Milestone Form Dialog - Only shown when a property is selected */}
        {selectedProperty && (
          <>
            <MilestoneFormDialog 
              open={milestoneDialogOpen}
              onClose={() => setMilestoneDialogOpen(false)}
              onSave={(milestoneData) => handleAddMilestone(selectedProperty.id, milestoneData)}
            />
            
            <DocumentUploadDialog 
              open={documentDialogOpen}
              onClose={() => setDocumentDialogOpen(false)}
              onUpload={(file) => handleUploadDocument(selectedProperty.id, file)}
            />
          </>
        )}
      </Container>
    </AdminLayout>
  );
};

// Property Form Dialog Component
interface PropertyFormDialogProps {
  open: boolean;
  property: Property | null;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  onUpdate: (id: string, updates: Partial<Property>) => void;
}

const PropertyFormDialog = ({ open, property, onClose, onSave, onUpdate }: PropertyFormDialogProps) => {
  // Form state
  const [formState, setFormState] = useState<Partial<NewPropertyFormData>>({
    title: '',
    description: '',
    location: {
      address: '',
      coordinates: [0, 0],
    },
    fundingGoal: 0,
    investmentTenor: 12,
    roiPercentage: 8,
  });
  
  // Images state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  // Reset form when property changes
  useEffect(() => {
    if (property) {
      setFormState({
        title: property.title,
        description: property.description,
        location: property.location,
        fundingGoal: property.fundingGoal,
        investmentTenor: property.investmentTenor,
        roiPercentage: property.roiPercentage,
      });
    } else {
      setFormState({
        title: '',
        description: '',
        location: {
          address: '',
          coordinates: [0, 0],
        },
        fundingGoal: 0,
        investmentTenor: 12,
        roiPercentage: 8,
      });
      setSelectedImages([]);
    }
  }, [property, open]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (property) {
      // Update existing property
      onUpdate(property.id, formState);
    } else {
      // Create new property
      const formData = new FormData();
      
      // Append form fields
      Object.entries(formState).forEach(([key, value]) => {
        if (key === 'location') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });
      
      // Append images
      selectedImages.forEach(image => {
        formData.append('images', image);
      });
      
      onSave(formData);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...fileArray]);
    }
  };

  const dialogTitle = property ? 'Edit Property' : 'Create New Property';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Property Title"
                fullWidth
                required
                value={formState.title || ''}
                onChange={e => setFormState({...formState, title: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                required
                value={formState.description || ''}
                onChange={e => setFormState({...formState, description: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Location Address"
                fullWidth
                required
                value={formState.location?.address || ''}
                onChange={e => setFormState({
                  ...formState, 
                  location: {...(formState.location || { coordinates: [0, 0] }), address: e.target.value}
                })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Latitude"
                type="number"
                inputProps={{ step: 'any' }}
                fullWidth
                required
                value={formState.location?.coordinates?.[0] || 0}
                onChange={e => setFormState({
                  ...formState, 
                  location: {
                    ...(formState.location || { address: '' }), 
                    coordinates: [parseFloat(e.target.value), formState.location?.coordinates?.[1] || 0]
                  }
                })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Longitude"
                type="number"
                inputProps={{ step: 'any' }}
                fullWidth
                required
                value={formState.location?.coordinates?.[1] || 0}
                onChange={e => setFormState({
                  ...formState, 
                  location: {
                    ...(formState.location || { address: '' }), 
                    coordinates: [formState.location?.coordinates?.[0] || 0, parseFloat(e.target.value)]
                  }
                })}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                label="Funding Goal (₦)"
                type="number"
                fullWidth
                required
                value={formState.fundingGoal || 0}
                onChange={e => setFormState({...formState, fundingGoal: parseFloat(e.target.value)})}
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₦</Typography>
                }}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                label="Investment Tenor (months)"
                type="number"
                fullWidth
                required
                value={formState.investmentTenor || 12}
                onChange={e => setFormState({...formState, investmentTenor: parseInt(e.target.value, 10)})}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                label="ROI Percentage"
                type="number"
                fullWidth
                required
                value={formState.roiPercentage || 8}
                onChange={e => setFormState({...formState, roiPercentage: parseFloat(e.target.value)})}
                InputProps={{
                  endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>%</Typography>
                }}
              />
            </Grid>
            
            {!property && (
              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                  />
                </Button>
                
                {/* Display selected images */}
                {selectedImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Selected Images ({selectedImages.length})</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {selectedImages.map((image, index) => (
                        <Chip 
                          key={index} 
                          label={image.name} 
                          icon={<ImageIcon />}
                          onDelete={() => {
                            setSelectedImages(prev => prev.filter((_, i) => i !== index));
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {property ? 'Update Property' : 'Create Property'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Milestone Form Dialog Component
interface MilestoneFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (milestoneData: NewMilestoneFormData) => void;
}

const MilestoneFormDialog = ({ open, onClose, onSave }: MilestoneFormDialogProps) => {
  const [formState, setFormState] = useState<NewMilestoneFormData>({
    title: '',
    description: '',
    completionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormState({
        title: '',
        description: '',
        completionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
    }
  }, [open]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Milestone</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Milestone Title"
              fullWidth
              required
              value={formState.title}
              onChange={e => setFormState({...formState, title: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              required
              value={formState.description}
              onChange={e => setFormState({...formState, description: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <DatePicker
              label="Expected Completion Date"
              value={formState.completionDate}
              onChange={(newDate) => newDate && setFormState({...formState, completionDate: newDate})}
              sx={{ width: '100%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Milestone
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

// Document Upload Dialog Component
interface DocumentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const DocumentUploadDialog = ({ open, onClose, onUpload }: DocumentUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Document</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
            fullWidth
          >
            Select Document
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
            />
          </Button>
          
          {selectedFile && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!selectedFile}
          >
            Upload Document
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PropertyManagement;