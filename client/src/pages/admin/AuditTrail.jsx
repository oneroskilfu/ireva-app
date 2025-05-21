import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Label,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../components/ui/DesignSystem';

import {
  HistoryIcon,
  EyeIcon,
  ArrowPathIcon,
  XCircleIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const AuditTrail = () => {
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('entity-history');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Entity history filters
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  
  // Admin actions filters
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('');
  
  // Selected record for details
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [selectedActionId, setSelectedActionId] = useState(null);
  
  // Rollback dialog state
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('');
  const [rollbackHistoryId, setRollbackHistoryId] = useState(null);
  
  // Entity Types for dropdown
  const entityTypes = [
    { value: 'user', label: 'User' },
    { value: 'property', label: 'Property' },
    { value: 'investment', label: 'Investment' },
    { value: 'transaction', label: 'Transaction' },
    { value: 'kyc', label: 'KYC' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'document', label: 'Document' },
    { value: 'property_update', label: 'Property Update' },
    { value: 'roi_payment', label: 'ROI Payment' },
  ];
  
  // Action Types for dropdown
  const actionTypes = [
    { value: 'USER_CREATE', label: 'User Created' },
    { value: 'USER_UPDATE', label: 'User Updated' },
    { value: 'USER_DELETE', label: 'User Deleted' },
    { value: 'PROPERTY_CREATE', label: 'Property Created' },
    { value: 'PROPERTY_UPDATE', label: 'Property Updated' },
    { value: 'PROPERTY_DELETE', label: 'Property Deleted' },
    { value: 'INVESTMENT_CREATE', label: 'Investment Created' },
    { value: 'INVESTMENT_UPDATE', label: 'Investment Updated' },
    { value: 'ROLLBACK', label: 'Rollback Action' },
    { value: 'SETTINGS_UPDATE', label: 'Settings Updated' },
    { value: 'MANUAL_TRANSACTION', label: 'Manual Transaction' },
    { value: 'LOGIN_ATTEMPT', label: 'Login Attempt' },
  ];
  
  // Entity History Query
  const entityHistoryQuery = useQuery({
    queryKey: ['/api/audit/history', selectedEntityType, entityId, currentPage, limit],
    queryFn: async () => {
      if (!selectedEntityType || !entityId) return { history: [], pagination: { totalPages: 0 } };
      
      const response = await api.get(`audit/history/${selectedEntityType}/${entityId}?page=${currentPage}&limit=${limit}`);
      return response.data.data;
    },
    enabled: !!selectedEntityType && !!entityId,
  });
  
  // Admin Actions Query
  const adminActionsQuery = useQuery({
    queryKey: ['/api/audit/admin-actions', selectedAdminId, selectedActionType, currentPage, limit],
    queryFn: async () => {
      let url = `audit/admin-actions?page=${currentPage}&limit=${limit}`;
      
      if (selectedAdminId) {
        url += `&adminId=${selectedAdminId}`;
      }
      
      if (selectedActionType) {
        url += `&actionType=${selectedActionType}`;
      }
      
      const response = await api.get(url);
      return response.data.data;
    },
    enabled: activeTab === 'admin-actions',
  });
  
  // History Detail Query
  const historyDetailQuery = useQuery({
    queryKey: ['/api/audit/history/detail', selectedHistoryId],
    queryFn: async () => {
      const response = await api.get(`audit/history/detail/${selectedHistoryId}`);
      return response.data.data.record;
    },
    enabled: !!selectedHistoryId,
  });
  
  // Admin Action Detail Query
  const actionDetailQuery = useQuery({
    queryKey: ['/api/audit/admin-actions/detail', selectedActionId],
    queryFn: async () => {
      const response = await api.get(`audit/admin-actions/${selectedActionId}`);
      return response.data.data.action;
    },
    enabled: !!selectedActionId,
  });
  
  // Rollback Mutation
  const rollbackMutation = useMutation({
    mutationFn: async (params) => {
      const { historyId, reason } = params;
      const response = await api.post(`audit/rollback/${historyId}`, { reason });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Rollback Successful',
        description: `Changes have been rolled back successfully.`,
        variant: 'success',
      });
      
      // Invalidate queries
      queryClient.invalidateQuery(['/api/audit/history']);
      queryClient.invalidateQuery(['/api/audit/admin-actions']);
      
      // Close dialogs
      setShowRollbackDialog(false);
      setRollbackReason('');
      setRollbackHistoryId(null);
      setSelectedHistoryId(null);
    },
    onError: (error) => {
      toast({
        title: 'Rollback Failed',
        description: error.response?.data?.message || 'An error occurred during rollback',
        variant: 'destructive',
      });
    },
  });
  
  // Handle view history details
  const handleViewHistoryDetails = (historyId) => {
    setSelectedHistoryId(historyId);
    setSelectedActionId(null);
  };
  
  // Handle view action details
  const handleViewActionDetails = (actionId) => {
    setSelectedActionId(actionId);
    setSelectedHistoryId(null);
  };
  
  // Handle rollback
  const handleRollback = (historyId) => {
    setRollbackHistoryId(historyId);
    setShowRollbackDialog(true);
  };
  
  // Handle confirm rollback
  const handleConfirmRollback = () => {
    if (!rollbackReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for this rollback.',
        variant: 'destructive',
      });
      return;
    }
    
    rollbackMutation.mutate({ 
      historyId: rollbackHistoryId, 
      reason: rollbackReason 
    });
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Handle entity search
  const handleEntitySearch = () => {
    if (!selectedEntityType || !entityId) {
      toast({
        title: 'Search Error',
        description: 'Please select an entity type and provide an entity ID.',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentPage(1);
    queryClient.invalidateQuery(['/api/audit/history', selectedEntityType, entityId]);
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    setSelectedEntityType('');
    setEntityId('');
    setCurrentPage(1);
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get change type badge
  const getChangeTypeBadge = (changeType) => {
    switch (changeType) {
      case 'create':
        return <Badge className="bg-green-100 text-green-800">Created</Badge>;
      case 'update':
        return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{changeType}</Badge>;
    }
  };
  
  // Get success badge
  const getSuccessBadge = (success) => {
    return success 
      ? <Badge className="bg-green-100 text-green-800">Success</Badge> 
      : <Badge className="bg-red-100 text-red-800">Failed</Badge>;
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-gray-600">Track changes and administrative actions across the platform</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="entity-history" className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4" />
            Entity Change History
          </TabsTrigger>
          <TabsTrigger value="admin-actions" className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4" />
            Admin Action Log
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="entity-history">
          <Card>
            <CardHeader>
              <CardTitle>Entity Change History</CardTitle>
              <CardDescription>
                View the history of changes made to entities in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="entity-type">Entity Type</Label>
                  <Select 
                    value={selectedEntityType} 
                    onValueChange={setSelectedEntityType}
                  >
                    <SelectTrigger id="entity-type">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="entity-id">Entity ID</Label>
                  <Input 
                    id="entity-id"
                    type="number"
                    value={entityId}
                    onChange={e => setEntityId(e.target.value)}
                    placeholder="Enter ID number"
                  />
                </div>
                
                <div className="md:col-span-2 flex items-end gap-2">
                  <Button 
                    onClick={handleEntitySearch}
                    disabled={!selectedEntityType || !entityId}
                    className="flex items-center gap-2"
                  >
                    <FilterIcon className="h-4 w-4" />
                    Search History
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleClearSearch}
                    className="flex items-center gap-2"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
              
              {entityHistoryQuery.isLoading ? (
                <div className="flex justify-center py-12">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : entityHistoryQuery.data?.history?.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Change Type</TableHead>
                          <TableHead>Changed By</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entityHistoryQuery.data.history.map(record => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.id}</TableCell>
                            <TableCell>{getChangeTypeBadge(record.changeType)}</TableCell>
                            <TableCell>
                              {record.changedBy ? (
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4 text-gray-500" />
                                  <span>{record.changedBy.name}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">System</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-gray-500" />
                                <span>{formatDate(record.changedAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.reason ? (
                                <span className="text-gray-700">{record.reason}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewHistoryDetails(record.id)}
                                  className="flex items-center gap-1"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span className="hidden sm:inline">Details</span>
                                </Button>
                                
                                {record.changeType !== 'delete' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRollback(record.id)}
                                    className="flex items-center gap-1 text-amber-600 hover:text-amber-700"
                                  >
                                    <ArrowPathIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Rollback</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {entityHistoryQuery.data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {entityHistoryQuery.data.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= entityHistoryQuery.data.pagination.totalPages}
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : selectedEntityType && entityId ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No history found</h3>
                  <p className="mt-2 text-gray-500">
                    There are no recorded changes for this entity.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FilterIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Select entity to view history</h3>
                  <p className="mt-2 text-gray-500">
                    Please select an entity type and enter an entity ID to view its change history.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin-actions">
          <Card>
            <CardHeader>
              <CardTitle>Admin Action Log</CardTitle>
              <CardDescription>
                Track administrative actions performed by platform administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="admin-id">Admin ID</Label>
                  <Input 
                    id="admin-id"
                    type="number"
                    value={selectedAdminId}
                    onChange={e => setSelectedAdminId(e.target.value)}
                    placeholder="Filter by admin ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select 
                    value={selectedActionType} 
                    onValueChange={setSelectedActionType}
                  >
                    <SelectTrigger id="action-type">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All actions</SelectItem>
                      {actionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2 flex items-end gap-2">
                  <Button 
                    onClick={() => {
                      setCurrentPage(1);
                      queryClient.invalidateQuery(['/api/audit/admin-actions']);
                    }}
                    className="flex items-center gap-2"
                  >
                    <FilterIcon className="h-4 w-4" />
                    Apply Filters
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedAdminId('');
                      setSelectedActionType('');
                      setCurrentPage(1);
                      queryClient.invalidateQuery(['/api/audit/admin-actions']);
                    }}
                    className="flex items-center gap-2"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
              
              {adminActionsQuery.isLoading ? (
                <div className="flex justify-center py-12">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : adminActionsQuery.data?.actions?.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Action Type</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminActionsQuery.data.actions.map(action => (
                          <TableRow key={action.id}>
                            <TableCell className="font-medium">{action.id}</TableCell>
                            <TableCell>
                              <Badge className="bg-indigo-100 text-indigo-800">
                                {action.actionType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {action.admin ? (
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4 text-gray-500" />
                                  <span>{action.admin.name}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">System</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {action.entityType ? (
                                <span>
                                  {action.entityType} #{action.entityId}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-gray-500" />
                                <span>{formatDate(action.performedAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getSuccessBadge(action.success)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewActionDetails(action.id)}
                                className="flex items-center gap-1"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Details</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {adminActionsQuery.data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {adminActionsQuery.data.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= adminActionsQuery.data.pagination.totalPages}
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <ServerIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No admin actions found</h3>
                  <p className="mt-2 text-gray-500">
                    There are no administrative actions matching your filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* History Detail Dialog */}
      {selectedHistoryId && (
        <Dialog open={!!selectedHistoryId} onOpenChange={(open) => !open && setSelectedHistoryId(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Change History Detail</DialogTitle>
              <DialogDescription>
                Detailed information about this change record
              </DialogDescription>
            </DialogHeader>
            
            {historyDetailQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : historyDetailQuery.data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Entity Information</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Entity Type:</div>
                        <div className="text-sm">{historyDetailQuery.data.entityType}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Entity ID:</div>
                        <div className="text-sm">{historyDetailQuery.data.entityId}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Change Type:</div>
                        <div className="text-sm">{getChangeTypeBadge(historyDetailQuery.data.changeType)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Change Metadata</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Changed By:</div>
                        <div className="text-sm">
                          {historyDetailQuery.data.changedBy ? (
                            <span>{historyDetailQuery.data.changedBy.name} ({historyDetailQuery.data.changedBy.email})</span>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Date & Time:</div>
                        <div className="text-sm">{formatDate(historyDetailQuery.data.changedAt)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">IP Address:</div>
                        <div className="text-sm">{historyDetailQuery.data.ipAddress || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {historyDetailQuery.data.reason && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Change Reason</h3>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                      {historyDetailQuery.data.reason}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Field Changes</h3>
                  
                  {historyDetailQuery.data.fieldChanges && historyDetailQuery.data.fieldChanges.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Previous Value</TableHead>
                          <TableHead>New Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyDetailQuery.data.fieldChanges.map((change, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{change.field}</TableCell>
                            <TableCell>
                              {change.previousValue !== null ? (
                                typeof change.previousValue === 'object' ? (
                                  <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(change.previousValue, null, 2)}
                                  </pre>
                                ) : (
                                  String(change.previousValue)
                                )
                              ) : (
                                <span className="text-gray-400">null</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {change.newValue !== null ? (
                                typeof change.newValue === 'object' ? (
                                  <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(change.newValue, null, 2)}
                                  </pre>
                                ) : (
                                  String(change.newValue)
                                )
                              ) : (
                                <span className="text-gray-400">null</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-md">
                      <p className="text-gray-500">No detailed field changes available</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedHistoryId(null)}
                  >
                    Close
                  </Button>
                  
                  {historyDetailQuery.data.changeType !== 'delete' && (
                    <Button
                      variant="default"
                      onClick={() => {
                        setSelectedHistoryId(null);
                        handleRollback(historyDetailQuery.data.id);
                      }}
                      className="flex items-center gap-2"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Rollback This Change
                    </Button>
                  )}
                </DialogFooter>
              </div>
            ) : (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Error Loading Details</h3>
                <p className="mt-2 text-gray-500">
                  Unable to load history details. Please try again.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      
      {/* Admin Action Detail Dialog */}
      {selectedActionId && (
        <Dialog open={!!selectedActionId} onOpenChange={(open) => !open && setSelectedActionId(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Admin Action Detail</DialogTitle>
              <DialogDescription>
                Detailed information about this administrative action
              </DialogDescription>
            </DialogHeader>
            
            {actionDetailQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : actionDetailQuery.data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Action Information</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Action Type:</div>
                        <div className="text-sm">
                          <Badge className="bg-indigo-100 text-indigo-800">
                            {actionDetailQuery.data.actionType}
                          </Badge>
                        </div>
                      </div>
                      
                      {actionDetailQuery.data.entityType && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Target Entity:</div>
                          <div className="text-sm">
                            {actionDetailQuery.data.entityType} #{actionDetailQuery.data.entityId}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Status:</div>
                        <div className="text-sm">
                          {getSuccessBadge(actionDetailQuery.data.success)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Action Metadata</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Performed By:</div>
                        <div className="text-sm">
                          {actionDetailQuery.data.admin ? (
                            <span>{actionDetailQuery.data.admin.name} ({actionDetailQuery.data.admin.email})</span>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Date & Time:</div>
                        <div className="text-sm">{formatDate(actionDetailQuery.data.performedAt)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">IP Address:</div>
                        <div className="text-sm">{actionDetailQuery.data.ipAddress || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {actionDetailQuery.data.affectedUsers && actionDetailQuery.data.affectedUsers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Affected Users</h3>
                    <div className="mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {actionDetailQuery.data.affectedUsers.map(user => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Action Details</h3>
                  {actionDetailQuery.data.details ? (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(actionDetailQuery.data.details, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-center">
                      <p className="text-gray-500">No additional details available</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedActionId(null)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Error Loading Details</h3>
                <p className="mt-2 text-gray-500">
                  Unable to load action details. Please try again.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      
      {/* Rollback Confirmation Dialog */}
      <AlertDialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Confirm Rollback
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will revert the changes to their previous state.
              This operation cannot be automatically undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="rollback-reason" className="mb-2 block">
              Reason for rollback <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rollback-reason"
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="Please provide a reason for this rollback"
              className="resize-none"
              rows={3}
              required
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowRollbackDialog(false);
                setRollbackReason('');
                setRollbackHistoryId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRollback}
              disabled={rollbackMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {rollbackMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Rollback'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AuditTrail;