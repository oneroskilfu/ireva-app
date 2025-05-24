import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';
import { Link } from 'wouter';
import { KycStatusEnum, RiskLevelEnum } from '../../../shared/schema-kyc';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/DesignSystem';

import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UsersIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  IdentificationIcon,
  ChevronDoubleDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';

/**
 * ComplianceDashboard Component
 * 
 * Administrative dashboard for monitoring KYC/AML activities,
 * including pending verifications, risk flags, and suspicious transactions.
 */
const ComplianceDashboard = () => {
  const api = useApiRequest();
  const { toast } = useToast();
  
  // State for active tab and filters
  const [activeTab, setActiveTab] = useState('overview');
  const [kycFilter, setKycFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for selected items and detail views
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [flagDetailsOpen, setFlagDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
  
  // Fetch compliance summary data
  const { data: complianceSummary, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['/api/admin/compliance/summary'],
    queryFn: async () => {
      try {
        const response = await api.get('admin/compliance/summary');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching compliance summary:', error);
        throw error;
      }
    },
  });
  
  // Fetch pending KYC verifications
  const { data: pendingVerifications, isLoading: isPendingLoading } = useQuery({
    queryKey: ['/api/admin/compliance/kyc/pending', kycFilter],
    queryFn: async () => {
      try {
        let url = 'admin/compliance/kyc/pending';
        if (kycFilter) {
          url += `?status=${kycFilter}`;
        }
        const response = await api.get(url);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching pending verifications:', error);
        throw error;
      }
    },
  });
  
  // Fetch risk flags
  const { data: riskFlags, isLoading: isFlagsLoading } = useQuery({
    queryKey: ['/api/admin/compliance/risk-flags', riskFilter, searchQuery],
    queryFn: async () => {
      try {
        let url = 'admin/compliance/risk-flags';
        const params = new URLSearchParams();
        
        if (riskFilter) {
          params.append('severity', riskFilter);
        }
        
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await api.get(url);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching risk flags:', error);
        throw error;
      }
    },
  });
  
  // Fetch suspicious transactions
  const { data: suspiciousTransactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['/api/admin/compliance/suspicious-transactions'],
    queryFn: async () => {
      try {
        const response = await api.get('admin/compliance/suspicious-transactions');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching suspicious transactions:', error);
        throw error;
      }
    },
  });
  
  // Helper to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Helper to display risk level badge
  const RiskLevelBadge = ({ level }) => {
    let variant = 'outline';
    
    switch (level) {
      case RiskLevelEnum.LOW:
        variant = 'success';
        break;
      case RiskLevelEnum.MEDIUM:
        variant = 'warning';
        break;
      case RiskLevelEnum.HIGH:
        variant = 'destructive';
        break;
      case RiskLevelEnum.CRITICAL:
        variant = 'destructive';
        break;
      default:
        break;
    }
    
    return (
      <Badge variant={variant} className="capitalize">
        {level.toLowerCase()}
      </Badge>
    );
  };
  
  // Helper to display KYC status badge
  const KycStatusBadge = ({ status }) => {
    let variant = 'outline';
    let icon = null;
    
    switch (status) {
      case KycStatusEnum.APPROVED:
        variant = 'success';
        icon = <CheckCircleIcon className="h-3 w-3 mr-1" />;
        break;
      case KycStatusEnum.REJECTED:
        variant = 'destructive';
        icon = <XCircleIcon className="h-3 w-3 mr-1" />;
        break;
      case KycStatusEnum.PENDING_REVIEW:
        variant = 'warning';
        icon = <ClockIcon className="h-3 w-3 mr-1" />;
        break;
      case KycStatusEnum.IN_PROGRESS:
        variant = 'default';
        icon = <ClockIcon className="h-3 w-3 mr-1" />;
        break;
      case KycStatusEnum.NOT_STARTED:
        variant = 'outline';
        icon = null;
        break;
      case KycStatusEnum.REQUIRES_ADDITIONAL_INFO:
        variant = 'warning';
        icon = <ExclamationTriangleIcon className="h-3 w-3 mr-1" />;
        break;
      case KycStatusEnum.EXPIRED:
        variant = 'destructive';
        icon = <XCircleIcon className="h-3 w-3 mr-1" />;
        break;
      default:
        break;
    }
    
    return (
      <Badge variant={variant} className="flex items-center capitalize">
        {icon}
        {status.toLowerCase().replace(/_/g, ' ')}
      </Badge>
    );
  };
  
  // Helper to handle user details click
  const handleUserDetailsClick = (user) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };
  
  // Helper to handle flag details click
  const handleFlagDetailsClick = (flag) => {
    setSelectedFlag(flag);
    setFlagDetailsOpen(true);
  };
  
  // Helper to handle transaction details click
  const handleTransactionDetailsClick = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Dashboard</h1>
          <p className="text-gray-500">
            Monitor KYC/AML activities and compliance status
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchSummary();
              toast({
                title: 'Dashboard Updated',
                description: 'Compliance data has been refreshed',
                variant: 'default',
              });
            }}
            className="flex items-center gap-1.5"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button asChild className="flex items-center gap-1.5">
            <Link href="/admin/compliance/reports">
              <DocumentTextIcon className="h-4 w-4" />
              Reports
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          <TabsTrigger value="risk-flags">Risk Flags</TabsTrigger>
          <TabsTrigger value="transactions">Suspicious Activities</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {isSummaryLoading ? (
            <div className="flex justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : complianceSummary ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {complianceSummary.pendingVerifications}
                        </h3>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <IdentificationIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <span className={complianceSummary.pendingVerificationsChange > 0 ? 'text-red-500' : 'text-green-500'}>
                        {complianceSummary.pendingVerificationsChange > 0 ? (
                          <ChevronUpIcon className="inline h-3 w-3" />
                        ) : (
                          <ChevronDownIcon className="inline h-3 w-3" />
                        )}
                        {Math.abs(complianceSummary.pendingVerificationsChange)}%
                      </span>
                      <span className="mx-1">from last week</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Open Risk Flags</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {complianceSummary.openRiskFlags}
                        </h3>
                      </div>
                      <div className="p-2 bg-amber-100 rounded-full">
                        <FlagIcon className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <span className={complianceSummary.highRiskFlags > 0 ? 'text-red-500' : 'text-gray-500'}>
                        {complianceSummary.highRiskFlags} high risk
                      </span>
                      <span className="mx-1">•</span>
                      <span className={complianceSummary.criticalRiskFlags > 0 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                        {complianceSummary.criticalRiskFlags} critical
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Suspicious Transactions</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {complianceSummary.suspiciousTransactions}
                        </h3>
                      </div>
                      <div className="p-2 bg-red-100 rounded-full">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <span className={complianceSummary.suspiciousTransactionsChange > 0 ? 'text-red-500' : 'text-green-500'}>
                        {complianceSummary.suspiciousTransactionsChange > 0 ? (
                          <ChevronUpIcon className="inline h-3 w-3" />
                        ) : (
                          <ChevronDownIcon className="inline h-3 w-3" />
                        )}
                        {Math.abs(complianceSummary.suspiciousTransactionsChange)}%
                      </span>
                      <span className="mx-1">from last week</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Verification Rate</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {complianceSummary.verificationCompletionRate}%
                        </h3>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <span className={complianceSummary.verificationRateChange > 0 ? 'text-green-500' : 'text-red-500'}>
                        {complianceSummary.verificationRateChange > 0 ? (
                          <ChevronUpIcon className="inline h-3 w-3" />
                        ) : (
                          <ChevronDownIcon className="inline h-3 w-3" />
                        )}
                        {Math.abs(complianceSummary.verificationRateChange)}%
                      </span>
                      <span className="mx-1">from last week</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent KYC Activity</CardTitle>
                    <CardDescription>
                      Latest document submissions and verification status changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {complianceSummary.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {complianceSummary.recentActivity.map((activity, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-4 p-3 border rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-shrink-0">
                              {activity.type === 'document_upload' ? (
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                                </div>
                              ) : activity.type === 'status_change' ? (
                                <div className="p-2 bg-purple-100 rounded-full">
                                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-purple-600" />
                                </div>
                              ) : activity.type === 'flag_created' ? (
                                <div className="p-2 bg-red-100 rounded-full">
                                  <FlagIcon className="h-5 w-5 text-red-600" />
                                </div>
                              ) : (
                                <div className="p-2 bg-gray-100 rounded-full">
                                  <ClockIcon className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <div className="flex items-center mt-1">
                                <p className="text-xs text-gray-500">
                                  {activity.userName} • {formatDate(activity.timestamp)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                              {activity.status && (
                                <KycStatusBadge status={activity.status} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No recent activity to display
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="ml-auto" asChild>
                      <Link href="/admin/compliance/activity">
                        View All Activity
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Summary</CardTitle>
                    <CardDescription>
                      Overall compliance statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">KYC Completion</span>
                          <span className="font-medium">{complianceSummary.kycCompletionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-600" 
                            style={{ width: `${complianceSummary.kycCompletionRate}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Verification Approval</span>
                          <span className="font-medium">{complianceSummary.kycApprovalRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-600" 
                            style={{ width: `${complianceSummary.kycApprovalRate}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Risk Flag Resolution</span>
                          <span className="font-medium">{complianceSummary.riskFlagResolutionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-amber-600" 
                            style={{ width: `${complianceSummary.riskFlagResolutionRate}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 text-sm text-gray-700">
                        <div className="flex justify-between mb-2">
                          <div>KYC Approval Time (avg)</div>
                          <div className="font-medium">{complianceSummary.avgKycApprovalTime} hours</div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <div>Flag Resolution Time (avg)</div>
                          <div className="font-medium">{complianceSummary.avgFlagResolutionTime} hours</div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <div>Total Users</div>
                          <div className="font-medium">{complianceSummary.totalUsers}</div>
                        </div>
                        <div className="flex justify-between">
                          <div>Verified Users</div>
                          <div className="font-medium">{complianceSummary.verifiedUsers}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Unable to load compliance data</h3>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">
                There was an error loading the compliance summary. Please try again.
              </p>
              <Button className="mt-4" onClick={() => refetchSummary()}>
                Try Again
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* KYC Verification Tab */}
        <TabsContent value="kyc" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REQUIRES_ADDITIONAL_INFO">Requires Info</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Button asChild>
              <Link href="/admin/compliance/kyc">
                View All KYC Requests
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>
                KYC verification requests waiting for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPendingLoading ? (
                <div className="flex justify-center py-8">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingVerifications && pendingVerifications.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVerifications.map((verification) => (
                        <TableRow key={verification.id}>
                          <TableCell>
                            <div className="font-medium">{verification.user.name}</div>
                            <div className="text-sm text-gray-500">{verification.user.email}</div>
                          </TableCell>
                          <TableCell>
                            <KycStatusBadge status={verification.status} />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{verification.documentCount}</div>
                            <div className="text-xs text-gray-500">
                              {verification.documentsApproved} approved • {verification.documentsPending} pending
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(verification.createdAt)}
                          </TableCell>
                          <TableCell>
                            <RiskLevelBadge level={verification.riskLevel} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserDetailsClick(verification)}
                              className="flex items-center gap-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No pending verifications</h3>
                  <p className="text-gray-500 mt-1 max-w-md mx-auto">
                    All KYC verification requests have been processed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Risk Flags Tab */}
        <TabsContent value="risk-flags" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All risk levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Risk Levels</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search flags..."
                  className="pl-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Button asChild>
              <Link href="/admin/compliance/risk-flags">
                View All Risk Flags
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Risk Flags</CardTitle>
              <CardDescription>
                Compliance risks and anomalies that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFlagsLoading ? (
                <div className="flex justify-center py-8">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : riskFlags && riskFlags.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Flag Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskFlags.map((flag) => (
                        <TableRow key={flag.id}>
                          <TableCell>
                            <div className="font-medium">{flag.user.name}</div>
                            <div className="text-sm text-gray-500">{flag.user.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {flag.type.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{flag.description}</div>
                          </TableCell>
                          <TableCell>
                            {formatDate(flag.createdAt)}
                          </TableCell>
                          <TableCell>
                            <RiskLevelBadge level={flag.severity} />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={flag.status === 'open' ? 'outline' : 'success'}
                              className="capitalize"
                            >
                              {flag.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleFlagDetailsClick(flag)}
                              className="flex items-center gap-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No risk flags found</h3>
                  <p className="text-gray-500 mt-1 max-w-md mx-auto">
                    There are no open risk flags that match your criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Suspicious Activities Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/admin/compliance/transactions">
                View All Transaction Monitoring
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Transactions</CardTitle>
              <CardDescription>
                Transactions flagged for suspicious activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="flex justify-center py-8">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : suspiciousTransactions && suspiciousTransactions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Flags</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suspiciousTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="font-medium">{transaction.user.name}</div>
                            <div className="text-sm text-gray-500">{transaction.user.email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium capitalize">
                              {transaction.transactionType.replace(/_/g, ' ')}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {transaction.transactionId.substring(0, 8)}...
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {transaction.currency} {transaction.amount.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`font-medium ${
                              transaction.riskScore >= 70 ? 'text-red-600' :
                              transaction.riskScore >= 50 ? 'text-amber-600' :
                              'text-gray-900'
                            }`}>
                              {transaction.riskScore}/100
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {transaction.anomalyDetails.flags.map((flag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs capitalize"
                                >
                                  {flag.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(transaction.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTransactionDetailsClick(transaction)}
                              className="flex items-center gap-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Investigate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No suspicious transactions</h3>
                  <p className="text-gray-500 mt-1 max-w-md mx-auto">
                    There are no suspicious transactions that require investigation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User KYC Details</DialogTitle>
              <DialogDescription>
                Review verification documents and user information
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>{' '}
                      <span className="font-medium">{selectedUser.user.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <span className="font-medium">{selectedUser.user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>{' '}
                      <span>{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>{' '}
                      <KycStatusBadge status={selectedUser.status} />
                    </div>
                    <div>
                      <span className="text-gray-500">Risk Level:</span>{' '}
                      <RiskLevelBadge level={selectedUser.riskLevel} />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Risk Assessment</h3>
                  {selectedUser.riskFlags && selectedUser.riskFlags.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.riskFlags.map((flag, index) => (
                        <div key={index} className="p-2 border rounded-md bg-gray-50">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              flag.severity === RiskLevelEnum.CRITICAL || flag.severity === RiskLevelEnum.HIGH
                                ? 'bg-red-500'
                                : flag.severity === RiskLevelEnum.MEDIUM
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`} />
                            <span className="text-sm font-medium capitalize">
                              {flag.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {flag.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No risk flags identified</p>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Documents ({selectedUser.documents.length})</h3>
                  <div className="space-y-4">
                    {selectedUser.documents.map((document, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                              <span className="font-medium capitalize">
                                {document.type.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Uploaded: {formatDate(document.createdAt)}
                            </div>
                          </div>
                          <Badge 
                            variant={
                              document.status === 'APPROVED' 
                                ? 'success' 
                                : document.status === 'REJECTED'
                                ? 'destructive'
                                : 'outline'
                            }
                            className="capitalize"
                          >
                            {document.status.toLowerCase()}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          {document.documentNumber && (
                            <div>
                              <span className="text-gray-500">Document #:</span>{' '}
                              <span>{document.documentNumber}</span>
                            </div>
                          )}
                          {document.issuingCountry && (
                            <div>
                              <span className="text-gray-500">Country:</span>{' '}
                              <span>{document.issuingCountry}</span>
                            </div>
                          )}
                          {document.issuingAuthority && (
                            <div>
                              <span className="text-gray-500">Authority:</span>{' '}
                              <span>{document.issuingAuthority}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                            asChild
                          >
                            <Link href={`/admin/compliance/documents/${document.id}`}>
                              <EyeIcon className="h-4 w-4" />
                              View Document
                            </Link>
                          </Button>
                          
                          <div className="flex gap-2">
                            {document.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="flex items-center gap-1"
                                  // In a real implementation this would call an API to approve
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                  Approve
                                </Button>
                                
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex items-center gap-1"
                                  // In a real implementation this would call an API to reject
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Verification Decision</h3>
                  <div className="space-y-3">
                    {selectedUser.status !== 'APPROVED' && selectedUser.status !== 'REJECTED' && (
                      <>
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            className="flex-1 flex items-center justify-center gap-1"
                            // In a real implementation this would call an API to approve
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Approve Verification
                          </Button>
                          
                          <Button
                            variant="destructive"
                            className="flex-1 flex items-center justify-center gap-1"
                            // In a real implementation this would call an API to reject
                          >
                            <XCircleIcon className="h-4 w-4" />
                            Reject Verification
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-1"
                            // In a real implementation this would call an API to request info
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                            Request Additional Info
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-1"
                            // In a real implementation this would call an API to send a message
                          >
                            <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                            Send Message
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {(selectedUser.status === 'APPROVED' || selectedUser.status === 'REJECTED') && (
                      <div className="text-sm text-gray-600 italic">
                        This verification has already been {selectedUser.status === 'APPROVED' ? 'approved' : 'rejected'}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUserDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Flag Details Dialog */}
      {selectedFlag && (
        <Dialog open={flagDetailsOpen} onOpenChange={setFlagDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Risk Flag Details</DialogTitle>
              <DialogDescription>
                Review and manage risk flag information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-4 p-3 border rounded-md bg-gray-50">
                <div className={`p-2 rounded-full ${
                  selectedFlag.severity === RiskLevelEnum.CRITICAL
                    ? 'bg-red-100'
                    : selectedFlag.severity === RiskLevelEnum.HIGH
                    ? 'bg-red-100'
                    : selectedFlag.severity === RiskLevelEnum.MEDIUM
                    ? 'bg-amber-100'
                    : 'bg-blue-100'
                }`}>
                  <FlagIcon className={`h-5 w-5 ${
                    selectedFlag.severity === RiskLevelEnum.CRITICAL || selectedFlag.severity === RiskLevelEnum.HIGH
                      ? 'text-red-600'
                      : selectedFlag.severity === RiskLevelEnum.MEDIUM
                      ? 'text-amber-600'
                      : 'text-blue-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium capitalize">
                      {selectedFlag.type.replace(/_/g, ' ')}
                    </div>
                    <RiskLevelBadge level={selectedFlag.severity} />
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedFlag.description}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    Created: {formatDate(selectedFlag.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">User Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">{selectedFlag.user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{' '}
                    <span className="font-medium">{selectedFlag.user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">KYC Status:</span>{' '}
                    <KycStatusBadge status={selectedFlag.user.kycStatus} />
                  </div>
                </div>
              </div>
              
              {selectedFlag.evidence && Object.keys(selectedFlag.evidence).length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Evidence</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 max-h-40 overflow-auto">
                    <pre>{JSON.stringify(selectedFlag.evidence, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Flag Management</h3>
                <div className="space-y-3">
                  {selectedFlag.status === 'open' ? (
                    <>
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          className="flex-1 flex items-center justify-center gap-1"
                          // In a real implementation this would call an API to resolve
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Resolve Flag
                        </Button>
                        
                        <Button
                          variant="destructive"
                          className="flex-1 flex items-center justify-center gap-1"
                          // In a real implementation this would call an API to dismiss
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Dismiss Flag
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-1"
                          asChild
                        >
                          <Link href={`/admin/compliance/flags/${selectedFlag.id}/escalate`}>
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            Escalate
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-1"
                          asChild
                        >
                          <Link href={`/admin/users/${selectedFlag.user.id}`}>
                            <UsersIcon className="h-4 w-4" />
                            View User
                          </Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 italic">
                      This flag has already been {selectedFlag.status}.
                      {selectedFlag.resolvedBy && (
                        <span>
                          {' '}Resolved by {selectedFlag.resolvedBy.name} on {formatDate(selectedFlag.resolutionDate)}.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFlagDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={transactionDetailsOpen} onOpenChange={setTransactionDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspicious Transaction Details</DialogTitle>
              <DialogDescription>
                Investigate transaction flagged for unusual activity
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-4 p-3 border rounded-md bg-gray-50">
                <div className="p-2 bg-red-100 rounded-full">
                  <BanknotesIcon className="h-5 w-5 text-red-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium capitalize">
                      {selectedTransaction.transactionType.replace(/_/g, ' ')}
                    </div>
                    <div className={`font-medium ${
                      selectedTransaction.riskScore >= 70 ? 'text-red-600' :
                      selectedTransaction.riskScore >= 50 ? 'text-amber-600' :
                      'text-gray-900'
                    }`}>
                      Risk Score: {selectedTransaction.riskScore}/100
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 mt-1">
                    {selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Transaction ID: {selectedTransaction.transactionId}
                    <br />
                    Date: {formatDate(selectedTransaction.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">User Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">{selectedTransaction.user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{' '}
                    <span className="font-medium">{selectedTransaction.user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">KYC Status:</span>{' '}
                    <KycStatusBadge status={selectedTransaction.user.kycStatus} />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Source:</span>{' '}
                    <span className="capitalize">
                      {selectedTransaction.sourceType.replace(/_/g, ' ')}
                    </span>
                    {selectedTransaction.sourceIdentifier && (
                      <span className="ml-1 text-gray-500">
                        ({selectedTransaction.sourceIdentifier})
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Destination:</span>{' '}
                    <span className="capitalize">
                      {selectedTransaction.destinationType.replace(/_/g, ' ')}
                    </span>
                    {selectedTransaction.destinationIdentifier && (
                      <span className="ml-1 text-gray-500">
                        ({selectedTransaction.destinationIdentifier})
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Flags:</span>{' '}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedTransaction.anomalyDetails.flags.map((flag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs capitalize"
                        >
                          {flag.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedTransaction.anomalyDetails && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Anomaly Details</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 max-h-40 overflow-auto">
                    <pre>{JSON.stringify(selectedTransaction.anomalyDetails, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Actions</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      className="flex-1 flex items-center justify-center gap-1"
                      // In a real implementation this would call an API to approve
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Approve Transaction
                    </Button>
                    
                    <Button
                      variant="destructive"
                      className="flex-1 flex items-center justify-center gap-1"
                      // In a real implementation this would call an API to reject
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Flag Transaction
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-1"
                      asChild
                    >
                      <Link href={`/admin/users/${selectedTransaction.user.id}/transactions`}>
                        <BanknotesIcon className="h-4 w-4" />
                        View User Transactions
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-1"
                      asChild
                    >
                      <Link href={`/admin/users/${selectedTransaction.user.id}`}>
                        <UsersIcon className="h-4 w-4" />
                        View User Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTransactionDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ComplianceDashboard;