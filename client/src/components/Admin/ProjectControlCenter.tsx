import React, { useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, InputLabel, FormControl, Tabs, Tab, Grid,
  CircularProgress, Alert, Stack, InputAdornment
} from '@mui/material';
import {
  Edit, Delete, Add, FilterList, Visibility, Check, Block, ArrowDropDown,
  ArrowCircleUp, RemoveCircleOutline, MonetizationOn
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Interfaces
interface Project {
  id: number;
  name: string;
  location: string;
  description: string;
  type: 'residential' | 'commercial' | 'industrial' | 'mixed-use' | 'land';
  imageUrl: string;
  tier: string;
  targetReturn: string;
  minimumInvestment: number;
  term: number;
  totalFunding: number;
  currentFunding: number;
  numberOfInvestors: number;
  status: 'active' | 'pending' | 'completed' | 'suspended';
  daysLeft: number;
}

interface Investment {
  id: number;
  userId: number;
  username: string;
  email: string;
  propertyId: number;
  amount: number;
  status: string;
  createdAt: string;
  earnings: number;
}

interface ROIUpdate {
  projectId: number;
  monthlyReturn: number;
  totalReturn: number;
  payoutDate: string;
  notes: string;
}

// Project Form initial values
const initialProjectForm = {
  name: '',
  location: '',
  description: '',
  type: 'residential' as const,
  imageUrl: '',
  tier: 'standard',
  targetReturn: '',
  minimumInvestment: 100000,
  term: 36,
  totalFunding: 0,
  currentFunding: 0,
  status: 'pending' as const
};

// API functions
const fetchProjects = async () => {
  const response = await fetch('/api/admin/projects');
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
};

const fetchProjectInvestments = async (projectId: number) => {
  const response = await fetch(`/api/admin/projects/${projectId}/investments`);
  if (!response.ok) {
    throw new Error('Failed to fetch investments');
  }
  return response.json();
};

const createProject = async (project: typeof initialProjectForm) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/admin/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  
  return response.json();
};

const updateProject = async (project: Project) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/projects/${project.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update project');
  }
  
  return response.json();
};

const deleteProject = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
  
  return response.json();
};

const updateProjectROI = async (data: ROIUpdate) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/projects/${data.projectId}/roi`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update ROI');
  }
  
  return response.json();
};

// Main component
const ProjectControlCenter = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [projectForm, setProjectForm] = useState(initialProjectForm);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [roiDialogOpen, setRoiDialogOpen] = useState(false);
  const [roiForm, setRoiForm] = useState({
    projectId: 0,
    monthlyReturn: 0,
    totalReturn: 0,
    payoutDate: '',
    notes: ''
  });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  // Queries
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError 
  } = useQuery({
    queryKey: ['/api/admin/projects'],
    queryFn: fetchProjects
  });
  
  const { 
    data: investments = [], 
    isLoading: investmentsLoading,
    error: investmentsError,
    refetch: refetchInvestments
  } = useQuery({
    queryKey: ['/api/admin/projects', selectedProject, 'investments'],
    queryFn: () => selectedProject ? fetchProjectInvestments(selectedProject) : Promise.resolve([]),
    enabled: !!selectedProject
  });
  
  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
      setFormDialogOpen(false);
      setProjectForm(initialProjectForm);
      toast({
        title: 'Project created',
        description: 'The project has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create project',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
      setFormDialogOpen(false);
      setEditingProject(null);
      toast({
        title: 'Project updated',
        description: 'The project has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update project',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      toast({
        title: 'Project deleted',
        description: 'The project has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete project',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const updateROIMutation = useMutation({
    mutationFn: updateProjectROI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
      if (selectedProject) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/admin/projects', selectedProject, 'investments'] 
        });
      }
      setRoiDialogOpen(false);
      toast({
        title: 'ROI updated',
        description: 'The ROI has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update ROI',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Event handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenAddDialog = () => {
    setEditingProject(null);
    setProjectForm(initialProjectForm);
    setFormDialogOpen(true);
  };
  
  const handleOpenEditDialog = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      location: project.location,
      description: project.description,
      type: project.type,
      imageUrl: project.imageUrl,
      tier: project.tier,
      targetReturn: project.targetReturn,
      minimumInvestment: project.minimumInvestment,
      term: project.term,
      totalFunding: project.totalFunding,
      currentFunding: project.currentFunding,
      status: project.status
    });
    setFormDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (id: number) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleOpenROIDialog = (projectId: number) => {
    setRoiForm({
      projectId,
      monthlyReturn: 0,
      totalReturn: 0,
      payoutDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setRoiDialogOpen(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setProjectForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleROIFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setRoiForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmitProject = () => {
    if (editingProject) {
      updateProjectMutation.mutate({
        ...editingProject,
        ...projectForm
      });
    } else {
      createProjectMutation.mutate(projectForm);
    }
  };
  
  const handleDeleteProject = () => {
    if (projectToDelete !== null) {
      deleteProjectMutation.mutate(projectToDelete);
    }
  };
  
  const handleSubmitROI = () => {
    updateROIMutation.mutate(roiForm);
  };
  
  const handleViewInvestments = (projectId: number) => {
    setSelectedProject(projectId);
    refetchInvestments();
    setTabValue(1);
  };
  
  const handleStatusChange = (project: Project, newStatus: 'active' | 'pending' | 'completed' | 'suspended') => {
    updateProjectMutation.mutate({
      ...project,
      status: newStatus
    });
  };
  
  // Filter projects
  const filteredProjects = projects.filter((project: Project) => {
    return (
      (statusFilter === 'all' || project.status === statusFilter) &&
      (typeFilter === 'all' || project.type === typeFilter) &&
      (locationFilter === 'all' || project.location === locationFilter)
    );
  });
  
  // Get unique values for filters
  const locations = Array.from(new Set(projects.map((p: Project) => p.location)));
  const types = Array.from(new Set(projects.map((p: Project) => p.type)));
  
  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };
  
  // Loading and error states
  if (projectsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (projectsError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading projects: {(projectsError as Error).message}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project & Investment Control Center
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Projects" />
          <Tab label="Investments" disabled={!selectedProject} />
        </Tabs>
      </Box>
      
      {/* Projects Tab */}
      {tabValue === 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleOpenAddDialog}
            >
              Add New Project
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterList fontSize="small" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  startAdornment={<FilterList fontSize="small" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {types.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Location</InputLabel>
                <Select
                  value={locationFilter}
                  label="Location"
                  onChange={(e) => setLocationFilter(e.target.value)}
                  startAdornment={<FilterList fontSize="small" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Target ROI</TableCell>
                  <TableCell align="right">Funding Progress</TableCell>
                  <TableCell align="right">Investors</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No projects found. Create your first project!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project: Project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.location}</TableCell>
                      <TableCell>
                        <Chip 
                          label={project.type} 
                          size="small" 
                          color={
                            project.type === 'residential' ? 'primary' :
                            project.type === 'commercial' ? 'secondary' :
                            project.type === 'industrial' ? 'info' :
                            project.type === 'mixed-use' ? 'success' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={project.status} 
                          size="small" 
                          color={getStatusColor(project.status) as any}
                        />
                      </TableCell>
                      <TableCell align="right">{project.targetReturn}%</TableCell>
                      <TableCell align="right">
                        {`₦${project.currentFunding.toLocaleString()} / ₦${project.totalFunding.toLocaleString()}`}
                        <br />
                        {`(${Math.round((project.currentFunding / project.totalFunding) * 100)}%)`}
                      </TableCell>
                      <TableCell align="right">{project.numberOfInvestors}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            onClick={() => handleViewInvestments(project.id)}
                            title="View Investments"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(project)}
                            title="Edit Project"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(project.id)}
                            title="Delete Project"
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenROIDialog(project.id)}
                            title="Manage ROI"
                            color="success"
                          >
                            <MonetizationOn fontSize="small" />
                          </IconButton>
                          
                          {project.status !== 'active' && (
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(project, 'active')}
                              title="Activate Project"
                              color="success"
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          )}
                          
                          {project.status !== 'suspended' && (
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(project, 'suspended')}
                              title="Suspend Project"
                              color="error"
                            >
                              <Block fontSize="small" />
                            </IconButton>
                          )}
                          
                          {project.status !== 'completed' && (
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(project, 'completed')}
                              title="Mark as Completed"
                              color="info"
                            >
                              <ArrowCircleUp fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {/* Investments Tab */}
      {tabValue === 1 && selectedProject && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {projects.find((p: Project) => p.id === selectedProject)?.name} - Investments
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setTabValue(0)}
            >
              Back to Projects
            </Button>
          </Box>
          
          {investmentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : investmentsError ? (
            <Alert severity="error" sx={{ m: 2 }}>
              Error loading investments: {(investmentsError as Error).message}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Investor</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Earnings</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          No investments found for this project.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    investments.map((investment: Investment) => (
                      <TableRow key={investment.id}>
                        <TableCell>{investment.username}</TableCell>
                        <TableCell>{investment.email}</TableCell>
                        <TableCell align="right">₦{investment.amount.toLocaleString()}</TableCell>
                        <TableCell align="right">₦{investment.earnings.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={investment.status} 
                            size="small"
                            color={
                              investment.status === 'active' ? 'success' :
                              investment.status === 'pending' ? 'warning' :
                              investment.status === 'completed' ? 'info' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{new Date(investment.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      {/* Add/Edit Project Dialog */}
      <Dialog 
        open={formDialogOpen} 
        onClose={() => setFormDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={6}>
              <TextField
                name="name"
                label="Project Name"
                fullWidth
                value={projectForm.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                name="location"
                label="Location"
                fullWidth
                value={projectForm.location}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={projectForm.description}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Property Type</InputLabel>
                <Select
                  name="type"
                  value={projectForm.type}
                  onChange={handleFormChange}
                  label="Property Type"
                >
                  <MenuItem value="residential">Residential</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                  <MenuItem value="industrial">Industrial</MenuItem>
                  <MenuItem value="mixed-use">Mixed-Use</MenuItem>
                  <MenuItem value="land">Land</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <TextField
                name="imageUrl"
                label="Image URL"
                fullWidth
                value={projectForm.imageUrl}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Tier</InputLabel>
                <Select
                  name="tier"
                  value={projectForm.tier}
                  onChange={handleFormChange}
                  label="Tier"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="elite">Elite</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <TextField
                name="targetReturn"
                label="Target ROI %"
                fullWidth
                value={projectForm.targetReturn}
                onChange={handleFormChange}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                name="minimumInvestment"
                label="Minimum Investment"
                fullWidth
                type="number"
                value={projectForm.minimumInvestment}
                onChange={handleFormChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                }}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                name="term"
                label="Term (Months)"
                fullWidth
                type="number"
                value={projectForm.term}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                name="totalFunding"
                label="Total Funding Goal"
                fullWidth
                type="number"
                value={projectForm.totalFunding}
                onChange={handleFormChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                }}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                name="currentFunding"
                label="Current Funding"
                fullWidth
                type="number"
                value={projectForm.currentFunding}
                onChange={handleFormChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                }}
              />
            </Grid>
            <Grid xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={projectForm.status}
                  onChange={handleFormChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitProject}
            variant="contained"
            disabled={
              createProjectMutation.isPending || 
              updateProjectMutation.isPending ||
              !projectForm.name ||
              !projectForm.description
            }
          >
            {(createProjectMutation.isPending || updateProjectMutation.isPending) ? (
              <CircularProgress size={24} />
            ) : editingProject ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteProject}
            color="error"
            variant="contained"
            disabled={deleteProjectMutation.isPending}
          >
            {deleteProjectMutation.isPending ? (
              <CircularProgress size={24} />
            ) : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* ROI Management Dialog */}
      <Dialog
        open={roiDialogOpen}
        onClose={() => setRoiDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Update ROI</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={6}>
              <TextField
                name="monthlyReturn"
                label="Monthly Return Rate"
                fullWidth
                type="number"
                value={roiForm.monthlyReturn}
                onChange={handleROIFormChange}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                name="totalReturn"
                label="Total Return Amount"
                fullWidth
                type="number"
                value={roiForm.totalReturn}
                onChange={handleROIFormChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                }}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                name="payoutDate"
                label="Payout Date"
                fullWidth
                type="date"
                value={roiForm.payoutDate}
                onChange={handleROIFormChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                name="notes"
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={roiForm.notes}
                onChange={handleROIFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoiDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitROI}
            variant="contained"
            color="success"
            disabled={updateROIMutation.isPending}
          >
            {updateROIMutation.isPending ? (
              <CircularProgress size={24} />
            ) : 'Update ROI'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectControlCenter;