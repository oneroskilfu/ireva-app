import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth.js';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Search, 
  RefreshCcw, 
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  ArrowUpRight, 
  Printer, 
  Download, 
  Filter, 
  CreditCard,
  BarChart4
} from 'lucide-react';

interface Investment {
  _id?: string;
  id?: number;
  user: string;
  project: string;
  amount: number;
  date: string;
  status?: string;
  returnToDate?: number;
  projectedReturn?: number;
  maturityDate?: string;
  userDetails?: {
    name?: string;
    email?: string;
  };
  projectDetails?: {
    title?: string;
    location?: string;
    type?: string;
  };
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  matured: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800'
};

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [stats, setStats] = useState({
    totalInvestment: 0,
    activeInvestments: 0,
    averageInvestment: 0,
    totalReturn: 0
  });
  
  const { toast } = useToast();

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/investments', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setInvestments(res.data);
      
      // Calculate stats
      if (res.data.length > 0) {
        const total = res.data.reduce((sum: number, inv: Investment) => sum + inv.amount, 0);
        const active = res.data.filter((inv: Investment) => inv.status === 'active').length;
        const avgAmount = total / res.data.length;
        const totalReturns = res.data.reduce((sum: number, inv: Investment) => sum + (inv.returnToDate || 0), 0);
        
        setStats({
          totalInvestment: total,
          activeInvestments: active,
          averageInvestment: avgAmount,
          totalReturn: totalReturns
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError('Failed to load investment data. Please try again later.');
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Mock for PDF/CSV export functionality
    toast({
      title: 'Export Started',
      description: 'Your investment data is being exported',
    });
    
    // In a real implementation, we would generate and download a file
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Investment data has been exported successfully',
      });
    }, 1500);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // Filter and sort investments
  const processedInvestments = [...investments]
    // Filter
    .filter(investment => {
      const userName = investment.userDetails?.name || investment.user;
      const projectName = investment.projectDetails?.title || investment.project;
      
      const matchesSearch = searchTerm === '' || 
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.amount.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === '' || investment.status === statusFilter;
      
      const matchesDate = dateFilter === '' || (() => {
        const invDate = new Date(investment.date);
        const today = new Date();
        
        switch(dateFilter) {
          case 'today':
            return invDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            return invDate >= weekAgo;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            return invDate >= monthAgo;
          case 'quarter':
            const quarterAgo = new Date();
            quarterAgo.setMonth(today.getMonth() - 3);
            return invDate >= quarterAgo;
          case 'year':
            const yearAgo = new Date();
            yearAgo.setFullYear(today.getFullYear() - 1);
            return invDate >= yearAgo;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    // Sort
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'user':
          const userA = (a.userDetails?.name || a.user).toLowerCase();
          const userB = (b.userDetails?.name || b.user).toLowerCase();
          comparison = userA.localeCompare(userB);
          break;
        case 'project':
          const projectA = (a.projectDetails?.title || a.project).toLowerCase();
          const projectB = (b.projectDetails?.title || b.project).toLowerCase();
          comparison = projectA.localeCompare(projectB);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'date':
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    
    return sortOrder === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl ml-72">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Investment Management</h1>
          <p className="text-gray-500">Track and manage all investments</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchInvestments}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded flex items-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCcw className="h-5 w-5 mr-2" />}
            Refresh
          </button>
          <button 
            onClick={handleExport}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Investment</p>
              <h3 className="text-2xl font-bold">{formatCurrency(stats.totalInvestment)}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Investments</p>
              <h3 className="text-2xl font-bold">{stats.activeInvestments}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Investment</p>
              <h3 className="text-2xl font-bold">{formatCurrency(stats.averageInvestment)}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart4 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Returns</p>
              <h3 className="text-2xl font-bold">{formatCurrency(stats.totalReturn)}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4"
              placeholder="Search by investor, project, or amount..."
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-4"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="matured">Matured</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-4"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <button className="flex items-center bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded">
              <Filter className="h-5 w-5 mr-2" />
              More Filters
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : processedInvestments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No investments found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || statusFilter || dateFilter 
                ? 'Try adjusting your filters' 
                : 'There are no investments in the system yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('user')}
                  >
                    <div className="flex items-center">
                      Investor {getSortIcon('user')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('project')}
                  >
                    <div className="flex items-center">
                      Project {getSortIcon('project')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount {getSortIcon('amount')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date {getSortIcon('date')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maturity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedInvestments.map((investment) => (
                  <tr key={investment._id || investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {investment.userDetails?.name || investment.user}
                          </div>
                          <div className="text-xs text-gray-500">
                            {investment.userDetails?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {investment.projectDetails?.title || investment.project}
                          </div>
                          <div className="text-xs text-gray-500">
                            {investment.projectDetails?.location || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(investment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(investment.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[investment.status as keyof typeof statusColors] || statusColors.default
                      }`}>
                        {investment.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(investment.returnToDate || 0)}
                      </div>
                      {investment.projectedReturn && (
                        <div className="text-xs text-gray-500">
                          Projected: {formatCurrency(investment.projectedReturn)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {investment.maturityDate ? formatDate(investment.maturityDate) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments;