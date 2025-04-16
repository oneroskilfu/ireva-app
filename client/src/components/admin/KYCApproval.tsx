import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  FileText, 
  ExternalLink, 
  Search,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// KYC submission interface
interface KYCSubmission {
  id: number;
  userId: number;
  fullName: string;
  idNumber: string;
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  idDocumentUrl: string | null;
  addressProofUrl: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: number | null;
  notes: string | null;
  user?: {
    id: number;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  }
}

const KYCApproval = () => {
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [viewDocument, setViewDocument] = useState<{url: string, title: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch KYC submissions
  const { data: kycSubmissions = [], isLoading } = useQuery<KYCSubmission[]>({
    queryKey: ['/api/kyc'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/kyc');
      return await res.json();
    }
  });

  // Update KYC status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number, status: string, notes?: string }) => {
      const res = await apiRequest('PATCH', `/api/kyc/${id}/verify`, { status, notes });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'KYC Status Updated',
        description: 'The KYC submission status has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc'] });
      setSelectedSubmission(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update KYC status.',
        variant: 'destructive',
      });
    },
  });

  // Handle approval action
  const handleApprove = (submission: KYCSubmission) => {
    updateStatusMutation.mutate({ 
      id: submission.id, 
      status: 'verified', 
      notes: 'All documents verified and approved.'
    });
  };

  // Handle rejection action
  const handleReject = (submission: KYCSubmission) => {
    updateStatusMutation.mutate({ 
      id: submission.id, 
      status: 'rejected',
      notes: 'Documents do not meet verification requirements.'
    });
  };

  // Format date for display
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{status}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter submissions based on search and status filter
  const filteredSubmissions = kycSubmissions.filter(submission => {
    const matchesSearch = 
      submission.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (submission.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (submission.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          KYC Verification Management
        </CardTitle>
        <CardDescription>
          Review and verify user identity verification submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No KYC submissions match your search criteria.' 
                : 'There are no KYC submissions to review at this time.'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.fullName}
                      <div className="text-xs text-muted-foreground">
                        {submission.user?.email}
                      </div>
                    </TableCell>
                    <TableCell>{submission.idNumber}</TableCell>
                    <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {submission.idDocumentUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setViewDocument({
                              url: submission.idDocumentUrl!,
                              title: 'ID Document'
                            })}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            ID
                          </Button>
                        )}
                        {submission.addressProofUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setViewDocument({
                              url: submission.addressProofUrl!,
                              title: 'Address Proof'
                            })}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Address
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          Review
                        </Button>
                        {submission.status === 'pending' && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(submission)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleReject(submission)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
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

        {/* Document viewer dialog */}
        <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{viewDocument?.title}</DialogTitle>
              <DialogDescription>
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(viewDocument?.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in new tab
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 rounded-md border overflow-hidden max-h-[70vh]">
              {viewDocument?.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img 
                  src={viewDocument?.url} 
                  alt={viewDocument?.title} 
                  className="w-full h-auto"
                />
              ) : viewDocument?.url.match(/\.(pdf)$/i) ? (
                <iframe 
                  src={viewDocument?.url} 
                  className="w-full h-[70vh]"
                  title={viewDocument?.title}
                />
              ) : (
                <div className="flex items-center justify-center p-8 text-center">
                  <p>Document preview not available. Please click "Open in new tab" to view.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail review dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>KYC Submission Review</DialogTitle>
              <DialogDescription>
                Review the user's KYC submission details and verify their identity
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Full Name</h4>
                    <p>{selectedSubmission.fullName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">ID Number</h4>
                    <p>{selectedSubmission.idNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Submission Date</h4>
                    <p>{formatDate(selectedSubmission.submittedAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <p>{getStatusBadge(selectedSubmission.status)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Email</h4>
                    <p>{selectedSubmission.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Username</h4>
                    <p>{selectedSubmission.user?.username || 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Documents</h4>
                  <div className="flex gap-3">
                    {selectedSubmission.idDocumentUrl && (
                      <Button
                        variant="outline"
                        onClick={() => setViewDocument({
                          url: selectedSubmission.idDocumentUrl!,
                          title: 'ID Document'
                        })}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View ID Document
                      </Button>
                    )}
                    {selectedSubmission.addressProofUrl && (
                      <Button
                        variant="outline"
                        onClick={() => setViewDocument({
                          url: selectedSubmission.addressProofUrl!,
                          title: 'Address Proof'
                        })}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Address Proof
                      </Button>
                    )}
                  </div>
                </div>

                {selectedSubmission.notes && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Review Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.notes}</p>
                  </div>
                )}

                {selectedSubmission.status === 'pending' && (
                  <div className="border-t pt-4 flex justify-end gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleReject(selectedSubmission)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Submission
                    </Button>
                    <Button 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApprove(selectedSubmission)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Submission
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default KYCApproval;