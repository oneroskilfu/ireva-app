import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import KYCForm from '@/components/KYCForm';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface KYCStatus {
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  notes?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
}

const KYCPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch KYC status
  const { data: kycData, isLoading } = useQuery<KYCStatus>({
    queryKey: ['/api/kyc/status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/kyc/status');
      return await res.json();
    },
  });

  const renderStatusContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Loading your KYC status...</p>
        </div>
      );
    }

    // If no KYC submission yet
    if (!kycData || kycData.status === 'not_started') {
      return <KYCForm />;
    }

    // If KYC is already submitted
    const statusMessages = {
      pending: {
        icon: <Clock className="h-16 w-16 text-yellow-500 mb-4" />,
        title: 'KYC Verification Pending',
        description: 'Your KYC information has been submitted and is currently being reviewed by our team.',
        badge: <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>,
      },
      verified: {
        icon: <CheckCircle className="h-16 w-16 text-green-500 mb-4" />,
        title: 'KYC Verification Approved',
        description: 'Congratulations! Your KYC verification has been approved. You now have full access to all investment opportunities.',
        badge: <Badge className="bg-green-500">Verified</Badge>,
      },
      rejected: {
        icon: <AlertCircle className="h-16 w-16 text-red-500 mb-4" />,
        title: 'KYC Verification Rejected',
        description: 'Your KYC verification was not approved. Please review the notes below and resubmit your information.',
        badge: <Badge variant="destructive">Rejected</Badge>,
      },
    };

    const statusInfo = statusMessages[kycData.status as keyof typeof statusMessages];

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center">{statusInfo.icon}</div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            {statusInfo.title} {statusInfo.badge}
          </CardTitle>
          <CardDescription className="text-base">
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {kycData.submittedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                <p>{new Date(kycData.submittedAt).toLocaleString()}</p>
              </div>
            )}
            
            {kycData.reviewedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reviewed On</p>
                <p>{new Date(kycData.reviewedAt).toLocaleString()}</p>
              </div>
            )}
            
            {kycData.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes from Reviewer</p>
                <p className="p-3 bg-muted rounded-md">{kycData.notes}</p>
              </div>
            )}
            
            {kycData.status === 'rejected' && (
              <div className="pt-4">
                <Button className="w-full" onClick={() => window.location.reload()}>
                  Submit New KYC Information
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">KYC Verification</h1>
      <p className="text-muted-foreground mb-8">
        Complete the Know Your Customer (KYC) process to invest in properties on our platform. 
        This verification is required by regulations and helps ensure the security of all investors.
      </p>
      
      {renderStatusContent()}
    </div>
  );
};

export default KYCPage;