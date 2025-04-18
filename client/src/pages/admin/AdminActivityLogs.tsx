import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle,
  Calendar, 
  Clock, 
  Filter, 
  Loader2, 
  RefreshCw, 
  User, 
  Target, 
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import TestAdminLogsButton from '@/components/admin/TestAdminLogsButton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type AdminLogAction = 'login' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'verify' | 'system_update';
type AdminLogTargetType = 'user' | 'property' | 'investment' | 'kyc' | 'payment' | 'system' | 'achievement' | 'educational_resource';

interface AdminLog {
  id: number;
  adminId: number;
  action: AdminLogAction;
  targetType: AdminLogTargetType;
  targetId: number;
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

const actionColors: Record<AdminLogAction, string> = {
  login: 'bg-blue-100 text-blue-800',
  create: 'bg-green-100 text-green-800',
  update: 'bg-yellow-100 text-yellow-800',
  delete: 'bg-red-100 text-red-800',
  approve: 'bg-emerald-100 text-emerald-800',
  reject: 'bg-rose-100 text-rose-800',
  verify: 'bg-indigo-100 text-indigo-800',
  system_update: 'bg-purple-100 text-purple-800'
};

const targetTypeColors: Record<AdminLogTargetType, string> = {
  user: 'bg-blue-50 text-blue-700',
  property: 'bg-amber-50 text-amber-700',
  investment: 'bg-green-50 text-green-700',
  kyc: 'bg-violet-50 text-violet-700',
  payment: 'bg-emerald-50 text-emerald-700',
  system: 'bg-slate-50 text-slate-700',
  achievement: 'bg-orange-50 text-orange-700',
  educational_resource: 'bg-cyan-50 text-cyan-700',
};

const AdminActivityLogs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [targetTypeFilter, setTargetTypeFilter] = useState<string | undefined>(undefined);
  
  // Fetch admin logs
  const { data: logs, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['/api/admin-logs', actionFilter, targetTypeFilter],
    queryFn: async () => {
      let url = '/api/admin-logs';
      const params = new URLSearchParams();
      
      if (actionFilter) params.append('action', actionFilter);
      if (targetTypeFilter) params.append('targetType', targetTypeFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiRequest('GET', url);
      return response.json() as Promise<AdminLog[]>;
    },
    enabled: !!user && (user.role === 'admin' || user.role === 'super_admin'),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const resetFilters = () => {
    setActionFilter(undefined);
    setTargetTypeFilter(undefined);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Admin activity logs have been refreshed",
    });
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to view admin activity logs.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto bg-white shadow-md">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Admin Activity Logs</CardTitle>
            <CardDescription>
              Track all administrative actions in the iREVA platform
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <TestAdminLogsButton />
          </div>
        </div>
      </CardHeader>
      
      <div className="p-4 border-b bg-muted/20">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select
            value={actionFilter}
            onValueChange={(value) => setActionFilter(value || undefined)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
              <SelectItem value="verify">Verify</SelectItem>
              <SelectItem value="system_update">System Update</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={targetTypeFilter}
            onValueChange={(value) => setTargetTypeFilter(value || undefined)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Target Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Targets</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="kyc">KYC</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="achievement">Achievement</SelectItem>
              <SelectItem value="educational_resource">Educational Resource</SelectItem>
            </SelectContent>
          </Select>
          
          {(actionFilter || targetTypeFilter) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {(error as any)?.message || 'Failed to load admin activity logs'}
              </AlertDescription>
            </Alert>
          </div>
        ) : logs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No activity logs found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {actionFilter || targetTypeFilter 
                ? 'Try changing your filters or create some activity' 
                : 'Admin activities will be logged here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[180px]">Admin</TableHead>
                  <TableHead className="w-[120px]">Action</TableHead>
                  <TableHead className="w-[150px]">Target Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right w-[150px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y">
                {logs?.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        Admin #{log.adminId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${actionColors[log.action]} border-0 capitalize`}
                      >
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${targetTypeColors[log.targetType]} border-0 capitalize`}
                      >
                        <Target className="h-3 w-3 mr-1" />
                        {log.targetType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      <div className="flex items-center justify-end">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminActivityLogs;