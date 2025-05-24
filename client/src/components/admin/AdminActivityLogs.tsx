import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";

// Type definition for admin logs based on schema
interface AdminLog {
  id: number;
  adminId: number;
  adminName?: string; // May be populated by API
  action: string;
  targetType: string;
  targetId: number;
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Action color mapping
const getActionColor = (action: string): string => {
  const actionColors: Record<string, string> = {
    create: 'bg-green-500',
    update: 'bg-blue-500',
    delete: 'bg-red-500',
    login: 'bg-gray-500',
    approve: 'bg-emerald-500',
    reject: 'bg-amber-500',
    verify: 'bg-indigo-500',
    system_update: 'bg-purple-500',
  };
  
  return actionColors[action] || 'bg-slate-500';
};

// Target type color mapping
const getTargetColor = (targetType: string): string => {
  const targetColors: Record<string, string> = {
    user: 'bg-blue-100 text-blue-800',
    property: 'bg-green-100 text-green-800',
    investment: 'bg-purple-100 text-purple-800',
    kyc: 'bg-amber-100 text-amber-800',
    payment: 'bg-emerald-100 text-emerald-800',
    system: 'bg-slate-100 text-slate-800',
    achievement: 'bg-pink-100 text-pink-800',
    educational_resource: 'bg-indigo-100 text-indigo-800',
  };
  
  return targetColors[targetType] || 'bg-gray-100 text-gray-800';
};

const AdminActivityLogs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [logViewDetails, setLogViewDetails] = useState<AdminLog | null>(null);

  // Fetch admin logs data
  const {
    data: logs,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['/api/admin/logs', page, limit, actionFilter, targetFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(targetFilter !== 'all' && { targetType: targetFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await apiRequest('GET', `/api/admin/logs?${queryParams}`);
      return res.json();
    },
  });

  // Handle errors
  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error Fetching Logs',
        description: 'There was a problem loading the admin activity logs.',
        variant: 'destructive',
      });
    }
  }, [isError, toast]);

  // Filter logs by search term
  const filteredLogs = logs?.data?.filter((log: AdminLog) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      log.description.toLowerCase().includes(searchLower) ||
      log.adminName?.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.targetType.toLowerCase().includes(searchLower) ||
      log.ipAddress?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Export logs to CSV
  const exportLogs = () => {
    if (!logs?.data?.length) {
      toast({
        title: 'No Data to Export',
        description: 'There are no logs available to export.',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['ID', 'Admin', 'Action', 'Target Type', 'Target ID', 'Description', 'IP Address', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...logs.data.map((log: AdminLog) =>
        [
          log.id,
          log.adminName || log.adminId,
          log.action,
          log.targetType,
          log.targetId,
          `"${log.description.replace(/"/g, '""')}"`,
          log.ipAddress || '',
          format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `admin-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render log details modal
  const renderLogDetails = () => {
    if (!logViewDetails) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Log Details #{logViewDetails.id}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setLogViewDetails(null)}>
                ×
              </Button>
            </div>
            <CardDescription>
              {format(new Date(logViewDetails.timestamp), 'PPpp')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Admin</h4>
                    <p>{logViewDetails.adminName || logViewDetails.adminId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Action</h4>
                    <Badge className={`${getActionColor(logViewDetails.action)} text-white`}>
                      {logViewDetails.action.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Target Type</h4>
                    <Badge className={getTargetColor(logViewDetails.targetType)}>
                      {logViewDetails.targetType}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Target ID</h4>
                    <p>{logViewDetails.targetId}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <p>{logViewDetails.description}</p>
                </div>

                {logViewDetails.ipAddress && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">IP Address</h4>
                    <p>{logViewDetails.ipAddress}</p>
                  </div>
                )}

                {logViewDetails.userAgent && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">User Agent</h4>
                    <p className="text-sm break-words">{logViewDetails.userAgent}</p>
                  </div>
                )}

                {logViewDetails.details && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Additional Details</h4>
                    <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto">
                      {JSON.stringify(logViewDetails.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button variant="outline" onClick={() => setLogViewDetails(null)}>Close</Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Admin Activity Logs</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportLogs} 
            disabled={isLoading || !logs?.data?.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            View all admin actions and system events in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 gap-2 mb-4">
            <div className="flex flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select 
                value={actionFilter} 
                onValueChange={setActionFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filter by Action</SelectLabel>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="verify">Verify</SelectItem>
                    <SelectItem value="system_update">System Update</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Select 
                value={targetFilter} 
                onValueChange={setTargetFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filter by Target</SelectLabel>
                    <SelectItem value="all">All Targets</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="kyc">KYC</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="educational_resource">Educational Resource</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
              ))}
            </div>
          ) : logs?.data?.length ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: AdminLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.adminName || `Admin #${log.adminId}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} text-white`}>
                          {log.action.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={getTargetColor(log.targetType)} variant="outline">
                            {log.targetType.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">ID: {log.targetId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {log.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(log.timestamp), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'h:mm a')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLogViewDetails(log)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No logs found. Try changing your filters.</p>
            </div>
          )}

          {logs?.data?.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {logs.data.length} of {logs.total || logs.data.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!logs.hasMore || isLoading}
                >
                  Next
                </Button>
                <Select 
                  value={limit.toString()} 
                  onValueChange={(val) => {
                    setLimit(parseInt(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {renderLogDetails()}
    </div>
  );
};

export default AdminActivityLogs;