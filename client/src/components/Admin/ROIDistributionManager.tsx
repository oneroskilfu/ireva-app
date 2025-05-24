import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PercentOutlined,
  AccountBalanceWallet,
  CalculateOutlined,
  HistoryOutlined,
  InfoOutlined
} from '@mui/icons-material';
import { useAuth } from '@/hooks/use-auth';
import axios from 'axios';

interface Project {
  _id: string;
  name: string;
  targetReturn: string;
  currentFunding: number;
  numberOfInvestors: number;
}

interface ROIDistribution {
  _id: string;
  projectId: string;
  investorId: string;
  investmentId: string;
  amount: number;
  distributionDate: string;
  status: string;
  investorName?: string;
  projectName?: string;
}

interface ProjectSummary {
  _id: string;
  total: number;
  projectName?: string;
}

const ROIDistributionManager: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [roiPercentage, setRoiPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [distributions, setDistributions] = useState<ROIDistribution[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [roiSummary, setRoiSummary] = useState<{
    totalDistributed: number,
    projectDistributions: ProjectSummary[],
    monthlyDistributions: {_id: {month: number, year: number}, total: number}[]
  } | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchRoiSummary();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/properties');
      setProjects(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setIsLoading(false);
      showSnackbar('Failed to fetch projects', 'error');
    }
  };

  const fetchRoiSummary = async () => {
    try {
      const response = await axios.get('/api/roi-distribution/summary');
      
      // Fetch project names for each project distribution
      const projectsResponse = await axios.get('/api/admin/properties');
      const projectsMap = new Map();
      
      projectsResponse.data.forEach((project: Project) => {
        projectsMap.set(project._id, project.name);
      });
      
      const projectDistributionsWithNames = response.data.projectDistributions.map(
        (dist: ProjectSummary) => ({
          ...dist,
          projectName: projectsMap.get(dist._id) || 'Unknown Project'
        })
      );
      
      setRoiSummary({
        ...response.data,
        projectDistributions: projectDistributionsWithNames
      });
    } catch (error) {
      console.error('Error fetching ROI summary:', error);
      showSnackbar('Failed to fetch ROI summary', 'error');
    }
  };

  const fetchProjectROIHistory = async (projectId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/roi-distribution/project/${projectId}`);
      
      // Get investor names
      const distributionsWithNames = await Promise.all(
        response.data.map(async (dist: ROIDistribution) => {
          try {
            const userResponse = await axios.get(`/api/admin/users/${dist.investorId}`);
            const userName = userResponse.data ? 
              `${userResponse.data.firstName} ${userResponse.data.lastName}` : 
              'Unknown Investor';
            
            return {
              ...dist,
              investorName: userName
            };
          } catch (error) {
            return {
              ...dist,
              investorName: 'Unknown Investor'
            };
          }
        })
      );
      
      setDistributions(distributionsWithNames);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching ROI history:', error);
      setIsLoading(false);
      showSnackbar('Failed to fetch ROI history', 'error');
    }
  };

  const handleDistributeROI = async () => {
    if (!selectedProject) {
      showSnackbar('Please select a project', 'error');
      return;
    }

    if (roiPercentage <= 0) {
      showSnackbar('ROI percentage must be greater than 0', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/roi-distribution/distribute', {
        projectId: selectedProject,
        roiPercentage
      });
      
      setIsLoading(false);
      showSnackbar('ROI distributed successfully', 'success');
      setOpenDialog(false);
      
      // Refresh ROI summary
      fetchRoiSummary();
    } catch (error) {
      console.error('Error distributing ROI:', error);
      setIsLoading(false);
      showSnackbar('Failed to distribute ROI', 'error');
    }
  };

  const handleOpenHistoryDialog = async () => {
    if (!selectedProject) {
      showSnackbar('Please select a project', 'error');
      return;
    }
    
    await fetchProjectROIHistory(selectedProject);
    setOpenHistoryDialog(true);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthName = (monthNum: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNum - 1];
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ROI Distribution Management
      </Typography>
      
      {/* ROI Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ROI Distribution Summary
        </Typography>
        
        {roiSummary ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Total ROI Distributed: {formatCurrency(roiSummary.totalDistributed)}
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Top Projects by ROI Distribution
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell align="right">Total Distributed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roiSummary.projectDistributions.map((dist) => (
                    <TableRow key={dist._id}>
                      <TableCell>{dist.projectName}</TableCell>
                      <TableCell align="right">{formatCurrency(dist.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Monthly ROI Distribution
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Total Distributed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roiSummary.monthlyDistributions.map((dist) => (
                    <TableRow key={`${dist._id.year}-${dist._id.month}`}>
                      <TableCell>{getMonthName(dist._id.month)} {dist._id.year}</TableCell>
                      <TableCell align="right">{formatCurrency(dist.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
      
      {/* ROI Distribution Form */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Distribute ROI to Investors
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="project-select-label">Select Project</InputLabel>
          <Select
            labelId="project-select-label"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            label="Select Project"
          >
            {projects.map((project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="ROI Percentage"
          type="number"
          value={roiPercentage}
          onChange={(e) => setRoiPercentage(Number(e.target.value))}
          InputProps={{
            startAdornment: <PercentOutlined sx={{ mr: 1, color: 'action.active' }} />,
            inputProps: { min: 0, step: 0.01 }
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CalculateOutlined />}
            onClick={() => setOpenDialog(true)}
            disabled={!selectedProject || roiPercentage <= 0 || isLoading}
          >
            Calculate & Distribute ROI
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HistoryOutlined />}
            onClick={handleOpenHistoryDialog}
            disabled={!selectedProject || isLoading}
          >
            View Distribution History
          </Button>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirm ROI Distribution</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to distribute {roiPercentage}% ROI to all investors in the selected project. 
            This will:
            <ul>
              <li>Create ROI distribution records</li>
              <li>Update investor wallet balances</li>
              <li>Generate transaction records for each payment</li>
            </ul>
            This action cannot be undone. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDistributeROI} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Confirm Distribution'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Distribution History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          ROI Distribution History
          <IconButton
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenHistoryDialog(false)}
          >
            <InfoOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : distributions.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Investor</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Distribution Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {distributions.map((dist) => (
                    <TableRow key={dist._id}>
                      <TableCell>{dist.investorName}</TableCell>
                      <TableCell>{formatCurrency(dist.amount)}</TableCell>
                      <TableCell>{formatDate(dist.distributionDate)}</TableCell>
                      <TableCell>{dist.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1">
                No distribution history found for this project.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ROIDistributionManager;