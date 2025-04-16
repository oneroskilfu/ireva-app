import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck, X, Search, RefreshCw, CheckCircle2, XCircle, Eye, Download, User } from "lucide-react";

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

const KYCApproval = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch KYC submissions
  const { data: submissions, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['/api/admin/kyc', selectedTab],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/kyc/${selectedTab}`);
      return await res.json();
    },
  });

  // Approve KYC mutation
  const approveMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      await apiRequest('PATCH', `/api/admin/kyc/${submissionId}/verify`, { status: 'verified' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
      toast({
        title: "KYC Approved",
        description: "The KYC submission has been successfully approved.",
        variant: "default",
      });
      setSelectedSubmission(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while approving the KYC submission.",
        variant: "destructive",
      });
    },
  });

  // Reject KYC mutation
  const rejectMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      await apiRequest('PATCH', `/api/admin/kyc/${submissionId}/verify`, { 
        status: 'rejected',
        rejectionReason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
      toast({
        title: "KYC Rejected",
        description: "The KYC submission has been rejected.",
        variant: "default",
      });
      setSelectedSubmission(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while rejecting the KYC submission.",
        variant: "destructive",
      });
    },
  });

  // Filter submissions based on search query
  const filteredSubmissions = submissions?.filter((sub: KYCSubmission) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      sub.fullName.toLowerCase().includes(query) ||
      sub.idNumber.toLowerCase().includes(query) ||
      sub.bankName.toLowerCase().includes(query) ||
      sub.accountNumber.includes(query) ||
      (sub.user?.email && sub.user.email.toLowerCase().includes(query))
    );
  });

  const handleApprove = (submission: KYCSubmission) => {
    approveMutation.mutate(submission.id);
  };

  const handleReject = (submission: KYCSubmission) => {
    if (!rejectionReason) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    rejectMutation.mutate(submission.id);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <ClipboardCheck className="mr-2 h-5 w-5" /> KYC Verification Requests
          </CardTitle>
          <CardDescription>
            Review and approve customer identity verification documents
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or bank details..."
              className="pl-8 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <div className="flex-1" />
                    <Skeleton className="h-9 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-10">
                <p className="text-red-500 mb-2">Failed to load KYC submissions</p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            ) : filteredSubmissions?.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No KYC submissions found</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>ID Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions?.map((submission: KYCSubmission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {submission.fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{submission.fullName}</p>
                              <p className="text-xs text-muted-foreground">{submission.user?.email || 'No email'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(submission.submittedAt), 'MMM d, yyyy')}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(submission.submittedAt), 'h:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {submission.idType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            
                            {submission.status === 'pending' && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(submission)}
                                  disabled={approveMutation.isPending}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => setSelectedSubmission({...submission, status: 'rejecting'})}
                                  disabled={rejectMutation.isPending}
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
      
      {/* KYC Detail Dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={(open) => {
          if (!open) {
            setSelectedSubmission(null);
            setRejectionReason("");
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedSubmission.status === 'rejecting' 
                  ? 'Reject KYC Submission' 
                  : 'KYC Submission Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedSubmission.status === 'rejecting'
                  ? 'Provide a reason for rejecting this KYC submission'
                  : `Submitted on ${format(new Date(selectedSubmission.submittedAt), 'PPpp')}`}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSubmission.status === 'rejecting' ? (
              <>
                <div className="py-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Rejection Reason:</h3>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a detailed reason for rejecting this submission..."
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedSubmission({...selectedSubmission, status: 'pending'});
                      setRejectionReason("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleReject(selectedSubmission)}
                    disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  >
                    {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                          <p>{selectedSubmission.fullName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                          <p>{selectedSubmission.user?.email || 'Not available'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                          <p>{selectedSubmission.user?.phoneNumber || 'Not available'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                          <p>{selectedSubmission.address}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">ID Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">ID Type</h3>
                          <p className="capitalize">{selectedSubmission.idType.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">ID Number</h3>
                          <p>{selectedSubmission.idNumber}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Bank Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Bank Name</h3>
                          <p>{selectedSubmission.bankName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Account Number</h3>
                          <p>{selectedSubmission.accountNumber}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Verification Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                          <div className="mt-1">
                            {getStatusBadge(selectedSubmission.status)}
                          </div>
                        </div>
                        {selectedSubmission.status === 'rejected' && selectedSubmission.rejectionReason && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Rejection Reason</h3>
                            <p className="text-red-600">{selectedSubmission.rejectionReason}</p>
                          </div>
                        )}
                        {selectedSubmission.status === 'verified' && selectedSubmission.verifiedAt && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Verified On</h3>
                            <p>{format(new Date(selectedSubmission.verifiedAt), 'PPpp')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-2">ID Front</h3>
                            <div className="border rounded-md overflow-hidden">
                              <img 
                                src={selectedSubmission.frontImage} 
                                alt="ID Front" 
                                className="w-full h-auto object-contain" 
                              />
                            </div>
                            <Button className="mt-2 w-full" size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" /> Download
                            </Button>
                          </div>
                          
                          {selectedSubmission.backImage && (
                            <div>
                              <h3 className="text-sm font-medium mb-2">ID Back</h3>
                              <div className="border rounded-md overflow-hidden">
                                <img 
                                  src={selectedSubmission.backImage} 
                                  alt="ID Back" 
                                  className="w-full h-auto object-contain" 
                                />
                              </div>
                              <Button className="mt-2 w-full" size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" /> Download
                              </Button>
                            </div>
                          )}
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Selfie</h3>
                            <div className="border rounded-md overflow-hidden">
                              <img 
                                src={selectedSubmission.selfieImage} 
                                alt="Selfie" 
                                className="w-full h-auto object-contain" 
                              />
                            </div>
                            <Button className="mt-2 w-full" size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" /> Download
                            </Button>
                          </div>
                          
                          {selectedSubmission.addressProofImage && (
                            <div>
                              <h3 className="text-sm font-medium mb-2">
                                Address Proof {selectedSubmission.addressProofType && `(${selectedSubmission.addressProofType.replace('_', ' ')})`}
                              </h3>
                              <div className="border rounded-md overflow-hidden">
                                <img 
                                  src={selectedSubmission.addressProofImage} 
                                  alt="Address Proof" 
                                  className="w-full h-auto object-contain" 
                                />
                              </div>
                              <Button className="mt-2 w-full" size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" /> Download
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
                
                <DialogFooter className="pt-4">
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <Button 
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(selectedSubmission)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {approveMutation.isPending ? 'Approving...' : 'Approve KYC'}
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => setSelectedSubmission({...selectedSubmission, status: 'rejecting'})}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject KYC
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default KYCApproval;