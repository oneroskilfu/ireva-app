import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "wouter";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import SharedLayout from "@/layouts/SharedLayout";
import KycSubmissionForm from "@/components/kyc/KycSubmissionForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, ShieldCheck, Clock, FileWarning } from "lucide-react";

export default function KycPage() {
  const { user } = useAuth();
  const [, navigate] = useNavigate();
  
  // Fetch KYC status
  const { data: kycData, isLoading } = useQuery({
    queryKey: ["/api/user/kyc"],
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <SharedLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SharedLayout>
    );
  }
  
  // Redirect if not logged in
  if (!user) {
    toast.error("Please login to access this page");
    navigate("/auth");
    return null;
  }
  
  return (
    <SharedLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
          <p className="text-muted-foreground">
            Complete your Know Your Customer (KYC) verification to access all investment opportunities
          </p>
        </div>
        
        {kycData?.status === "verified" ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-green-600" />
                <CardTitle className="text-green-700">Verification Complete</CardTitle>
              </div>
              <CardDescription className="text-green-600">
                Your identity has been verified successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-700">
                  Congratulations! Your KYC verification has been approved. You now have full access to all investment opportunities on the platform.
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-white rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Verification Date</p>
                    <p className="font-medium">{new Date(kycData.verifiedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Verification ID</p>
                    <p className="font-medium">{kycData.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className="bg-green-500">Verified</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/investor")}>
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate("/investor/properties")}>
                Browse Properties
              </Button>
            </CardFooter>
          </Card>
        ) : kycData?.status === "pending" ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-amber-700">Verification In Progress</CardTitle>
              </div>
              <CardDescription className="text-amber-600">
                Your verification is currently being reviewed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-amber-700">
                  Your KYC documents have been submitted and are currently under review by our team. This process typically takes 1-2 business days.
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-white rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Submission Date</p>
                    <p className="font-medium">{new Date(kycData.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reference ID</p>
                    <p className="font-medium">{kycData.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className="bg-amber-500">Pending</Badge>
                  </div>
                </div>
                
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Verification in progress</AlertTitle>
                  <AlertDescription>
                    You'll receive an email notification once your verification is complete.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/investor")}>
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        ) : kycData?.status === "rejected" ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileWarning className="h-6 w-6 text-red-600" />
                <CardTitle className="text-red-700">Verification Declined</CardTitle>
              </div>
              <CardDescription className="text-red-600">
                Your verification could not be completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-red-700">
                  Unfortunately, your KYC verification was not approved. Please review the feedback below and submit your information again.
                </p>
                
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Rejection Reason</AlertTitle>
                  <AlertDescription>
                    {kycData.rejectionReason || "Some of the provided documents did not meet our requirements."}
                  </AlertDescription>
                </Alert>
                
                <div className="mt-6">
                  <KycSubmissionForm />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <KycSubmissionForm />
        )}
      </div>
    </SharedLayout>
  );
}