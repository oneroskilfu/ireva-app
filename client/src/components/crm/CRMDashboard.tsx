import React, { useState } from 'react';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import {
  Message as MessageIcon,
  List as ListIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import MessageComposer from './MessageComposer';
import CommunicationList from './CommunicationList';
import SegmentManager from './SegmentManager';
import { Communication } from '../../hooks/useCommunications';

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
      id={`crm-tabpanel-${index}`}
      aria-labelledby={`crm-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `crm-tab-${index}`,
    'aria-controls': `crm-tabpanel-${index}`,
  };
}

const CRMDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditCommunication = (communication: Communication) => {
    setSelectedCommunication(communication);
    setTabValue(0); // Switch to composer tab
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Communications Manager
      </Typography>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="CRM tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label="Compose Message" 
              icon={<MessageIcon />} 
              iconPosition="start" 
              {...a11yProps(0)} 
            />
            <Tab 
              label="Messages" 
              icon={<ListIcon />} 
              iconPosition="start" 
              {...a11yProps(1)} 
            />
            <Tab 
              label="User Segments" 
              icon={<GroupIcon />} 
              iconPosition="start" 
              {...a11yProps(2)} 
            />
            <Tab 
              label="Analytics" 
              icon={<AnalyticsIcon />} 
              iconPosition="start" 
              {...a11yProps(3)} 
              disabled 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <MessageComposer />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <CommunicationList onEdit={handleEditCommunication} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <SegmentManager />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography variant="h6" color="text.secondary">
              Analytics Dashboard Coming Soon
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default CRMDashboard;