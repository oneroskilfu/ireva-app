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
import { Loader2, Search, AlertCircle, BarChart4 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Static data for filters
const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'account', label: 'Account' },
  { value: 'payment', label: 'Payment' },
  { value: 'investment', label: 'Investment' },
];

const PRIORITY_FILTERS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

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

interface IssueListProps {
  className?: string;
}

const IssueList: React.FC<IssueListProps> = ({ className }) => {
  const { user } = useAuth();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Build query string for filtered API request
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
    
    return params.toString();
  };
  
  // Fetch issues with filters
  const { data: issues, isLoading, isError } = useQuery({
    queryKey: ['/api/issues', statusFilter, categoryFilter, priorityFilter],
    queryFn: async () => {
      const queryString = getQueryString();
      const response = await fetch(`/api/issues${queryString ? `?${queryString}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }
      
      return await response.json();
    }
  });
  
  // Filter issues by search query
  const filteredIssues = searchQuery.trim() === '' 
    ? issues 
    : issues?.filter((issue: any) => 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
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
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Issue Tracker</CardTitle>
            <CardDescription>
              Track and manage your submitted issues and their progress.
            </CardDescription>
          </div>
          <Link href="/issues/new">
            <Button>Report New Issue</Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_FILTERS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={priorityFilter} 
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_FILTERS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
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
                There was a problem fetching your issues. Please try again later.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredIssues?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart4 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No issues found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery.trim() !== '' 
                  ? 'No issues match your search criteria.' 
                  : 'You haven\'t reported any issues yet.'}
              </p>
              <Link href="/issues/new">
                <Button className="mt-4">Report an Issue</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue: any) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">
                        <Link href={`/issues/${issue.id}`}>
                          <span className="text-primary hover:underline cursor-pointer">
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
                      <TableCell>{formatDate(issue.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {issue.commentCount || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IssueList;