import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Container,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  LinearProgress,
  Alert
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import RoiManagement from '../../components/admin/RoiManagement';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { apiRequest } from '../../lib/queryClient';

/**
 * Admin ROI Management Page
 * Allows administrators to manage ROI distributions and payout schedules
 * across all properties on the platform
 */
const ROIManagementPage = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);

  // Fetch all properties
  const { data: properties, isLoading: propertiesLoading, error: propertiesError } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => apiRequest("GET", "/api/admin/properties").then(res => res.json()),
  });

  // Set first property as selected when data loads
  useEffect(() => {
    if (properties && properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Handle property change
  const handlePropertyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedProperty(event.target.value as string);
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Find the selected property
  const currentProperty = properties?.find(p => p.id === selectedProperty);

  if (propertiesLoading) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ROI Management
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Container>
      </AdminLayout>
    );
  }

  if (propertiesError) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ROI Management
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load properties. Please try again.
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ROI Management
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Property ROI" />
            <Tab label="Overview" />
            <Tab label="Reports" />
          </Tabs>
          
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="property-select-label">Property</InputLabel>
            <Select
              labelId="property-select-label"
              value={selectedProperty}
              onChange={handlePropertyChange}
              label="Property"
              size="small"
            >
              {properties && properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name || property.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {currentProperty && <RoiManagement property={currentProperty} />}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Platform ROI Overview</Typography>
            <Typography variant="body1">
              This section will contain platform-wide ROI statistics and metrics.
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>ROI Reports</Typography>
            <Typography variant="body1">
              This section will contain ROI reporting and analytics features.
            </Typography>
          </Box>
        </TabPanel>
      </Container>
    </AdminLayout>
  );
};

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`roi-tabpanel-${index}`}
      aria-labelledby={`roi-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default ROIManagementPage;