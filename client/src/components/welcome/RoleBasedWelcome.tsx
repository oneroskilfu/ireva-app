import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, Typography, Box, Button, Stepper, Step, StepLabel, IconButton, Paper } from '@mui/material';
import { X, ArrowRight, Check, Building2, Users, LineChart, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

interface RoleBasedWelcomeProps {
  open: boolean;
  onClose: () => void;
}

const RoleBasedWelcome: React.FC<RoleBasedWelcomeProps> = ({ open, onClose }) => {
  const { user, role } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const isAdmin = role === 'admin';

  // Define steps based on user role
  const adminSteps = [
    { label: 'Welcome', icon: <Building2 size={24} /> },
    { label: 'User Management', icon: <Users size={24} /> },
    { label: 'Properties', icon: <LineChart size={24} /> },
    { label: 'Platform Settings', icon: <Settings size={24} /> },
  ];

  const investorSteps = [
    { label: 'Welcome', icon: <Building2 size={24} /> },
    { label: 'Browse Properties', icon: <LineChart size={24} /> },
    { label: 'Make Investments', icon: <Check size={24} /> },
    { label: 'Track Performance', icon: <LineChart size={24} /> },
  ];

  const steps = isAdmin ? adminSteps : investorSteps;

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Complete welcome process
  const handleComplete = () => {
    // In a real app, you would save this to user preferences
    localStorage.setItem('welcomeCompleted', 'true');
    onClose();
  };

  // Admin Welcome Content
  const AdminWelcomeContent = () => (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Welcome to iREVA Admin Panel
      </Typography>
      <Typography variant="body1" paragraph>
        As an administrator, you have access to manage all aspects of the iREVA real estate investment platform.
      </Typography>
      <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {[
          { title: 'Users', count: '128', icon: <Users size={32} />, color: '#4CAF50' },
          { title: 'Properties', count: '36', icon: <Building2 size={32} />, color: '#2196F3' },
          { title: 'Investments', count: '₦24.5M', icon: <LineChart size={32} />, color: '#FF9800' },
          { title: 'Messages', count: '12', icon: <AlertCircle size={32} />, color: '#F44336' },
        ].map((stat, index) => (
          <Paper 
            key={index} 
            elevation={2} 
            sx={{ 
              p: 2, 
              minWidth: 150, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderTop: `4px solid ${stat.color}`
            }}
          >
            <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
            <Typography variant="h5" fontWeight="bold">{stat.count}</Typography>
            <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  // Admin User Management Content
  const AdminUserManagementContent = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        User Management
      </Typography>
      <Typography variant="body1" paragraph>
        You can manage all platform users, including investors and other administrators.
      </Typography>
      <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">Key Capabilities:</Typography>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>View comprehensive user profiles and investment history</li>
          <li>Manage user roles and permissions</li>
          <li>Handle KYC verification for new investors</li>
          <li>Monitor user activity and engagement</li>
        </ul>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <img 
          src="https://via.placeholder.com/600x200?text=User+Management+Dashboard" 
          alt="User Management Interface" 
          style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e0e0e0' }}
        />
      </Box>
    </Box>
  );

  // Admin Properties Content
  const AdminPropertiesContent = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Property Management
      </Typography>
      <Typography variant="body1" paragraph>
        List, manage, and track all investment properties on the platform.
      </Typography>
      <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">Key Functions:</Typography>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Add new properties with full details and documentation</li>
          <li>Track investment progress and funding status</li>
          <li>Manage property performance metrics</li>
          <li>Handle property developer relationships</li>
        </ul>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <img 
          src="https://via.placeholder.com/600x200?text=Property+Management" 
          alt="Property Management Interface" 
          style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e0e0e0' }}
        />
      </Box>
    </Box>
  );

  // Admin Settings Content
  const AdminSettingsContent = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Platform Settings
      </Typography>
      <Typography variant="body1" paragraph>
        Configure global platform settings and customize the user experience.
      </Typography>
      <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">Configuration Options:</Typography>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Set minimum and maximum investment amounts</li>
          <li>Configure platform fees and commission structures</li>
          <li>Manage referral programs and incentives</li>
          <li>Toggle security features like KYC requirements</li>
          <li>Enable/disable platform features</li>
        </ul>
      </Box>
      <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary', fontStyle: 'italic' }}>
        Remember that changes to platform settings affect all users and may have significant business implications.
        Always review changes carefully before saving.
      </Typography>
    </Box>
  );

  // Investor Welcome Content 
  const InvestorWelcomeContent = () => (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Welcome to iREVA
      </Typography>
      <Typography variant="body1" paragraph>
        Your gateway to Nigerian real estate investment opportunities.
      </Typography>
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <img 
          src="https://via.placeholder.com/600x250?text=iREVA+Investment+Platform" 
          alt="iREVA Platform Welcome" 
          style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e0e0e0' }}
        />
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
        As an investor, you can:
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        {[
          { title: 'Browse Properties', description: 'Explore vetted Nigerian real estate opportunities' },
          { title: 'Diversify Investment', description: 'Invest in multiple properties with as little as ₦100,000' },
          { title: 'Track Performance', description: 'Monitor ROI and property value in real-time' },
          { title: 'Earn Returns', description: 'Generate passive income through rental yields and capital appreciation' },
        ].map((feature, index) => (
          <Paper 
            key={index} 
            elevation={1} 
            sx={{ 
              p: 2, 
              maxWidth: 250,
              minWidth: { xs: '100%', sm: 220 },
              display: 'flex', 
              flexDirection: 'column'
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">{feature.title}</Typography>
            <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  // Investor Browse Properties Content
  const InvestorBrowseContent = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Browse Investment Properties
      </Typography>
      <Typography variant="body1" paragraph>
        Explore a diverse range of high-quality Nigerian real estate opportunities.
      </Typography>
      <Box sx={{ my: 3, textAlign: 'center' }}>
        <img 
          src="https://via.placeholder.com/600x250?text=Property+Listings" 
          alt="Property Listings" 
          style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e0e0e0' }}
        />
      </Box>
      <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">Property Features:</Typography>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Filter by location, property type, and expected ROI</li>
          <li>View detailed property information, documentation, and developer history</li>
          <li>Compare multiple properties side-by-side</li>
          <li>Save favorites for later review</li>
        </ul>
      </Box>
    </Box>
  );

  // Investor Invest Content
  const InvestorInvestContent = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Make Your First Investment
      </Typography>
      <Typography variant="body1" paragraph>
        Investing in Nigerian real estate has never been easier.
      </Typography>
      <Box sx={{ my: 3, textAlign: 'center' }}>
        <img 
          src="https://via.placeholder.com/600x200?text=Investment+Process"

          alt="Investment Process" 
          style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e0e0e0' }}
        />
      </Box>
      <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">Investment Steps:</Typography>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Select a property and review all details</li>
          <li>Choose your investment amount (minimum ₦100,000)</li>
          <li>Complete the secure Paystack payment process</li>
          <li>Receive your investment certificate and track your returns</li>
        </ol>
      </Box>
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        All investments have a standard 5-year maturity period with the option to reinvest.
      </Typography>
    </Box>
  );

  // Investor Track Content
  const InvestorTrackContent = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Track Your Investment
      </Typography>
      <Typography variant="body1" paragraph>
        Monitor performance and returns in real-time.
      </Typography>
      <Box sx={{ my: 3, textAlign: 'center' }}>
        <img 
          src="https://via.placeholder.com/600x250?text=Performance+Dashboard" 
          alt="Performance Dashboard" 
          style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e0e0e0' }}
        />
      </Box>
      <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">Tracking Features:</Typography>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>View real-time ROI calculations and projections</li>
          <li>Track property value appreciation</li>
          <li>Monitor rental income and distributions</li>
          <li>Receive quarterly performance reports</li>
          <li>Access detailed transaction history</li>
        </ul>
      </Box>
      <Typography variant="body1" sx={{ mt: 3, fontWeight: 'medium' }}>
        Get Started Today!
      </Typography>
      <Typography variant="body2">
        Complete your profile, verify your identity, and make your first investment to start building wealth through Nigerian real estate.
      </Typography>
    </Box>
  );

  // Render content based on user role and active step
  const renderStepContent = () => {
    if (isAdmin) {
      switch (activeStep) {
        case 0:
          return <AdminWelcomeContent />;
        case 1:
          return <AdminUserManagementContent />;
        case 2:
          return <AdminPropertiesContent />;
        case 3:
          return <AdminSettingsContent />;
        default:
          return null;
      }
    } else {
      switch (activeStep) {
        case 0:
          return <InvestorWelcomeContent />;
        case 1:
          return <InvestorBrowseContent />;
        case 2:
          return <InvestorInvestContent />;
        case 3:
          return <InvestorTrackContent />;
        default:
          return null;
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          minHeight: { xs: '50vh', md: '60vh' }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {isAdmin ? 'Admin Onboarding' : 'Welcome to iREVA'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ px: 4, pt: 2 }}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel StepIconProps={{ icon: step.icon }}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <DialogContent>
        {renderStepContent()}
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={handleBack} 
            disabled={activeStep === 0}
            variant="outlined"
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button 
                onClick={handleComplete} 
                variant="contained" 
                color="primary"
                endIcon={<Check size={18} />}
              >
                Complete
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                variant="contained" 
                color="primary"
                endIcon={<ArrowRight size={18} />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RoleBasedWelcome;