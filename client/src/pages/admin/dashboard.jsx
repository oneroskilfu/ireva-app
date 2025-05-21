import React, { useState, useEffect } from 'react';
import { DashboardLayout, StatCard, Card, Button, Progress, Badge, Tabs, Dialog, Input, Spinner } from '../../components/ui/DesignSystem';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { ErrorBoundaryWithMonitoring } from '../../components/ErrorBoundary';
import { 
  ChartPieIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
  PlusIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Format currency values
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number(value));
};

// Format percentage values
const formatPercent = (value) => {
  return `${Number(value).toFixed(2)}%`;
};

// Admin Dashboard main component
const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // API hook for dashboard data
  const dashboardApi = useApiRequest();
  
  // Load dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load different data based on active section
        if (activeSection === 'overview') {
          const [propertiesStats, investmentsStats] = await Promise.all([
            dashboardApi.get('properties/stats'),
            dashboardApi.get('investments/dashboard/stats')
          ]);
          
          setDashboardData({
            properties: propertiesStats.data,
            investments: investmentsStats.data
          });
        } else if (activeSection === 'properties') {
          const properties = await dashboardApi.get('properties');
          setDashboardData({ properties: properties.data });
        } else if (activeSection === 'investments') {
          const investments = await dashboardApi.get('investments/dashboard/stats');
          setDashboardData({ investments: investments.data });
        } else if (activeSection === 'users') {
          // Users section data would be loaded here
          // For now, using placeholder data
          setDashboardData({ users: { data: [] } });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [activeSection]);
  
  return (
    <DashboardLayout>
      <DashboardLayout.Sidebar>
        <div className="p-4 flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
            i
          </div>
          <h1 className="text-xl font-bold">iREVA Admin</h1>
        </div>
        
        <div className="mt-8 px-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs uppercase font-medium text-gray-500 px-2">Dashboard</p>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'overview' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('overview')}
              >
                <ChartPieIcon className="h-5 w-5" />
                <span>Overview</span>
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs uppercase font-medium text-gray-500 px-2">Property Management</p>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'properties' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('properties')}
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Properties</span>
              </button>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'add-property' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('add-property')}
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Property</span>
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs uppercase font-medium text-gray-500 px-2">Investment Management</p>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'investments' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('investments')}
              >
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>Investments</span>
              </button>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'roi-payments' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('roi-payments')}
              >
                <ArrowTrendingUpIcon className="h-5 w-5" />
                <span>ROI Payments</span>
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs uppercase font-medium text-gray-500 px-2">User Management</p>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'users' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('users')}
              >
                <UsersIcon className="h-5 w-5" />
                <span>Users</span>
              </button>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'kyc' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('kyc')}
              >
                <ShieldCheckIcon className="h-5 w-5" />
                <span>KYC Verification</span>
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs uppercase font-medium text-gray-500 px-2">Content Management</p>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'documents' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('documents')}
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>Documents</span>
              </button>
              <button 
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeSection === 'notifications' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveSection('notifications')}
              >
                <BellIcon className="h-5 w-5" />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout.Sidebar>
      
      <DashboardLayout.Content>
        <DashboardLayout.Header className="flex justify-between items-center px-6">
          <h1 className="text-xl font-bold">
            {activeSection === 'overview' && 'Dashboard Overview'}
            {activeSection === 'properties' && 'Property Management'}
            {activeSection === 'add-property' && 'Add New Property'}
            {activeSection === 'investments' && 'Investment Management'}
            {activeSection === 'roi-payments' && 'ROI Payments'}
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'kyc' && 'KYC Verification'}
            {activeSection === 'documents' && 'Document Management'}
            {activeSection === 'notifications' && 'Notification Management'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <BellIcon className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user?.name || 'Admin User'}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</div>
              </div>
            </div>
          </div>
        </DashboardLayout.Header>
        
        <div className="p-6">
          <ErrorBoundaryWithMonitoring componentName="AdminDashboardContent">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center">
                  <Spinner size="xl" />
                  <p className="mt-4 text-sm text-gray-500">Loading dashboard data...</p>
                </div>
              </div>
            ) : (
              <>
                {activeSection === 'overview' && (
                  <DashboardOverview data={dashboardData} />
                )}
                
                {activeSection === 'properties' && (
                  <PropertyManagement data={dashboardData?.properties} />
                )}
                
                {activeSection === 'add-property' && (
                  <AddProperty />
                )}
                
                {activeSection === 'investments' && (
                  <InvestmentManagement data={dashboardData?.investments} />
                )}
                
                {activeSection === 'roi-payments' && (
                  <ROIPayments />
                )}
                
                {activeSection === 'users' && (
                  <UserManagement />
                )}
                
                {activeSection === 'kyc' && (
                  <KYCVerification />
                )}
                
                {activeSection === 'documents' && (
                  <DocumentManagement />
                )}
                
                {activeSection === 'notifications' && (
                  <NotificationManagement />
                )}
              </>
            )}
          </ErrorBoundaryWithMonitoring>
        </div>
      </DashboardLayout.Content>
    </DashboardLayout>
  );
};

