import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Eye, 
  Calendar, 
  User 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

type User = {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  kycStatus: string;
  kycDocuments: {
    idCard?: string;
    utility?: string;
    selfie?: string;
    other?: string;
  } | null;
  kycSubmittedAt: string | null;
  kycVerifiedAt: string | null;
  kycRejectionReason: string | null;
};

const KycVerification = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState({ title: "", url: "" });
  const [verificationStatus, setVerificationStatus] = useState("verified");
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/admin/kyc/pending"],
  });

  const verifyKycMutation = useMutation({
    mutationFn: async ({ userId, status, rejectionReason }: { userId: number; status: string; rejectionReason?: string }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/kyc/${userId}/verify`,
        { status, rejectionReason }
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] });
      toast({
        title: `KYC ${verificationStatus === "verified" ? "approved" : "rejected"} successfully`,
        variant: "default",
      });
      setVerificationDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update KYC status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openVerificationDialog = (user: User) => {
    setSelectedUser(user);
    setVerificationStatus("verified");
    setRejectionReason("");
    setVerificationDialogOpen(true);
  };

  const openDocumentDialog = (user: User, docType: string, url: string) => {
    setSelectedUser(user);
    setCurrentDocument({
      title: docType,
      url
    });
    setDocumentDialogOpen(true);
  };

  const handleVerifyKyc = () => {
    if (!selectedUser) return;
    
    const payload: { userId: number; status: string; rejectionReason?: string } = {
      userId: selectedUser.id,
      status: verificationStatus,
    };
    
    if (verificationStatus === "rejected" && rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }
    
    verifyKycMutation.mutate(payload);
  };

  const filteredUsers = pendingUsers
    ? pendingUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-destructive mb-2">Failed to load KYC verifications</p>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>KYC Verification</CardTitle>
            <CardDescription>
              Review and approve KYC submissions
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <Search className="w-4 h-4 mr-2 text-muted-foreground" />
          <Input
            placeholder="Search verifications..."
            className="w-full max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(user.kycSubmittedAt)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {user.kycDocuments?.idCard && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDocumentDialog(user, "ID Card", user.kycDocuments.idCard!)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> ID
                      </Button>
                    )}
                    {user.kycDocuments?.utility && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDocumentDialog(user, "Utility Bill", user.kycDocuments.utility!)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Bill
                      </Button>
                    )}
                    {user.kycDocuments?.selfie && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDocumentDialog(user, "Selfie", user.kycDocuments.selfie!)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Selfie
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openVerificationDialog(user)}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" /> Verify
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No pending KYC verifications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Document Preview Dialog */}
        {selectedUser && (
          <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{currentDocument.title}</DialogTitle>
                <DialogDescription>
                  User: {selectedUser.username} ({selectedUser.email})
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center p-2 bg-muted/20 rounded-md">
                <img 
                  src={currentDocument.url} 
                  alt={currentDocument.title} 
                  className="max-h-[60vh] object-contain"
                />
              </div>
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setDocumentDialogOpen(false)}>
                  Close
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="default"
                    onClick={() => {
                      setDocumentDialogOpen(false);
                      setVerificationStatus("verified");
                      setVerificationDialogOpen(true);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setDocumentDialogOpen(false);
                      setVerificationStatus("rejected");
                      setVerificationDialogOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Verification Dialog */}
        {selectedUser && (
          <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify KYC Submission</DialogTitle>
                <DialogDescription>
                  Review KYC documents for {selectedUser.username}
                </DialogDescription>
              </DialogHeader>
              <Tabs 
                value={verificationStatus} 
                onValueChange={setVerificationStatus} 
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="verified">Approve</TabsTrigger>
                  <TabsTrigger value="rejected">Reject</TabsTrigger>
                </TabsList>
                <TabsContent value="verified" className="py-4">
                  <div className="space-y-2 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <h3 className="font-medium text-lg">Approve KYC Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      By approving, you confirm that all submitted documents are valid and meet our requirements.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="rejected" className="py-4">
                  <div className="space-y-4">
                    <div className="space-y-2 text-center mb-4">
                      <XCircle className="h-12 w-12 text-destructive mx-auto" />
                      <h3 className="font-medium text-lg">Reject KYC Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        Please provide a reason for rejection. This will be sent to the user.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rejection Reason</label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g., Document is not clearly visible, ID card is expired..."
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setVerificationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyKyc}
                  disabled={verifyKycMutation.isPending || (verificationStatus === "rejected" && !rejectionReason)}
                  variant={verificationStatus === "verified" ? "default" : "destructive"}
                >
                  {verifyKycMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {verificationStatus === "verified" ? "Approve" : "Reject"} KYC
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default KycVerification;