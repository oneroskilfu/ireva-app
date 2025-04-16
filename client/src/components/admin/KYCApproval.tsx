import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  UserIcon, 
  Clock, 
  FileText, 
  CreditCard, 
  Home,
  Search,
  Filter,
  Eye
} from 'lucide-react';

// Type for KYC submission with user info
interface KYCSubmission {
  id: number;
  userId: number;
  user?: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
  fullName: string;
  idType: string;
  idNumber: string;
  bankName: string;
  accountNumber: string;
  address: string;
  frontImage: string;
  backImage?: string;
  selfieImage: string;
  addressProofImage?: string;
  addressProofType?: string;
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: number;
}

const KYCApproval: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  // Fetch KYC submissions
  const { data: kycSubmissions, isLoading, error } = useQuery<KYCSubmission[]>({
    queryKey: ['/api/admin/kyc', activeTab],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/kyc/${activeTab}`);
      return await res.json();
    },
  });

  // Approve KYC mutation
  const approveMutation = useMutation({
    mutationFn: async (kycId: number) => {
      const res = await apiRequest('PATCH', `/api/admin/kyc/${kycId}/verify`, { status: 'verified' });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'KYC Approved',
        description: 'The user has been successfully verified.',
        variant: 'default',
      });
      setApproveDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to approve KYC: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Reject KYC mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ kycId, reason }: { kycId: number; reason: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/kyc/${kycId}/verify`, { 
        status: 'rejected',
        rejectionReason: reason
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'KYC Rejected',
        description: 'The verification has been rejected with a reason.',
        variant: 'default',
      });
      setRejectDialogOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to reject KYC: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle approve KYC
  const handleApprove = () => {
    if (selectedKYC) {
      approveMutation.mutate(selectedKYC.id);
    }
  };

  // Handle reject KYC
  const handleReject = () => {
    if (selectedKYC && rejectionReason.trim()) {
      rejectMutation.mutate({ 
        kycId: selectedKYC.id, 
        reason: rejectionReason.trim() 
      });
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
    }
  };

  // Format the ID type for display
  const formatIdType = (type: string) => {
    if (!type) return 'Unknown';
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get status badge
  const getStatusBadge = (status: 'not_started' | 'pending' | 'verified' | 'rejected') => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'not_started':
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Not Started</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Filter KYC submissions by search query
  const filteredSubmissions = kycSubmissions?.filter(submission => 
    submission.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (submission.user?.email && submission.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (submission.user?.username && submission.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Management</CardTitle>
          <CardDescription>Approve or reject user identity verifications</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Management</CardTitle>
          <CardDescription>Approve or reject user identity verifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load KYC submissions. Please try again later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification Management</CardTitle>
        <CardDescription>Review and approve user identity verifications to enable full platform access</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'verified' | 'rejected')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="verified" className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verified
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center">
              <div className="relative mr-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or ID..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="pending">
            <KYCTable 
              submissions={filteredSubmissions} 
              onViewDetails={(kyc) => {
                setSelectedKYC(kyc);
                setViewDetailsOpen(true);
              }}
              onApprove={(kyc) => {
                setSelectedKYC(kyc);
                setApproveDialogOpen(true);
              }}
              onReject={(kyc) => {
                setSelectedKYC(kyc);
                setRejectDialogOpen(true);
              }}
              emptyMessage="No pending KYC verifications found."
            />
          </TabsContent>
          
          <TabsContent value="verified">
            <KYCTable 
              submissions={filteredSubmissions} 
              onViewDetails={(kyc) => {
                setSelectedKYC(kyc);
                setViewDetailsOpen(true);
              }}
              showActionButtons={false}
              emptyMessage="No verified users found."
            />
          </TabsContent>
          
          <TabsContent value="rejected">
            <KYCTable 
              submissions={filteredSubmissions} 
              onViewDetails={(kyc) => {
                setSelectedKYC(kyc);
                setViewDetailsOpen(true);
              }}
              showActionButtons={false}
              emptyMessage="No rejected verifications found."
            />
          </TabsContent>
        </Tabs>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm KYC Approval</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this user's identity verification?
              </DialogDescription>
            </DialogHeader>

            {selectedKYC && (
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {selectedKYC.user?.profileImage ? (
                      <AvatarImage src={selectedKYC.user.profileImage} alt={selectedKYC.fullName} />
                    ) : (
                      <AvatarFallback>
                        {selectedKYC.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedKYC.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedKYC.user?.email || 'No email provided'}
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Approving this user will:</p>
                    <ul className="text-sm list-disc list-inside mt-1">
                      <li>Grant them full platform access</li>
                      <li>Allow them to make investments in properties</li>
                      <li>Enable financial transactions on the platform</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setApproveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Verification
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject KYC Verification</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejection. This will be visible to the user.
              </DialogDescription>
            </DialogHeader>

            {selectedKYC && (
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {selectedKYC.user?.profileImage ? (
                      <AvatarImage src={selectedKYC.user.profileImage} alt={selectedKYC.fullName} />
                    ) : (
                      <AvatarFallback>
                        {selectedKYC.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedKYC.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedKYC.user?.email || 'No email provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Rejection Reason:</label>
                  <Textarea
                    placeholder="Please explain why this KYC verification is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="bg-amber-50 text-amber-700 p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Rejection will:</p>
                    <ul className="text-sm list-disc list-inside mt-1">
                      <li>Request the user to resubmit their verification</li>
                      <li>Prevent them from making investments</li>
                      <li>Limit their access to platform features</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Verification
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>KYC Verification Details</DialogTitle>
              <DialogDescription>
                Review all submitted identity verification documents and information
              </DialogDescription>
            </DialogHeader>

            {selectedKYC && (
              <div className="py-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {selectedKYC.user?.profileImage ? (
                        <AvatarImage src={selectedKYC.user.profileImage} alt={selectedKYC.fullName} />
                      ) : (
                        <AvatarFallback>
                          {selectedKYC.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedKYC.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedKYC.user?.email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(selectedKYC.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(selectedKYC.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-primary" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{selectedKYC.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ID Type</p>
                          <p className="font-medium">{formatIdType(selectedKYC.idType)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">ID Number</p>
                          <p className="font-medium">{selectedKYC.idNumber}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Residential Address</p>
                        <p className="font-medium">{selectedKYC.address}</p>
                      </div>
                    </div>

                    {/* Banking Information */}
                    <h3 className="text-lg font-semibold flex items-center gap-2 mt-6">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Banking Information
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Name</p>
                          <p className="font-medium">{selectedKYC.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium">{selectedKYC.accountNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Submitted Documents
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">ID Front</p>
                        <div className="border rounded-md overflow-hidden">
                          <img 
                            src={selectedKYC.frontImage} 
                            alt="ID Front" 
                            className="w-full h-auto"
                          />
                        </div>
                      </div>

                      {selectedKYC.backImage && (
                        <div>
                          <p className="text-sm font-medium mb-2">ID Back</p>
                          <div className="border rounded-md overflow-hidden">
                            <img 
                              src={selectedKYC.backImage} 
                              alt="ID Back" 
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-2">Selfie with ID</p>
                        <div className="border rounded-md overflow-hidden">
                          <img 
                            src={selectedKYC.selfieImage} 
                            alt="Selfie with ID" 
                            className="w-full h-auto"
                          />
                        </div>
                      </div>

                      {selectedKYC.addressProofImage && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Address Proof ({formatIdType(selectedKYC.addressProofType || '')})
                          </p>
                          <div className="border rounded-md overflow-hidden">
                            <img 
                              src={selectedKYC.addressProofImage} 
                              alt="Address Proof" 
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedKYC.status === 'rejected' && selectedKYC.rejectionReason && (
                  <div className="mt-6 bg-red-50 border border-red-100 rounded-md p-4">
                    <h4 className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</h4>
                    <p className="text-sm text-red-700">{selectedKYC.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setViewDetailsOpen(false)}
              >
                Close
              </Button>
              
              {selectedKYC && selectedKYC.status === 'pending' && (
                <>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setViewDetailsOpen(false);
                      setRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      setViewDetailsOpen(false);
                      setApproveDialogOpen(true);
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// KYC Table Component
interface KYCTableProps {
  submissions: KYCSubmission[];
  onViewDetails: (kyc: KYCSubmission) => void;
  onApprove?: (kyc: KYCSubmission) => void;
  onReject?: (kyc: KYCSubmission) => void;
  showActionButtons?: boolean;
  emptyMessage?: string;
}

const KYCTable: React.FC<KYCTableProps> = ({ 
  submissions, 
  onViewDetails, 
  onApprove, 
  onReject, 
  showActionButtons = true,
  emptyMessage = "No submissions found."
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>ID Type</TableHead>
            <TableHead>ID Number</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((kyc) => (
              <TableRow key={kyc.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {kyc.user?.profileImage ? (
                        <AvatarImage src={kyc.user.profileImage} alt={kyc.fullName} />
                      ) : (
                        <AvatarFallback>
                          {kyc.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{kyc.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {kyc.user?.email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {kyc.idType ? kyc.idType
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ') : 'N/A'}
                </TableCell>
                <TableCell>{kyc.idNumber}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{new Date(kyc.submittedAt).toLocaleDateString()}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(kyc.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {kyc.status === 'pending' ? (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                  ) : kyc.status === 'verified' ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(kyc)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {showActionButtons && kyc.status === 'pending' && onApprove && onReject && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onApprove(kyc)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Approve"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onReject(kyc)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default KYCApproval;