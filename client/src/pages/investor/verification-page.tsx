import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Link } from "wouter";
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PhoneVerificationForm } from "@/components/auth/PhoneVerification";
import { KycVerificationForm } from "@/components/auth/KycVerification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Steps, StepIndicator, StepSeparator, StepTitle, StepDescription } from "@/components/ui/steps";
import { apiRequest } from "@/lib/queryClient";

type VerificationStatus = {
  isPhoneVerified: boolean;
  kycStatus: "not_started" | "pending" | "verified" | "rejected";
  kycSubmittedAt: string | null;
  kycVerifiedAt: string | null;
};

export default function VerificationPage() {
  const { user, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  
  const { data: verificationStatus, isLoading: isVerificationLoading, refetch } = useQuery<VerificationStatus>({
    queryKey: ["/api/auth/verification-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/verification-status");
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      return res.json();
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    // If user has verified phone, move to KYC step
    if (verificationStatus?.isPhoneVerified) {
      setActiveStep(1);
    }
    
    // If user has verified KYC, move to completion step
    if (verificationStatus?.kycStatus === "verified") {
      setActiveStep(2);
    }
  }, [verificationStatus]);
  
  // Handle loading and unauthenticated states
  if (isLoading || isVerificationLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  const handlePhoneVerified = () => {
    refetch();
  };
  
  const handleKycSubmitted = () => {
    refetch();
  };
  
  const getStepStatus = (step: number) => {
    if (step === 0) {
      return verificationStatus?.isPhoneVerified
        ? "complete"
        : "current";
    }
    
    if (step === 1) {
      if (verificationStatus?.kycStatus === "verified") {
        return "complete";
      }
      
      if (verificationStatus?.isPhoneVerified) {
        return "current";
      }
      
      return "upcoming";
    }
    
    if (step === 2) {
      if (verificationStatus?.kycStatus === "verified") {
        return "current";
      }
      
      return "upcoming";
    }
    
    return "upcoming";
  };
  
  return (
    <Layout>
      <div className="container max-w-4xl px-4 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Verify Your Account</h1>
          <p className="text-muted-foreground">
            Complete these steps to verify your account and gain full access to iREVA.
          </p>
        </div>
        
        <div className="mb-8">
          <Steps activeStep={activeStep} className="mb-10">
            <div className="flex items-center">
              <StepIndicator step={0}>1</StepIndicator>
              <div className="ml-4">
                <StepTitle>Phone Verification</StepTitle>
                <StepDescription>Verify your phone number</StepDescription>
              </div>
            </div>
            <StepSeparator />
            <div className="flex items-center">
              <StepIndicator step={1}>2</StepIndicator>
              <div className="ml-4">
                <StepTitle>Identity Verification</StepTitle>
                <StepDescription>Submit your KYC documents</StepDescription>
              </div>
            </div>
            <StepSeparator />
            <div className="flex items-center">
              <StepIndicator step={2}>3</StepIndicator>
              <div className="ml-4">
                <StepTitle>Verification Complete</StepTitle>
                <StepDescription>Your account is verified</StepDescription>
              </div>
            </div>
          </Steps>
        </div>
        
        {activeStep === 0 && (
          <PhoneVerificationForm 
            onVerificationComplete={handlePhoneVerified} 
            initialPhoneNumber={user.phoneNumber || undefined}
          />
        )}
        
        {activeStep === 1 && (
          <KycVerificationForm 
            onVerificationSubmitted={handleKycSubmitted}
            kycStatus={verificationStatus?.kycStatus}
          />
        )}
        
        {activeStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Complete</CardTitle>
              <CardDescription>
                Your account has been fully verified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-green-100 rounded-full p-3 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">All Verification Steps Completed</h3>
                <p className="text-center text-muted-foreground mb-6">
                  Congratulations! Your account has been fully verified. You now have access to all features of iREVA, including investment opportunities.
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <Link href="/dashboard">
                    <Button variant="default" className="flex items-center">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/properties">
                    <Button variant="outline" className="flex items-center">
                      Browse Investment Properties
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {verificationStatus?.kycStatus === "rejected" && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <CardTitle className="text-red-600">Verification Issue</CardTitle>
              </div>
              <CardDescription>
                There was an issue with your verification documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your KYC verification was rejected. This could be due to issues with document quality, information mismatch, or other verification problems.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
}

function Step({ title, description, status }: { 
  title: string;
  description: string;
  status: "complete" | "current" | "upcoming";
}) {
  return (
    <div className="flex items-center">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
          status === "complete"
            ? "border-primary bg-primary text-primary-foreground"
            : status === "current"
            ? "border-primary text-primary"
            : "border-muted-foreground text-muted-foreground"
        }`}
      >
        {status === "complete" ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <span>{title.charAt(0)}</span>
        )}
      </div>
      <div className="ml-4">
        <p
          className={`text-sm font-medium ${
            status === "upcoming" ? "text-muted-foreground" : ""
          }`}
        >
          {title}
        </p>
        <p
          className={`text-sm ${
            status === "upcoming" ? "text-muted-foreground/70" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}