import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { toast as reactToastify } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react';

// Type for KYC submission from API
interface KYCSubmission {
  id: number;
  userId: number;
  fullName: string;
  idType: string;
  idNumber: string;
  bankName: string;
  accountNumber: string;
  address: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

const KYCManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch KYC submissions
  const { data: kycSubmissions, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/kyc'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/kyc');
      const data = await response.json();
      return data;
    },
  });

  // Verify KYC mutation
  const verifyMutation = useMutation({
    mutationFn: async ({
      id,
      approved,
      rejectionReason,
    }: {
      id: number;
      approved: boolean;
      rejectionReason?: string;
    }) => {
      const response = await apiRequest('PATCH', `/api/kyc/${id}/verify`, {
        approved,
        rejectionReason,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kyc'] });
      setRejectionReason('');
      setVerifyDialogOpen(false);
      setRejectDialogOpen(false);
      
      // Show toast notification using react-toastify
      reactToastify.success("KYC Approved!");
      
      // Also show shadcn toast for compatibility
      toast({
        title: 'KYC Updated',
        description: 'The KYC status has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      // Show error toast notification using react-toastify
      reactToastify.error(error.message || 'Failed to update KYC status');
      
      // Also show shadcn toast for compatibility
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update KYC status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle approve KYC
  const handleApprove = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setVerifyDialogOpen(true);
  };

  // Handle reject KYC
  const handleReject = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setRejectDialogOpen(true);
  };

  // Handle view KYC details
  const handleViewDetails = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  // Filter submissions based on active tab
  const filteredSubmissions = kycSubmissions
    ? activeTab === 'all'
      ? kycSubmissions
      : kycSubmissions.filter((submission: KYCSubmission) => submission.status === activeTab)
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'verified':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Unknown
          </Badge>
        );
    }
  };

  // Format ID type for display
  const formatIdType = (type: string) => {
    switch (type) {
      case 'national_id':
        return 'National ID';
      case 'drivers_license':
        return 'Driver\'s License';
      case 'passport':
        return 'Passport';
      case 'voters_card':
        return 'Voter\'s Card';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading KYC Submissions</CardTitle>
          <CardDescription>There was a problem loading the KYC submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">KYC Management</h1>
        <p className="text-gray-500">Review and approve customer KYC submissions</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Submissions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all'
                  ? 'All KYC Submissions'
                  : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Submissions`}
              </CardTitle>
              <CardDescription>
                {filteredSubmissions.length} KYC submissions found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of KYC submissions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID Type</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No KYC submissions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((submission: KYCSubmission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{submission.fullName}</div>
                          <div className="text-xs text-gray-500">{submission.user?.email}</div>
                        </TableCell>
                        <TableCell>{formatIdType(submission.idType)}</TableCell>
                        <TableCell>{submission.bankName}</TableCell>
                        <TableCell>
                          {submission.submittedAt
                            ? formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell className="space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(submission)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(submission)}
                                className="h-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(submission)}
                                className="h-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View KYC Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>KYC Submission Details</DialogTitle>
            <DialogDescription>
              Reviewing submission from {selectedSubmission?.fullName}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <Badge>{getStatusBadge(selectedSubmission.status)}</Badge>
                <span className="text-sm text-gray-500">
                  ID: {selectedSubmission.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Personal Details</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium">Full Name:</span>
                      <span className="ml-2">{selectedSubmission.fullName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Address:</span>
                      <span className="ml-2">{selectedSubmission.address}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">User Email:</span>
                      <span className="ml-2">{selectedSubmission.user?.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID Information</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium">ID Type:</span>
                      <span className="ml-2">{formatIdType(selectedSubmission.idType)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">ID Number:</span>
                      <span className="ml-2">{selectedSubmission.idNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Banking Information</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium">Bank Name:</span>
                      <span className="ml-2">{selectedSubmission.bankName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Account Number:</span>
                      <span className="ml-2">{selectedSubmission.accountNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission Details</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium">Submitted:</span>
                      <span className="ml-2">
                        {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedSubmission.verifiedAt && (
                      <div>
                        <span className="text-sm font-medium">Verified:</span>
                        <span className="ml-2">
                          {new Date(selectedSubmission.verifiedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedSubmission.rejectionReason && (
                      <div>
                        <span className="text-sm font-medium">Rejection Reason:</span>
                        <span className="ml-2 text-red-600">
                          {selectedSubmission.rejectionReason}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-gray-500">ID Documents</h3>
                <p className="text-sm text-gray-500">
                  Document upload feature will be implemented in a future update.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {selectedSubmission?.status === 'pending' && (
              <>
                <Button
                  onClick={() => handleApprove(selectedSubmission)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedSubmission)}
                  variant="destructive"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve KYC Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve KYC Submission</DialogTitle>
            <DialogDescription>
              You are about to approve the KYC submission for {selectedSubmission?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm">
              Approving this submission will allow the user to invest in all eligible properties.
              Please ensure all details have been thoroughly verified.
            </p>

            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Verification Confirmation</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      By approving, you confirm that all KYC information has been verified 
                      and meets regulatory requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (selectedSubmission) {
                  verifyMutation.mutate({
                    id: selectedSubmission.id,
                    approved: true,
                  });
                }
              }}
              disabled={verifyMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject KYC Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject KYC Submission</DialogTitle>
            <DialogDescription>
              You are about to reject the KYC submission for {selectedSubmission?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please provide a reason for rejection
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      The user will be notified of this rejection reason and will need to
                      resubmit their KYC with corrections.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Input
                id="rejection-reason"
                placeholder="e.g., ID document unclear, information mismatch, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (selectedSubmission && rejectionReason.trim()) {
                  verifyMutation.mutate({
                    id: selectedSubmission.id,
                    approved: false,
                    rejectionReason: rejectionReason.trim(),
                  });
                }
              }}
              disabled={verifyMutation.isPending || !rejectionReason.trim()}
              variant="destructive"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KYCManagementPage;