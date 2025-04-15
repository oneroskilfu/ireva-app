import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PhoneVerificationForm } from "@/components/auth/PhoneVerification";
import { KycVerificationForm } from "@/components/auth/KycVerification";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Shield, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Steps,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  StepNumber,
} from "@/components/ui/steps";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VerificationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);
  
  // Get user verification status
  const { data: verificationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/auth/verification-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/verification-status");
      return res.json();
    },
    enabled: !!user, // Only run if user is logged in
  });

  useEffect(() => {
    // Determine starting step based on verification status
    if (verificationStatus) {
      if (verificationStatus.isPhoneVerified) {
        setPhoneVerified(true);
        setCurrentStep(1); // Move to KYC step
      }
      
      if (verificationStatus.kycStatus !== "not_started") {
        setKycSubmitted(true);
      }
    }
  }, [verificationStatus]);

  const handlePhoneVerified = (phoneNumber: string) => {
    setPhoneVerified(true);
    toast({
      title: "Phone verified successfully!",
      description: "Your phone number has been verified.",
    });
    setCurrentStep(1); // Move to KYC step
  };

  const handleKycSubmitted = () => {
    setKycSubmitted(true);
    setCurrentStep(2); // Move to completion step
  };

  // Handle loading state
  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-gray-500">Loading verification status...</p>
        </div>
      </div>
    );
  }

  // Redirect if user is not logged in
  if (!user && !authLoading) {
    toast({
      title: "Authentication required",
      description: "Please sign in to access the verification page.",
      variant: "destructive",
    });
    return <Redirect to="/auth" />;
  }

  const getKycStatusForUI = (): "not_started" | "pending" | "verified" | "rejected" => {
    if (!verificationStatus) return "not_started";
    return verificationStatus.kycStatus as "not_started" | "pending" | "verified" | "rejected";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold">Account Verification</h1>
            <p className="text-gray-600 mt-2">
              Complete the verification process to unlock all platform features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Verification Process</CardTitle>
                  <CardDescription>
                    Complete these steps to fully verify your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Steps orientation="vertical" activeStep={currentStep}>
                    <div className="space-y-4">
                      <Step
                        title="Phone Verification"
                        description="Verify your phone number via SMS"
                        status={phoneVerified ? "complete" : "active"}
                      />
                      
                      <Step
                        title="Identity Verification"
                        description="Submit documents to verify your identity"
                        status={
                          !phoneVerified 
                            ? "inactive" 
                            : kycSubmitted 
                              ? "complete" 
                              : "active"
                        }
                      />
                      
                      <Step
                        title="Verification Complete"
                        description="Enjoy all platform features"
                        status={
                          kycSubmitted && verificationStatus?.kycStatus === "verified"
                            ? "complete"
                            : "inactive"
                        }
                      />
                    </div>
                  </Steps>
                  
                  <Alert className="mt-6">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Secured & Protected</AlertTitle>
                    <AlertDescription>
                      All your verification documents are encrypted and securely stored
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {currentStep === 0 && (
                <PhoneVerificationForm 
                  onVerificationComplete={handlePhoneVerified}
                  initialPhoneNumber={user?.phoneNumber}
                />
              )}
              
              {currentStep === 1 && (
                <KycVerificationForm 
                  onVerificationSubmitted={handleKycSubmitted}
                  kycStatus={getKycStatusForUI()}
                />
              )}
              
              {currentStep === 2 && (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>
                      Status of your account verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {verificationStatus?.kycStatus === "pending" && (
                      <Alert className="bg-orange-50 border-orange-200">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <AlertTitle className="text-orange-700">
                          Verification in Progress
                        </AlertTitle>
                        <AlertDescription className="text-orange-600">
                          Your identity verification is currently under review. This usually takes 24-48 hours.
                          We'll notify you once the review is complete.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {verificationStatus?.kycStatus === "verified" && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-700">
                          Verification Complete
                        </AlertTitle>
                        <AlertDescription className="text-green-600">
                          Congratulations! Your account is fully verified. You now have access to all platform features.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {verificationStatus?.kycStatus === "rejected" && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertTitle className="text-red-700">
                          Verification Rejected
                        </AlertTitle>
                        <AlertDescription className="text-red-600">
                          Your identity verification was rejected. Please check your email for more details
                          about why verification failed and how to resubmit.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-medium">Verification Summary</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                            <span>Phone Verification</span>
                          </div>
                          <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                            Complete
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                          <div className="flex items-center">
                            {verificationStatus?.kycStatus === "verified" && (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                            )}
                            {verificationStatus?.kycStatus === "pending" && (
                              <Loader2 className="h-5 w-5 text-orange-500 mr-2 animate-spin" />
                            )}
                            {verificationStatus?.kycStatus === "rejected" && (
                              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span>Identity Verification</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              verificationStatus?.kycStatus === "verified"
                                ? "text-green-600 bg-green-50 border-green-200"
                                : verificationStatus?.kycStatus === "pending"
                                ? "text-orange-600 bg-orange-50 border-orange-200"
                                : "text-red-600 bg-red-50 border-red-200"
                            }
                          >
                            {verificationStatus?.kycStatus === "verified" && "Complete"}
                            {verificationStatus?.kycStatus === "pending" && "In Progress"}
                            {verificationStatus?.kycStatus === "rejected" && "Failed"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-8">
                      <Button className="w-full md:w-48" asChild>
                        <a href="/dashboard">
                          Go to Dashboard
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Step component for the vertical stepper
function Step({ title, description, status }: { 
  title: string; 
  description: string; 
  status: "inactive" | "active" | "complete";
}) {
  return (
    <div className="flex">
      <StepIndicator>
        <StepStatus
          complete={<CheckCircle2 className="h-6 w-6" />}
          incomplete={<StepNumber />}
          active={<StepNumber />}
        />
      </StepIndicator>

      <div className="ml-4">
        <StepTitle 
          className={
            status === "inactive" 
              ? "text-gray-400" 
              : status === "complete" 
                ? "text-green-700" 
                : ""
          }
        >
          {title}
        </StepTitle>
        <StepDescription
          className={
            status === "inactive" 
              ? "text-gray-400" 
              : ""
          }
        >
          {description}
        </StepDescription>
      </div>
    </div>
  );
}