import React, { useState, useEffect } from 'react';
import { DashboardLayout, StatCard, Card, Button, Progress, Badge, Tabs } from '../../components/ui/DesignSystem';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { ErrorBoundaryWithMonitoring } from '../../components/ErrorBoundary';
import { 
  ChartPieIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  WalletIcon,
  DocumentIcon
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

// Status badge component for investments
const StatusBadge = ({ status }) => {
  const variants = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'default',
    refunded: 'destructive'
  };
  
  return (
    <Badge variant={variants[status] || 'default'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Investor Dashboard main component
const InvestorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // API hook for investments data
  const investmentsApi = useApiRequest();
  
  // Load portfolio data on component mount
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setIsLoading(true);
        const data = await investmentsApi.get('investments/my-investments');
        setPortfolioData(data);
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolioData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <DashboardLayout>
      <DashboardLayout.Sidebar>
        <div className="p-4 flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
            i
          </div>
          <h1 className="text-xl font-bold">iREVA</h1>
        </div>
        
        <div className="mt-8 px-4">
          <div className="space-y-1">
            <button 
              className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeTab === 'overview' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => handleTabChange('overview')}
            >
              <ChartPieIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            
            <button 
              className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeTab === 'properties' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => handleTabChange('properties')}
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              <span>Properties</span>
            </button>
            
            <button 
              className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeTab === 'investments' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => handleTabChange('investments')}
            >
              <CurrencyDollarIcon className="h-5 w-5" />
              <span>My Investments</span>
            </button>
            
            <button 
              className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeTab === 'returns' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => handleTabChange('returns')}
            >
              <ArrowTrendingUpIcon className="h-5 w-5" />
              <span>Returns & Earnings</span>
            </button>
            
            <button 
              className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeTab === 'wallet' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => handleTabChange('wallet')}
            >
              <WalletIcon className="h-5 w-5" />
              <span>Wallet</span>
            </button>
            
            <button 
              className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md ${activeTab === 'documents' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => handleTabChange('documents')}
            >
              <DocumentIcon className="h-5 w-5" />
              <span>Documents</span>
            </button>
          </div>
        </div>
      </DashboardLayout.Sidebar>
      
      <DashboardLayout.Content>
        <DashboardLayout.Header className="flex justify-between items-center px-6">
          <h1 className="text-xl font-bold">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'properties' && 'Investment Properties'}
            {activeTab === 'investments' && 'My Investments'}
            {activeTab === 'returns' && 'Returns & Earnings'}
            {activeTab === 'wallet' && 'My Wallet'}
            {activeTab === 'documents' && 'Documents'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role || 'Investor'}</div>
              </div>
            </div>
          </div>
        </DashboardLayout.Header>
        
        <div className="p-6">
          <ErrorBoundaryWithMonitoring componentName="InvestorDashboardContent">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-gray-500">Loading your investment data...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <DashboardOverview data={portfolioData} />
                )}
                
                {activeTab === 'investments' && (
                  <InvestmentsList data={portfolioData} />
                )}
                
                {activeTab === 'properties' && (
                  <PropertiesList />
                )}
                
                {activeTab === 'returns' && (
                  <ReturnsEarnings data={portfolioData} />
                )}
                
                {activeTab === 'wallet' && (
                  <WalletView user={user} />
                )}
                
                {activeTab === 'documents' && (
                  <DocumentsList />
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
  if (!data) return <div>No portfolio data available</div>;
  
  const { investments, stats, roiPayments } = data.data;
  
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <Card className="bg-gradient-to-r from-primary to-primary-600 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Investment Dashboard</h2>
          <p className="opacity-90 max-w-xl mb-4">
            Track your real estate investments, monitor returns, and discover new opportunities to grow your portfolio.
          </p>
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Explore New Properties
          </Button>
        </div>
      </Card>
      
      {/* Portfolio stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Investment"
          value={formatCurrency(stats.totalInvested)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          trend="up"
          trendValue="View Details"
        />
        
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={<BuildingOfficeIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Average Investment"
          value={formatCurrency(stats.avgInvestment)}
          icon={<ChartPieIcon className="h-6 w-6" />}
        />
      </div>
      
      {/* Recent investments */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Recent Investments</Card.Title>
            <Button variant="link" className="flex items-center">
              View All <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          {investments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">You haven't made any investments yet</p>
              <Button variant="outline" className="mt-2">
                Explore Properties
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Property</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.slice(0, 5).map((investment) => (
                    <tr key={investment.id} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{investment.property.name}</div>
                        <div className="text-xs text-gray-500">{investment.property.location}</div>
                      </td>
                      <td className="p-2">{formatCurrency(investment.amount)}</td>
                      <td className="p-2">{new Date(investment.investmentDate).toLocaleDateString()}</td>
                      <td className="p-2">
                        <StatusBadge status={investment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>
      
      {/* Recent payments */}
      <Card>
        <Card.Header>
          <Card.Title>Recent ROI Payments</Card.Title>
        </Card.Header>
        <Card.Content>
          {roiPayments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No ROI payments received yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Property</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roiPayments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{payment.propertyName}</div>
                      </td>
                      <td className="p-2 text-success-700">{formatCurrency(payment.amount)}</td>
                      <td className="p-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant="success">{payment.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

// Investments list component
const InvestmentsList = ({ data }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  
  if (!data) return <div>No investment data available</div>;
  
  const { investments } = data.data;
  
  // Filter investments by status
  const filteredInvestments = filterStatus === 'all' 
    ? investments 
    : investments.filter(inv => inv.status === filterStatus);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Investments</h2>
        
        <div className="flex space-x-2">
          <select 
            className="border rounded-md p-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>
      
      {filteredInvestments.length === 0 ? (
        <Card>
          <Card.Content className="py-8">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No investments found with the selected filter</p>
              {filterStatus !== 'all' && (
                <Button variant="outline" onClick={() => setFilterStatus('all')}>
                  View All Investments
                </Button>
              )}
            </div>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestments.map((investment) => (
            <Card key={investment.id} className="overflow-hidden">
              {investment.property.images && investment.property.images[0] && (
                <div 
                  className="h-40 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${investment.property.images[0]})` }}
                ></div>
              )}
              
              <Card.Content className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{investment.property.name}</h3>
                    <p className="text-sm text-gray-500">{investment.property.location}</p>
                  </div>
                  <StatusBadge status={investment.status} />
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Investment</p>
                    <p className="font-bold">{formatCurrency(investment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected ROI</p>
                    <p className="font-bold text-success-700">{formatPercent(investment.property.roi)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{new Date(investment.investmentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Property Type</p>
                    <p className="font-medium capitalize">{investment.property.propertyType}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full mt-2">
                    View Details
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Properties list component
const PropertiesList = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // API hook for properties data
  const propertiesApi = useApiRequest();
  
  // Load properties data on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await propertiesApi.get('properties?status=active');
        setProperties(data.data.properties || []);
      } catch (error) {
        console.error('Failed to load properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading available properties...</p>
        </div>
      </div>
    );
  }
  
  if (properties.length === 0) {
    return (
      <Card>
        <Card.Content className="py-8">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No active properties available for investment at this time</p>
          </div>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Properties</h2>
        
        <div className="flex space-x-2">
          <Button variant="outline">Filter</Button>
          <select className="border rounded-md p-2 text-sm">
            <option>Sort by: Newest</option>
            <option>Sort by: Highest ROI</option>
            <option>Sort by: Price (Low to High)</option>
            <option>Sort by: Price (High to Low)</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            {property.images && property.images[0] && (
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${property.images[0]})` }}
              ></div>
            )}
            
            <Card.Content className="p-4">
              <div>
                <h3 className="font-bold text-lg">{property.name}</h3>
                <p className="text-sm text-gray-500">{property.location}</p>
              </div>
              
              <div className="mt-4">
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Funding Progress</span>
                    <span>
                      {formatPercent(Number(property.fundingProgress) / Number(property.fundingGoal) * 100)}
                    </span>
                  </div>
                  <Progress 
                    value={Number(property.fundingProgress)} 
                    max={Number(property.fundingGoal)} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-bold">{formatCurrency(property.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected ROI</p>
                    <p className="font-bold text-success-700">{formatPercent(property.roi)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Min Investment</p>
                    <p className="font-medium">{formatCurrency(property.minInvestment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Property Type</p>
                    <p className="font-medium capitalize">{property.propertyType}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Details
                </Button>
                <Button variant="primary" className="flex-1">
                  Invest Now
                </Button>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Returns & Earnings component
const ReturnsEarnings = ({ data }) => {
  if (!data) return <div>No returns data available</div>;
  
  const { roiPayments } = data.data;
  
  // Calculate total returns
  const totalReturns = roiPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <Card.Content className="p-6">
            <h3 className="text-xl font-bold mb-2">Total Returns</h3>
            <div className="text-3xl font-bold text-success-700">{formatCurrency(totalReturns)}</div>
            <p className="text-sm text-gray-500 mt-2">Across all investments</p>
          </Card.Content>
        </Card>
        
        <Card className="flex-1">
          <Card.Content className="p-6">
            <h3 className="text-xl font-bold mb-2">Upcoming Payments</h3>
            <div className="text-3xl font-bold">{roiPayments.filter(p => p.status === 'pending').length}</div>
            <p className="text-sm text-gray-500 mt-2">Pending ROI payments</p>
          </Card.Content>
        </Card>
        
        <Card className="flex-1">
          <Card.Content className="p-6">
            <h3 className="text-xl font-bold mb-2">Average ROI</h3>
            <div className="text-3xl font-bold text-primary">8.6%</div>
            <p className="text-sm text-gray-500 mt-2">Across your portfolio</p>
          </Card.Content>
        </Card>
      </div>
      
      <Card>
        <Card.Header>
          <Card.Title>ROI Payment History</Card.Title>
        </Card.Header>
        <Card.Content>
          {roiPayments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No ROI payments received yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Property</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roiPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{payment.propertyName}</div>
                      </td>
                      <td className="p-2 text-success-700">{formatCurrency(payment.amount)}</td>
                      <td className="p-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant="success">{payment.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>
      
      <Card>
        <Card.Header>
          <Card.Title>Returns Breakdown by Property</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8 text-gray-500">
            <p>Chart visualization of returns by property will be displayed here</p>
            <p className="text-sm mt-2">Coming soon in the next update</p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// Wallet component
const WalletView = ({ user }) => {
  const walletBalance = user?.wallet?.balance || '0';
  
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary to-primary-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute left-0 top-0 h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <circle cx="850" cy="150" r="400" fill="rgba(255,255,255,0.1)" />
          </svg>
        </div>
        
        <Card.Content className="p-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <p className="text-lg font-medium opacity-90">Available Balance</p>
              <h3 className="text-3xl md:text-4xl font-bold mt-2">{formatCurrency(walletBalance)}</h3>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 mr-2">
                Add Funds
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Withdraw
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Recent Transactions</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-center py-4">
              <p className="text-gray-500">No recent transactions to display</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Payment Methods</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-center py-4">
              <p className="text-gray-500">No payment methods added yet</p>
              <Button variant="outline" className="mt-2">
                Add Payment Method
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
      
      <Card>
        <Card.Header>
          <Card.Title>Transaction History</Card.Title>
        </Card.Header>
        <Card.Content>
          <Tabs>
            <Tabs.List>
              <Tabs.Trigger active={true}>All</Tabs.Trigger>
              <Tabs.Trigger>Deposits</Tabs.Trigger>
              <Tabs.Trigger>Withdrawals</Tabs.Trigger>
              <Tabs.Trigger>Investments</Tabs.Trigger>
              <Tabs.Trigger>Returns</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content>
              <div className="text-center py-8">
                <p className="text-gray-500">No transaction history available</p>
              </div>
            </Tabs.Content>
          </Tabs>
        </Card.Content>
      </Card>
    </div>
  );
};

// Documents list component
const DocumentsList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Documents</h2>
        
        <div>
          <Button variant="outline">
            Request Document
          </Button>
        </div>
      </div>
      
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Investment Documents</Card.Title>
            <select className="border rounded-md p-2 text-sm">
              <option>All Properties</option>
              <option>Property A</option>
              <option>Property B</option>
            </select>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-gray-500">No investment documents available</p>
          </div>
        </Card.Content>
      </Card>
      
      <Card>
        <Card.Header>
          <Card.Title>Account Documents</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-gray-500">No account documents available</p>
          </div>
        </Card.Content>
      </Card>
      
      <Card>
        <Card.Header>
          <Card.Title>Tax Documents</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-gray-500">No tax documents available</p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default InvestorDashboard;