// Dashboard overview component
const DashboardOverview = ({ data }) => {
  if (!data) return <div>No dashboard data available</div>;
  
  const { properties, investments } = data;
  
  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={properties?.propertyTypes?.length || 0}
          icon={<BuildingOfficeIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Total Investments"
          value={formatCurrency(investments?.stats?.totalAmount || 0)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          trend="up"
          trendValue={`${investments?.stats?.totalInvestments || 0} investments`}
        />
        
        <StatCard
          title="Active Investors"
          value={investments?.stats?.totalInvestors || 0}
          icon={<UsersIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Average ROI"
          value={formatPercent(properties?.fundingStats?.avgROI || 0)}
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
        />
      </div>
      
      {/* Funding progress */}
      <Card>
        <Card.Header>
          <Card.Title>Funding Progress</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Overall Funding</h3>
              <span className="text-sm font-medium">
                {formatPercent(properties?.fundingStats?.fundingPercentage || 0)}
              </span>
            </div>
            
            <Progress 
              value={Number(properties?.fundingStats?.totalFundingProgress || 0)} 
              max={Number(properties?.fundingStats?.totalFundingGoal || 1)} 
            />
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {formatCurrency(properties?.fundingStats?.totalFundingProgress || 0)} raised
              </span>
              <span>
                Goal: {formatCurrency(properties?.fundingStats?.totalFundingGoal || 0)}
              </span>
            </div>
          </div>
        </Card.Content>
      </Card>
      
      {/* Properties by status */}
      <Card>
        <Card.Header>
          <Card.Title>Properties by Status</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="text-green-500 font-medium">Active</div>
              <div className="text-2xl font-bold mt-2">{properties?.statusCounts?.active || 0}</div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="text-yellow-500 font-medium">Pending</div>
              <div className="text-2xl font-bold mt-2">{properties?.statusCounts?.pending || 0}</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-blue-500 font-medium">Completed</div>
              <div className="text-2xl font-bold mt-2">{properties?.statusCounts?.completed || 0}</div>
            </div>
            
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="text-red-500 font-medium">Inactive</div>
              <div className="text-2xl font-bold mt-2">{properties?.statusCounts?.inactive || 0}</div>
            </div>
          </div>
        </Card.Content>
      </Card>
      
      {/* Recent investments */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Recent Investments</Card.Title>
            <Button variant="link">View All</Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Investor</th>
                  <th className="text-left p-2">Property</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments?.recentInvestments?.map((investment) => (
                  <tr key={investment.id} className="border-b">
                    <td className="p-2 font-medium">{investment.userName}</td>
                    <td className="p-2">{investment.propertyName}</td>
                    <td className="p-2">{formatCurrency(investment.amount)}</td>
                    <td className="p-2">{new Date(investment.investmentDate).toLocaleDateString()}</td>
                    <td className="p-2">
                      <Badge variant={investment.status === 'confirmed' ? 'success' : 'info'}>
                        {investment.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {(!investments?.recentInvestments || investments.recentInvestments.length === 0) && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No recent investments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
      
      {/* Top performing properties */}
      <Card>
        <Card.Header>
          <Card.Title>Top Performing Properties</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Property</th>
                  <th className="text-left p-2">Funding</th>
                  <th className="text-left p-2">Investors</th>
                  <th className="text-left p-2">Progress</th>
                </tr>
              </thead>
              <tbody>
                {investments?.topProperties?.map((property) => (
                  <tr key={property.propertyId} className="border-b">
                    <td className="p-2 font-medium">{property.propertyName}</td>
                    <td className="p-2">{formatCurrency(property.totalInvested)}</td>
                    <td className="p-2">{property.investorCount}</td>
                    <td className="p-2 w-[200px]">
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={Number(property.fundingPercentage)} 
                          max={100}
                          className="flex-grow" 
                        />
                        <span className="text-sm font-medium">
                          {formatPercent(property.fundingPercentage)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {(!investments?.topProperties || investments.topProperties.length === 0) && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No property data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// Property management component
const PropertyManagement = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  
  // API hook for property data
  const propertiesApi = useApiRequest();
  
  // Load properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        
        // Use data from parent if available, otherwise fetch
        if (data?.properties) {
          setProperties(data.properties);
        } else {
          const response = await propertiesApi.get('properties');
          setProperties(response.data.properties || []);
        }
      } catch (error) {
        console.error('Failed to load properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, [data]);
  
  // Filter properties by search term and status
  const filteredProperties = properties
    .filter(property => 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(property => 
      statusFilter === 'all' || property.status === statusFilter
    );
  
  // Handle property deletion
  const confirmDelete = (property) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      await propertiesApi.delete(`properties/${propertyToDelete.id}`);
      
      // Remove from local state
      setProperties(properties.filter(p => p.id !== propertyToDelete.id));
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Failed to delete property:', error);
      // Show error notification
    }
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const variants = {
      active: 'success',
      pending: 'warning',
      completed: 'info',
      inactive: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-auto">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <select
            className="border rounded-md p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>
      
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Property</th>
                  <th className="text-left p-4">Location</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">ROI</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Funding Progress</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{property.name}</div>
                    </td>
                    <td className="p-4">{property.location}</td>
                    <td className="p-4">{property.propertyType}</td>
                    <td className="p-4">{formatCurrency(property.price)}</td>
                    <td className="p-4">{formatPercent(property.roi)}</td>
                    <td className="p-4">
                      <StatusBadge status={property.status} />
                    </td>
                    <td className="p-4 w-[200px]">
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={Number(property.fundingProgress)} 
                          max={Number(property.fundingGoal)} 
                          className="flex-grow"
                        />
                        <span className="text-sm whitespace-nowrap">
                          {formatPercent(Number(property.fundingProgress) / Number(property.fundingGoal) * 100)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => confirmDelete(property)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredProperties.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No properties found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Delete confirmation dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <Dialog.Title>Delete Property</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete the property "{propertyToDelete?.name}"? This action cannot be undone.
        </Dialog.Description>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
};

// Add property component
const AddProperty = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    propertyType: '',
    price: '',
    size: '',
    roi: '',
    fundingGoal: '',
    minInvestment: '',
    maxInvestment: '',
    duration: '',
    status: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // API hook for property creation
  const propertyApi = useApiRequest();
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      // Convert numeric values
      const payload = {
        ...formData,
        price: Number(formData.price),
        size: Number(formData.size),
        roi: Number(formData.roi),
        fundingGoal: Number(formData.fundingGoal),
        minInvestment: Number(formData.minInvestment),
        maxInvestment: formData.maxInvestment ? Number(formData.maxInvestment) : null,
        duration: Number(formData.duration)
      };
      
      // Submit to API
      await propertyApi.post('properties', payload);
      
      // Show success message
      setSuccess('Property created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        location: '',
        propertyType: '',
        price: '',
        size: '',
        roi: '',
        fundingGoal: '',
        minInvestment: '',
        maxInvestment: '',
        duration: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Failed to create property:', error);
      setError(error.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Add New Property</Card.Title>
          <Card.Description>
            Create a new property listing for investors
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location <span className="text-red-500">*</span>
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                  required
                >
                  <option value="">Select property type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="land">Land</option>
                  <option value="mixed-use">Mixed-Use</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <Input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Size (sq ft) <span className="text-red-500">*</span>
                </label>
                <Input
                  name="size"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.size}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  ROI (%) <span className="text-red-500">*</span>
                </label>
                <Input
                  name="roi"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.roi}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Funding Goal ($) <span className="text-red-500">*</span>
                </label>
                <Input
                  name="fundingGoal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fundingGoal}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Minimum Investment ($) <span className="text-red-500">*</span>
                </label>
                <Input
                  name="minInvestment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minInvestment}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Maximum Investment ($)
                </label>
                <Input
                  name="maxInvestment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxInvestment}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Duration (months) <span className="text-red-500">*</span>
                </label>
                <Input
                  name="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full border rounded-md p-2"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creating Property...
                  </>
                ) : 'Create Property'}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

// Investment management component
const InvestmentManagement = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">No investment data available</p>
      </div>
    );
  }
  
  const { stats, statusCounts, recentInvestments, topProperties } = data;
  
  return (
    <div className="space-y-6">
      {/* Investment stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Investments"
          value={stats.totalInvestments}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Total Amount"
          value={formatCurrency(stats.totalAmount)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Average Investment"
          value={formatCurrency(stats.avgAmount)}
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Total Investors"
          value={stats.totalInvestors}
          icon={<UsersIcon className="h-6 w-6" />}
        />
      </div>
      
      {/* Investment by status */}
      <Card>
        <Card.Header>
          <Card.Title>Investments by Status</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="text-green-500 font-medium">Confirmed</div>
              <div className="text-2xl font-bold mt-2">{statusCounts.confirmed || 0}</div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="text-yellow-500 font-medium">Pending</div>
              <div className="text-2xl font-bold mt-2">{statusCounts.pending || 0}</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-blue-500 font-medium">Completed</div>
              <div className="text-2xl font-bold mt-2">{statusCounts.completed || 0}</div>
            </div>
            
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="text-red-500 font-medium">Cancelled</div>
              <div className="text-2xl font-bold mt-2">{statusCounts.cancelled || 0}</div>
            </div>
          </div>
        </Card.Content>
      </Card>
      
      {/* Recent investments */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Recent Investments</Card.Title>
            <Button variant="outline">
              Export CSV
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Investor</th>
                  <th className="text-left p-3">Property</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvestments?.map((investment) => (
                  <tr key={investment.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{investment.userName}</td>
                    <td className="p-3">{investment.propertyName}</td>
                    <td className="p-3">{formatCurrency(investment.amount)}</td>
                    <td className="p-3">{new Date(investment.investmentDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          investment.status === 'confirmed' ? 'success' :
                          investment.status === 'pending' ? 'warning' :
                          investment.status === 'completed' ? 'info' :
                          'destructive'
                        }
                      >
                        {investment.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Update Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {(!recentInvestments || recentInvestments.length === 0) && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No recent investments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
      
      {/* Monthly investment trends */}
      <Card>
        <Card.Header>
          <Card.Title>Monthly Investment Trends</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8 text-gray-500">
            <p>Chart visualization of monthly investment trends will be displayed here</p>
            <p className="text-sm mt-2">Coming soon in the next update</p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// ROI Payments component
const ROIPayments = () => {
  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Manage ROI Payments</Card.Title>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Schedule New Payment
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <Tabs>
            <Tabs.List>
              <Tabs.Trigger active={true}>Upcoming</Tabs.Trigger>
              <Tabs.Trigger>Completed</Tabs.Trigger>
              <Tabs.Trigger>Pending</Tabs.Trigger>
              <Tabs.Trigger>Failed</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content>
              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Property</th>
                        <th className="text-left p-3">Investor</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Scheduled Date</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">
                          No upcoming ROI payments scheduled
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Tabs.Content>
          </Tabs>
        </Card.Content>
      </Card>
      
      <Card>
        <Card.Header>
          <Card.Title>ROI Payment Analytics</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total ROI Payments"
              value={formatCurrency(0)}
              icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
            />
            
            <StatCard
              title="Average ROI Payment"
              value={formatCurrency(0)}
              icon={<ChartPieIcon className="h-6 w-6" />}
            />
            
            <StatCard
              title="Pending Payments"
              value={0}
              icon={<CalendarIcon className="h-6 w-6" />}
            />
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// User management component
const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading users
  useEffect(() => {
    // This would be an API call in a real app
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'investor',
          status: 'active',
          createdAt: '2023-01-15T10:30:00Z',
          kycStatus: 'verified'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'investor',
          status: 'active',
          createdAt: '2023-02-20T14:15:00Z',
          kycStatus: 'pending'
        },
        {
          id: 3,
          name: 'Admin User',
          email: 'admin@ireva.com',
          role: 'admin',
          status: 'active',
          createdAt: '2022-12-01T09:00:00Z',
          kycStatus: 'verified'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filter users by search term and role
  const filteredUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(user => 
      roleFilter === 'all' || user.role === roleFilter
    );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-auto">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <select
            className="border rounded-md p-2"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="investor">Investors</option>
            <option value="admin">Administrators</option>
          </select>
          
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
      
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">KYC Status</th>
                  <th className="text-left p-4">Joined</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{user.name}</div>
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4 capitalize">{user.role}</td>
                    <td className="p-4">
                      <Badge 
                        variant={
                          user.kycStatus === 'verified' ? 'success' :
                          user.kycStatus === 'pending' ? 'warning' :
                          'destructive'
                        }
                      >
                        {user.kycStatus}
                      </Badge>
                    </td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      No users found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// KYC Verification component
const KYCVerification = () => {
  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Pending KYC Verifications</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Document Type</th>
                  <th className="text-left p-3">Submitted</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No pending KYC verifications
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Verifications"
          value={0}
          icon={<UsersIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Approved"
          value={0}
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Rejected"
          value={0}
          icon={<XCircleIcon className="h-6 w-6" />}
        />
      </div>
    </div>
  );
};

// Document management component
const DocumentManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Property Documents</Card.Title>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-gray-500">No property documents available</p>
          </div>
        </Card.Content>
      </Card>
      
      <Card>
        <Card.Header>
          <Card.Title>Investment Documents</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-gray-500">No investment documents available</p>
          </div>
        </Card.Content>
      </Card>
      
      <Card>
        <Card.Header>
          <Card.Title>User Documents</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-gray-500">No user documents available</p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// Notification management component
const NotificationManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Send New Notification</Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Recipients
              </label>
              <select className="w-full border rounded-md p-2">
                <option>All Users</option>
                <option>Investors Only</option>
                <option>Administrators Only</option>
                <option>Specific Users</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Notification Title
              </label>
              <Input />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Message
              </label>
              <textarea
                rows="4"
                className="w-full border rounded-md p-2"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <Button>
                Send Notification
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
      
      <Card>
        <Card.Header>
          <Card.Title>Recent Notifications</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-gray-500">No notifications have been sent yet</p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboard;