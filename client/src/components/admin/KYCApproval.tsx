import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pencil, Search, FileText, UserCheck, UserX } from 'lucide-react';

interface KYCSubmission {
  id: number;
  userId: number;
  user: {
    username: string;
    email: string;
  };
  fullName: string;
  address: string;
  idType: string;
  idNumber: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  notes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
}

const KYCApproval: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [reviewNotes, setReviewNotes] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Fetch KYC submissions
  const { data: submissions = [], isLoading } = useQuery<KYCSubmission[]>({
    queryKey: ['/api/admin/kyc'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/kyc');
      return await res.json();
    },
  });

  // Update KYC status mutation
  const updateKYCMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: 'verified' | 'rejected';
      notes: string;
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/kyc/${id}`, {
        status,
        notes: notes.trim() || null,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'KYC Status Updated',
        description: 'The KYC submission status has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
      setReviewDialogOpen(false);
      setSelectedKYC(null);
      setReviewNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update the KYC status.',
        variant: 'destructive',
      });
    },
  });

  // Filter submissions based on search term and status filter
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.idNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? submission.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Handle approve KYC
  const handleApprove = () => {
    if (!selectedKYC) return;
    updateKYCMutation.mutate({
      id: selectedKYC.id,
      status: 'verified',
      notes: reviewNotes,
    });
  };

  // Handle reject KYC
  const handleReject = () => {
    if (!selectedKYC) return;
    updateKYCMutation.mutate({
      id: selectedKYC.id,
      status: 'rejected',
      notes: reviewNotes,
    });
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>KYC Approval Management</CardTitle>
        <CardDescription>
          Review and manage Know Your Customer (KYC) submissions from investors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, email, or ID number..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No KYC submissions found.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{submission.user.username}</p>
                        <p className="text-sm text-muted-foreground">{submission.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{submission.fullName}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground capitalize">
                        {submission.idType.replace('_', ' ')}:
                      </span>{' '}
                      {submission.idNumber}
                    </TableCell>
                    <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={submission.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedKYC(submission);
                            setViewDialogOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        {submission.status === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedKYC(submission);
                              setReviewDialogOpen(true);
                              setReviewNotes('');
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Review</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* View KYC Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>KYC Submission Details</DialogTitle>
              <DialogDescription>
                Submission from {selectedKYC?.user?.username} ({selectedKYC?.user?.email})
              </DialogDescription>
            </DialogHeader>

            {selectedKYC && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{selectedKYC.fullName}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="font-medium pt-1">
                      <StatusBadge status={selectedKYC.status} />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="font-medium">{selectedKYC.address}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">ID Type</Label>
                    <p className="font-medium capitalize">{selectedKYC.idType.replace('_', ' ')}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">ID Number</Label>
                    <p className="font-medium">{selectedKYC.idNumber}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Document URL</Label>
                    <p className="font-medium break-all">
                      <a 
                        href={selectedKYC.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedKYC.documentUrl}
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Submitted At</Label>
                    <p className="font-medium">{formatDate(selectedKYC.submittedAt)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Reviewed At</Label>
                    <p className="font-medium">{formatDate(selectedKYC.reviewedAt)}</p>
                  </div>
                  
                  {selectedKYC.notes && (
                    <div className="md:col-span-2">
                      <Label className="text-muted-foreground">Review Notes</Label>
                      <p className="font-medium">{selectedKYC.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review KYC Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review KYC Submission</DialogTitle>
              <DialogDescription>
                Verify or reject the KYC submission from {selectedKYC?.fullName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Review Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes regarding this verification..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={updateKYCMutation.isPending}
              >
                <UserCheck className="h-4 w-4" />
                {updateKYCMutation.isPending ? 'Processing...' : 'Approve KYC'}
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={handleReject}
                disabled={updateKYCMutation.isPending}
              >
                <UserX className="h-4 w-4" />
                {updateKYCMutation.isPending ? 'Processing...' : 'Reject KYC'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default KYCApproval;