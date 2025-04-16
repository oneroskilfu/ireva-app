import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Eye, Ban } from "lucide-react";

interface KYCSubmission {
  id: number;
  userId: number;
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
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: number;
  user?: {
    username: string;
    email: string;
    phoneNumber?: string;
  };
}

const KYCApproval: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      rejectionReason: '',
    },
  });

  // Fetch KYC submissions
  const { data: allSubmissions, isLoading, error } = useQuery({
    queryKey: ['/api/admin/kyc'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/kyc');
      return await res.json();
    },
  });

  // Filter submissions by status
  const filteredSubmissions = allSubmissions?.filter((sub: KYCSubmission) => {
    if (activeTab === 'all') return true;
    return sub.status === activeTab;
  }) || [];

  // Handle view submission details
  const handleViewDetails = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  // Handle approve KYC submission
  const handleApprove = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setActionType('approve');
    setActionDialogOpen(true);
  };

  // Handle reject KYC submission
  const handleReject = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setActionType('reject');
    setActionDialogOpen(true);
    form.reset({ rejectionReason: '' });
  };

  // Process approval or rejection
  const processAction = async (submissionId: number, action: 'approve' | 'reject', data?: any) => {
    try {
      const res = await apiRequest('PATCH', `/api/admin/kyc/${submissionId}/verify`, {
        status: action === 'approve' ? 'verified' : 'rejected',
        rejectionReason: action === 'reject' ? data?.rejectionReason : undefined,
      });
      
      if (res.ok) {
        toast({
          title: `KYC ${action === 'approve' ? 'Approved' : 'Rejected'} Successfully`,
          description: `The KYC submission has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
          variant: action === 'approve' ? 'default' : 'destructive',
        });
        
        // Invalidate the query to refetch data
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
        
        // Close dialog
        setActionDialogOpen(false);
      } else {
        throw new Error(`Failed to ${action} KYC submission`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} KYC submission. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  // Handle form submission for rejection
  const onSubmit = (data: { rejectionReason: string }) => {
    if (selectedSubmission && actionType === 'reject') {
      processAction(selectedSubmission.id, 'reject', data);
    }
  };

  // Confirm approval
  const confirmApproval = () => {
    if (selectedSubmission) {
      processAction(selectedSubmission.id, 'approve');
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: 'pending' | 'verified' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Review and approve KYC submissions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Review and approve KYC submissions</CardDescription>
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
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>Review and approve KYC submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No {activeTab !== 'all' ? activeTab : ''} KYC submissions found.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>ID Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission: KYCSubmission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          <div>{submission.fullName}</div>
                          <div className="text-sm text-muted-foreground">{submission.user?.email}</div>
                        </TableCell>
                        <TableCell>{submission.idType.replace('_', ' ').toUpperCase()}</TableCell>
                        <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewDetails(submission)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            
                            {submission.status === 'pending' && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => handleApprove(submission)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleReject(submission)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* View KYC Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Submission Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedSubmission && new Date(selectedSubmission.submittedAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="text-sm font-medium">{selectedSubmission.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{selectedSubmission.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{selectedSubmission.user?.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">{selectedSubmission.address}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ID Information</h3>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <p className="text-xs text-muted-foreground">ID Type</p>
                      <p className="text-sm font-medium">{selectedSubmission.idType.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ID Number</p>
                      <p className="text-sm font-medium">{selectedSubmission.idNumber}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Bank Information</h3>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <p className="text-xs text-muted-foreground">Bank Name</p>
                      <p className="text-sm font-medium">{selectedSubmission.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="text-sm font-medium">{selectedSubmission.accountNumber}</p>
                    </div>
                  </div>
                </div>
                
                {selectedSubmission.status === 'rejected' && (
                  <div>
                    <h3 className="text-sm font-medium text-red-600">Rejection Reason</h3>
                    <p className="text-sm mt-1 text-muted-foreground">{selectedSubmission.rejectionReason || 'No reason provided'}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ID Front</h3>
                  <img 
                    src={selectedSubmission.frontImage} 
                    alt="ID Front" 
                    className="mt-1 rounded-md border object-cover w-full h-32"
                  />
                </div>
                
                {selectedSubmission.backImage && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">ID Back</h3>
                    <img 
                      src={selectedSubmission.backImage} 
                      alt="ID Back" 
                      className="mt-1 rounded-md border object-cover w-full h-32"
                    />
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Selfie with ID</h3>
                  <img 
                    src={selectedSubmission.selfieImage} 
                    alt="Selfie with ID" 
                    className="mt-1 rounded-md border object-cover w-full h-32"
                  />
                </div>
                
                {selectedSubmission.addressProofImage && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Address Proof</h3>
                    <p className="text-xs text-muted-foreground">Type: {selectedSubmission.addressProofType?.replace('_', ' ').toUpperCase() || 'Not specified'}</p>
                    <img 
                      src={selectedSubmission.addressProofImage} 
                      alt="Address Proof" 
                      className="mt-1 rounded-md border object-cover w-full h-32"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            
            {selectedSubmission && selectedSubmission.status === 'pending' && (
              <>
                <Button 
                  variant="default" 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleApprove(selectedSubmission);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleReject(selectedSubmission);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve KYC Submission' : 'Reject KYC Submission'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this KYC submission?' 
                : 'Please provide a reason for rejecting this KYC submission.'}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'reject' ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rejectionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejection Reason</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed reason for rejection"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setActionDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" type="submit">Reject KYC</Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmApproval} className="bg-green-600 hover:bg-green-700">Approve KYC</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default KYCApproval;