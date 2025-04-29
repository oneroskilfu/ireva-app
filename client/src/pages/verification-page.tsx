import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Redirect } from 'wouter';
import { 
  CheckCircle,
  XCircle,
  Circle,
  Clock,
  ArrowRight,
  Phone,
  FileCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneVerificationForm } from '@/components/auth/PhoneVerification';
import { KycVerificationForm } from '@/components/auth/KycVerification';

// Define verification status types
interface VerificationStatus {
  isPhoneVerified: boolean;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  kycRejectionReason?: string;
}

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
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
      // Phone verification step
      if (verificationStatus?.isPhoneVerified) {
        return { 
          status: 'completed', 
          icon: <CheckCircle className="h-8 w-8 text-green-500" /> 
        };
      }
      if (activeStep === 0) {
        return { 
          status: 'current', 
          icon: <Circle className="h-8 w-8 text-blue-500" /> 
        };
      }
      return { 
        status: 'pending', 
        icon: <Circle className="h-8 w-8 text-gray-300" /> 
      };
    } else if (step === 1) {
      // KYC verification step
      if (verificationStatus?.kycStatus === "verified") {
        return { 
          status: 'completed', 
          icon: <CheckCircle className="h-8 w-8 text-green-500" /> 
        };
      }
      if (verificationStatus?.kycStatus === "pending") {
        return { 
          status: 'waiting', 
          icon: <Clock className="h-8 w-8 text-yellow-500" /> 
        };
      }
      if (verificationStatus?.kycStatus === "rejected") {
        return { 
          status: 'rejected', 
          icon: <XCircle className="h-8 w-8 text-red-500" /> 
        };
      }
      if (activeStep === 1) {
        return { 
          status: 'current', 
          icon: <Circle className="h-8 w-8 text-blue-500" /> 
        };
      }
      return { 
        status: 'pending', 
        icon: <Circle className="h-8 w-8 text-gray-300" /> 
      };
    } else {
      // Completion step
      if (activeStep === 2) {
        return { 
          status: 'current', 
          icon: <CheckCircle className="h-8 w-8 text-green-500" /> 
        };
      }
      return { 
        status: 'pending', 
        icon: <Circle className="h-8 w-8 text-gray-300" /> 
      };
    }
  };
  
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Account Setup</h1>
      
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center">
          {getStepStatus(0).icon}
          <span className={`ml-2 mr-4 ${activeStep === 0 ? 'font-bold text-blue-600' : ''}`}>Phone Verification</span>
        </div>
        <ArrowRight className="mx-2 text-gray-300" />
        <div className="flex items-center">
          {getStepStatus(1).icon}
          <span className={`ml-2 mr-4 ${activeStep === 1 ? 'font-bold text-blue-600' : ''}`}>KYC Verification</span>
        </div>
        <ArrowRight className="mx-2 text-gray-300" />
        <div className="flex items-center">
          {getStepStatus(2).icon}
          <span className={`ml-2 ${activeStep === 2 ? 'font-bold text-blue-600' : ''}`}>Completed</span>
        </div>
      </div>
      
      {/* Step Content */}
      {activeStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-primary" />
              Phone Verification
            </CardTitle>
            <CardDescription>
              Verify your phone number to enhance your account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneVerificationForm 
              onVerificationComplete={handlePhoneVerified}
              initialPhoneNumber={user.phoneNumber || ""}
            />
          </CardContent>
        </Card>
      )}
      
      {activeStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-primary" />
              KYC Verification
            </CardTitle>
            <CardDescription>
              Complete your identity verification to access all platform features
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationStatus?.kycStatus === "pending" ? (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-medium text-yellow-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Verification in Progress
                </h3>
                <p className="mt-2 text-yellow-700">
                  Your KYC documents have been submitted and are currently under review. 
                  This process typically takes 1-2 business days.
                </p>
                {verificationStatus.kycSubmittedAt && (
                  <p className="mt-4 text-sm text-yellow-600">
                    Submitted on: {new Date(verificationStatus.kycSubmittedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : verificationStatus?.kycStatus === "rejected" ? (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                <h3 className="text-lg font-medium text-red-800 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Verification Rejected
                </h3>
                <p className="mt-2 text-red-700">
                  Unfortunately, your KYC verification was rejected. Please submit new documents.
                </p>
                {verificationStatus.kycRejectionReason && (
                  <p className="mt-2 text-red-700">
                    Reason: {verificationStatus.kycRejectionReason}
                  </p>
                )}
              </div>
            ) : null}
            
            {/* Don't show the form if KYC is pending */}
            {verificationStatus?.kycStatus !== "pending" && (
              <KycVerificationForm 
                onVerificationSubmitted={handleKycSubmitted} 
                kycStatus={verificationStatus?.kycStatus}
              />
            )}
          </CardContent>
        </Card>
      )}
      
      {activeStep === 2 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-800">
              <CheckCircle className="h-6 w-6 mr-2 text-emerald-600" />
              Verification Complete
            </CardTitle>
            <CardDescription className="text-emerald-700">
              Congratulations! Your account has been fully verified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-emerald-700 mb-4">
              You now have full access to all features on the iREVA platform.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-emerald-700">
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                Invest in all available properties
              </li>
              <li className="flex items-center text-emerald-700">
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                Access to premium investment opportunities
              </li>
              <li className="flex items-center text-emerald-700">
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                Full withdrawal capabilities
              </li>
              <li className="flex items-center text-emerald-700">
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                Participate in exclusive investment events
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.href = '/investor/dashboard'} className="w-full">
              Go to Your Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}