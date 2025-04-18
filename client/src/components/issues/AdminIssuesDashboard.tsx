import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertCircle,
  Search,
  BarChart4,
  Clock,
  CheckCircle2,
  CircleAlert,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  Download,
} from 'lucide-react';

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'open':
      return 'default'; // Blue
    case 'in_progress':
      return 'purple'; // Purple
    case 'resolved':
      return 'green'; // Green
    case 'closed':
      return 'secondary'; // Gray
    default:
      return 'default';
  }
};

// Helper function to get priority badge variant
const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'secondary'; // Gray
    case 'medium':
      return 'default'; // Blue
    case 'high':
      return 'orange'; // Orange
    case 'critical':
      return 'destructive'; // Red
    default:
      return 'default';
  }
};

interface AdminIssuesDashboardProps {
  className?: string;
}

const AdminIssuesDashboard: React.FC<AdminIssuesDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // State for filters
  const [activeTab, setActiveTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const limit = 10; // items per page
  
  // Build query string for API request
  const getQueryString = () => {
    const params = new URLSearchParams();
    
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      params.append('category', categoryFilter);
    }
    
    if (priorityFilter !== 'all') {
      params.append('priority', priorityFilter);
    }
    
    // Add pagination
    params.append('page', currentPage.toString());
    params.append('limit', limit.toString());
    
    // Add sorting
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    return params.toString();
  };
  
  // Fetch issues with filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/issues', statusFilter, categoryFilter, priorityFilter, currentPage, sortBy, sortOrder],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      
      const queryString = getQueryString();
      const response = await fetch(`/api/issues${queryString ? `?${queryString}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }
      
      return await response.json();
    },
    enabled: isAdmin,
  });

  // Stats calculation
  const stats = React.useMemo(() => {
    const defaultStats = {
      total: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      critical: 0,
      high: 0,
    };
    
    if (!data) return defaultStats;
    
    return data.reduce((acc: any, issue: any) => {
      acc.total += 1;
      
      if (issue.status === 'open') acc.open += 1;
      if (issue.status === 'in_progress') acc.in_progress += 1;
      if (issue.status === 'resolved') acc.resolved += 1;
      if (issue.status === 'closed') acc.closed += 1;
      
      if (issue.priority === 'critical') acc.critical += 1;
      if (issue.priority === 'high') acc.high += 1;
      
      return acc;
    }, { ...defaultStats });
  }, [data]);
  
  // Filter issues by search query
  const filteredIssues = React.useMemo(() => {
    if (!data) return [];
    
    return searchQuery.trim() === '' 
      ? data 
      : data.filter((issue: any) => 
          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (issue.reporter?.username && issue.reporter.username.toLowerCase().includes(searchQuery.toLowerCase()))
        );
  }, [data, searchQuery]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-NG', options);
  };
  
  // Handle sort toggle
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); // Default to descending order when changing columns
    }
  };
  
  if (!isAdmin) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
          <CardDescription>
            You don't have permission to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-muted-foreground mt-2">
              You need administrator privileges to view this page.
            </p>
            <Link href="/">
              <Button className="mt-4">
                Go to Homepage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Issue Management</CardTitle>
            <CardDescription>
              Comprehensive overview of all reported issues and their status.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link href="/issues/new">
              <Button>Report New Issue</Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="text-muted-foreground text-sm flex items-center mb-1">
                <AlertCircle className="mr-1 h-4 w-4" />
                Open Issues
              </div>
              <div className="text-2xl font-bold">{stats.open}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.open / (stats.total || 1)) * 100)}% of total
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="text-muted-foreground text-sm flex items-center mb-1">
                <Clock className="mr-1 h-4 w-4" />
                In Progress
              </div>
              <div className="text-2xl font-bold">{stats.in_progress}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.in_progress / (stats.total || 1)) * 100)}% of total
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="text-muted-foreground text-sm flex items-center mb-1">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Resolved
              </div>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.resolved / (stats.total || 1)) * 100)}% of total
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="text-muted-foreground text-sm flex items-center mb-1">
                <CircleAlert className="mr-1 h-4 w-4 text-destructive" />
                Critical Issues
              </div>
              <div className="text-2xl font-bold">{stats.critical}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.high} high priority issues
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues by title, description, or user..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={categoryFilter} 
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={priorityFilter} 
                onValueChange={(value) => {
                  setPriorityFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium">Failed to load issues</h3>
              <p className="text-muted-foreground mt-2">
                There was a problem fetching the issues. Please try again later.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart4 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No issues found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery.trim() !== '' 
                  ? 'No issues match your search criteria.' 
                  : 'No issues have been reported yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="w-[70px]"
                        onClick={() => toggleSort('id')}
                      >
                        <div className="flex items-center cursor-pointer">
                          ID
                          {sortBy === 'id' && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-[250px]"
                        onClick={() => toggleSort('title')}
                      >
                        <div className="flex items-center cursor-pointer">
                          Title
                          {sortBy === 'title' && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead 
                        onClick={() => toggleSort('createdAt')}
                      >
                        <div className="flex items-center cursor-pointer">
                          Date
                          {sortBy === 'createdAt' && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue: any) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">#{issue.id}</TableCell>
                        <TableCell>
                          <Link href={`/issues/${issue.id}`}>
                            <span className="text-primary hover:underline cursor-pointer font-medium">
                              {issue.title}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(issue.status)}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{issue.category}</TableCell>
                        <TableCell>{issue.reporter?.username || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(issue.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          {issue.commentCount || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {/* You can add dynamic page numbers here */}
                    <PaginationItem>
                      <PaginationLink isActive={currentPage === 1} onClick={() => setCurrentPage(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        // Disable when we're on the last page - replace with your logic
                        disabled={filteredIssues.length < limit}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminIssuesDashboard;