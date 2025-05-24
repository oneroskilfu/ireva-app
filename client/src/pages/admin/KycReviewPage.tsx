import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "react-toastify";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  Mail, 
  Phone,
  ChevronRight,
  FileText,
  AlertTriangle,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";

// KYC document type for TypeScript
interface KycDocument {
  id: number;
  userId: number;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: number;
  rejectionReason?: string;
  idType: string;
  idNumber: string;
  frontImage: string;
  backImage?: string;
  selfieImage: string;
  addressProofImage?: string;
  addressProofType?: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
}

export default function KycReviewPage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKyc, setSelectedKyc] = useState<KycDocument | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewImageDialog, setViewImageDialog] = useState<{open: boolean, url: string, title: string}>({
    open: false,
    url: "",
    title: ""
  });
  
  // Fetch KYC submissions
  const { data: kycSubmissions, isLoading, refetch } = useQuery<KycDocument[]>({
    queryKey: ["/api/admin/kyc"],
  });
  
  // Approve KYC mutation
  const approveKycMutation = useMutation({
    mutationFn: async (kycId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/kyc/${kycId}/verify`, {
        status: "verified"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc"] });
      toast.success("KYC approved successfully");
      setSelectedKyc(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve KYC: ${error.message}`);
    },
  });
  
  // Reject KYC mutation
  const rejectKycMutation = useMutation({
    mutationFn: async ({ kycId, reason }: { kycId: number, reason: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/kyc/${kycId}/verify`, {
        status: "rejected",
        rejectionReason: reason
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc"] });
      toast.success("KYC rejected successfully");
      setSelectedKyc(null);
      setRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject KYC: ${error.message}`);
    },
  });
  
  // Handle approve KYC
  const handleApproveKyc = () => {
    if (selectedKyc) {
      approveKycMutation.mutate(selectedKyc.userId);
    }
  };
  
  // Handle reject KYC
  const handleRejectKyc = () => {
    if (selectedKyc && rejectionReason.trim()) {
      rejectKycMutation.mutate({
        kycId: selectedKyc.userId,
        reason: rejectionReason
      });
    } else {
      toast.error("Please provide a rejection reason");
    }
  };
  
  // Filter KYC submissions based on search term
  const filteredKycSubmissions = kycSubmissions?.filter(submission => {
    const fullName = `${submission.user.firstName} ${submission.user.lastName}`.toLowerCase();
    const email = submission.user.email.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      submission.user.username.toLowerCase().includes(searchLower)
    );
  });
  
  // Group submissions by status
  const pendingSubmissions = filteredKycSubmissions?.filter(s => s.status === "pending") || [];
  const verifiedSubmissions = filteredKycSubmissions?.filter(s => s.status === "verified") || [];
  const rejectedSubmissions = filteredKycSubmissions?.filter(s => s.status === "rejected") || [];
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get ID type display name
  const getIdTypeName = (idType: string) => {
    const idTypeMap: Record<string, string> = {
      "national_id": "National ID Card",
      "drivers_license": "Driver's License",
      "passport": "International Passport",
      "voters_card": "Voter's Card"
    };
    
    return idTypeMap[idType] || idType;
  };
  
  // Get address proof type display name
  const getAddressProofTypeName = (addressProofType?: string) => {
    if (!addressProofType) return "N/A";
    
    const addressProofTypeMap: Record<string, string> = {
      "utility_bill": "Utility Bill",
      "bank_statement": "Bank Statement",
      "tax_document": "Tax Document",
      "rental_agreement": "Rental Agreement"
    };
    
    return addressProofTypeMap[addressProofType] || addressProofType;
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">KYC Verification Requests</h1>
          <p className="text-muted-foreground">
            Review and approve customer KYC verification submissions
          </p>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, email, or username"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
              <Badge className="ml-1 bg-amber-500">{pendingSubmissions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Verified
              <Badge className="ml-1 bg-gray-200 text-gray-800">{verifiedSubmissions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
              <Badge className="ml-1 bg-gray-200 text-gray-800">{rejectedSubmissions.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {pendingSubmissions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No pending KYC submissions</h3>
                    <p className="text-muted-foreground mb-4">
                      All KYC submissions have been reviewed
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Pending KYC Submissions</CardTitle>
                  <CardDescription>
                    Review and verify customer identity documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>ID Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {submission.user.firstName?.[0]}{submission.user.lastName?.[0]}
                              </div>
                              <div>
                                <p className="font-medium">{submission.user.firstName} {submission.user.lastName}</p>
                                <p className="text-xs text-muted-foreground">{submission.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(submission.submittedAt)}
                          </TableCell>
                          <TableCell>
                            {getIdTypeName(submission.idType)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedKyc(submission)}
                            >
                              Review
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="verified">
            {verifiedSubmissions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No verified KYC submissions</h3>
                    <p className="text-muted-foreground mb-4">
                      No KYC submissions have been verified yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Verified KYC Submissions</CardTitle>
                  <CardDescription>
                    View previously verified customer identity documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Verification Date</TableHead>
                        <TableHead>ID Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verifiedSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                {submission.user.firstName?.[0]}{submission.user.lastName?.[0]}
                              </div>
                              <div>
                                <p className="font-medium">{submission.user.firstName} {submission.user.lastName}</p>
                                <p className="text-xs text-muted-foreground">{submission.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(submission.submittedAt)}
                          </TableCell>
                          <TableCell>
                            {formatDate(submission.verifiedAt)}
                          </TableCell>
                          <TableCell>
                            {getIdTypeName(submission.idType)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedKyc(submission)}
                            >
                              View
                              <Eye className="ml-1 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="rejected">
            {rejectedSubmissions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No rejected KYC submissions</h3>
                    <p className="text-muted-foreground mb-4">
                      No KYC submissions have been rejected
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Rejected KYC Submissions</CardTitle>
                  <CardDescription>
                    View previously rejected customer identity documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Rejection Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                {submission.user.firstName?.[0]}{submission.user.lastName?.[0]}
                              </div>
                              <div>
                                <p className="font-medium">{submission.user.firstName} {submission.user.lastName}</p>
                                <p className="text-xs text-muted-foreground">{submission.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(submission.submittedAt)}
                          </TableCell>
                          <TableCell>
                            {formatDate(submission.verifiedAt)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {submission.rejectionReason || "No reason provided"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedKyc(submission)}
                            >
                              View
                              <Eye className="ml-1 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* KYC Detail Dialog */}
      {selectedKyc && (
        <Dialog open={!!selectedKyc} onOpenChange={() => setSelectedKyc(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>KYC Submission Details</DialogTitle>
              <DialogDescription>
                Review customer identity verification documents
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{selectedKyc.user.firstName} {selectedKyc.user.lastName}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedKyc.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedKyc.user.phoneNumber || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Submission Date</p>
                        <p className="font-medium">{formatDate(selectedKyc.submittedAt)}</p>
                      </div>
                    </div>
                    
                    {selectedKyc.status !== "pending" && (
                      <div className="flex gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {selectedKyc.status === "verified" ? "Verification Date" : "Rejection Date"}
                          </p>
                          <p className="font-medium">{formatDate(selectedKyc.verifiedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">ID Type</p>
                        <p className="font-medium">{getIdTypeName(selectedKyc.idType)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">ID Number</p>
                        <p className="font-medium">{selectedKyc.idNumber}</p>
                      </div>
                    </div>
                    
                    {selectedKyc.addressProofType && (
                      <div className="flex gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Address Proof Type</p>
                          <p className="font-medium">{getAddressProofTypeName(selectedKyc.addressProofType)}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedKyc.status === "rejected" && selectedKyc.rejectionReason && (
                      <div className="flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-red-500">Rejection Reason</p>
                          <p className="font-medium">{selectedKyc.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Document Verification Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      {selectedKyc.status === "pending" ? (
                        <>
                          <Badge className="bg-amber-500">Pending Review</Badge>
                          <p className="text-sm text-muted-foreground">Awaiting verification</p>
                        </>
                      ) : selectedKyc.status === "verified" ? (
                        <>
                          <Badge className="bg-green-500">Verified</Badge>
                          <p className="text-sm text-muted-foreground">Approved on {formatDate(selectedKyc.verifiedAt)}</p>
                        </>
                      ) : (
                        <>
                          <Badge className="bg-red-500">Rejected</Badge>
                          <p className="text-sm text-muted-foreground">Rejected on {formatDate(selectedKyc.verifiedAt)}</p>
                        </>
                      )}
                    </div>
                    
                    {selectedKyc.status === "pending" && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Please review the submitted documents and either approve or reject the KYC submission.
                        </p>
                        
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1" 
                            onClick={handleApproveKyc}
                            disabled={approveKycMutation.isPending}
                          >
                            {approveKycMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve KYC
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="flex-1" 
                            onClick={() => setRejectDialogOpen(true)}
                            disabled={rejectKycMutation.isPending}
                          >
                            {rejectKycMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject KYC
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* ID Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Identity Documents</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">ID Front</p>
                    <div className="relative aspect-[16/10] bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={selectedKyc.frontImage} 
                        alt="ID Front" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x200?text=Image+Not+Available";
                        }}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setViewImageDialog({
                          open: true,
                          url: selectedKyc.frontImage,
                          title: "ID Front"
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {selectedKyc.backImage && (
                    <div>
                      <p className="text-sm font-medium mb-2">ID Back</p>
                      <div className="relative aspect-[16/10] bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={selectedKyc.backImage} 
                          alt="ID Back" 
                          className="w-full h-full object-contain" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/400x200?text=Image+Not+Available";
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setViewImageDialog({
                            open: true,
                            url: selectedKyc.backImage!,
                            title: "ID Back"
                          })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Selfie with ID</p>
                    <div className="relative aspect-[16/10] bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={selectedKyc.selfieImage} 
                        alt="Selfie with ID" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x200?text=Image+Not+Available";
                        }}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setViewImageDialog({
                          open: true,
                          url: selectedKyc.selfieImage,
                          title: "Selfie with ID"
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {selectedKyc.addressProofImage && (
                    <div>
                      <p className="text-sm font-medium mb-2">Address Proof</p>
                      <div className="relative aspect-[16/10] bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={selectedKyc.addressProofImage} 
                          alt="Address Proof" 
                          className="w-full h-full object-contain" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/400x200?text=Image+Not+Available";
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setViewImageDialog({
                            open: true,
                            url: selectedKyc.addressProofImage,
                            title: "Address Proof"
                          })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedKyc(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC submission. The user will see this message.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Rejection Reason</p>
              <Textarea
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              {rejectionReason.trim() === "" && (
                <p className="text-sm text-red-500">Please provide a reason for rejection</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectKyc}
              disabled={rejectionReason.trim() === "" || rejectKycMutation.isPending}
            >
              {rejectKycMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject KYC"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image View Dialog */}
      <Dialog 
        open={viewImageDialog.open} 
        onOpenChange={(open) => setViewImageDialog({ ...viewImageDialog, open })}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewImageDialog.title}</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center p-4">
            <img 
              src={viewImageDialog.url} 
              alt={viewImageDialog.title} 
              className="max-h-[70vh] max-w-full object-contain" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/400x200?text=Image+Not+Available";
              }}
            />
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setViewImageDialog({ open: false, url: "", title: "" })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}