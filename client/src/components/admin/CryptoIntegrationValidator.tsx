import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import WebhookIcon from '@mui/icons-material/Webhook';

// Define types for validation response
interface ValidationItem {
  name: string;
  status: 'success' | 'error' | 'pending';
  details?: string;
}

interface ValidationSection {
  title: string;
  items: ValidationItem[];
  icon: string;
}

interface ValidationResult {
  sections: ValidationSection[];
}

const CryptoIntegrationValidator: React.FC = () => {
  const [expanded, setExpanded] = useState(true);

  // Fetch validation status
  const { data, isLoading, error } = useQuery<ValidationResult>({
    queryKey: ['/api/admin/crypto-validate/validate'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/crypto-validate/validate');
      return response.json();
    },
    refetchInterval: 0, // Only fetch on demand
  });

  // Render icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'pending':
      default:
        return <PendingIcon color="warning" />;
    }
  };

  // Get icon component based on icon name string
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'CodeIcon':
        return <CodeIcon color="primary" />;
      case 'SecurityIcon':
        return <SecurityIcon color="primary" />;
      case 'StorageIcon':
        return <StorageIcon color="primary" />;
      case 'WebhookIcon':
        return <WebhookIcon color="primary" />;
      default:
        return <CodeIcon color="primary" />;
    }
  };

  // Calculate overall status for a section
  const getSectionStatus = (items: ValidationItem[]) => {
    if (items.every(item => item.status === 'success')) {
      return 'success';
    } else if (items.some(item => item.status === 'error')) {
      return 'error';
    } else {
      return 'pending';
    }
  };

  // Calculate overall validation status
  const getOverallStatus = () => {
    if (!data) return 'pending';
    
    const allSections = data.sections || [];
    if (allSections.every(section => getSectionStatus(section.items) === 'success')) {
      return 'success';
    } else if (allSections.some(section => getSectionStatus(section.items) === 'error')) {
      return 'error';
    } else {
      return 'pending';
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <CodeIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h5">Crypto Integration Validator</Typography>
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" padding={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <ErrorIcon fontSize="large" color="error" sx={{ mr: 2 }} />
            <Typography variant="h5">Validation Error</Typography>
          </Box>
          <Alert severity="error">
            Error running validation: {error instanceof Error ? error.message : "Unknown error"}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <CodeIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h5">Crypto Integration Validator</Typography>
          <Box flexGrow={1} />
          {getStatusIcon(overallStatus)}
        </Box>
        
        <Alert 
          severity={
            overallStatus === 'success' ? 'success' : 
            overallStatus === 'error' ? 'error' : 'info'
          }
          sx={{ mb: 3 }}
        >
          {overallStatus === 'success' ? 
            'All integration components are properly configured!' : 
            overallStatus === 'error' ? 
            'There are issues with your crypto integration that need to be resolved.' :
            'Validation is in progress...'
          }
        </Alert>
        
        {data && data.sections && data.sections.map((section, sectionIndex) => (
          <Box key={sectionIndex} mb={3}>
            <Box 
              display="flex" 
              alignItems="center" 
              bgcolor={getSectionStatus(section.items) === 'success' ? '#f0f7f0' : '#f5f5f5'} 
              p={2} 
              borderRadius={1}
              mb={2}
            >
              {getIconComponent(section.icon)}
              <Typography variant="h6" ml={1}>
                {section.title}
              </Typography>
              <Box flexGrow={1} />
              {getStatusIcon(getSectionStatus(section.items))}
            </Box>
            
            <Box pl={2}>
              {section.items.map((item, itemIndex) => (
                <Box 
                  key={itemIndex} 
                  display="flex" 
                  alignItems="center" 
                  py={1}
                  borderBottom={itemIndex < section.items.length - 1 ? '1px solid #eee' : 'none'}
                >
                  <Box width={24} mr={1}>
                    {getStatusIcon(item.status)}
                  </Box>
                  <Box flexGrow={1}>
                    <Typography variant="body1">{item.name}</Typography>
                    {item.details && (
                      <Typography variant="body2" color="textSecondary">
                        {item.details}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default CryptoIntegrationValidator;