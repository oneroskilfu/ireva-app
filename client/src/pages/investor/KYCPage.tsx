import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check, Clock, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaterialKYCForm from '@/components/KYC/KYCForm';

const kycFormSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  address: z.string().min(3, "Address must be at least 3 characters"),
  idType: z.enum(["national_id", "drivers_license", "passport", "voters_card"]),
  idNumber: z.string().min(3, "ID number must be at least 3 characters"),
  bankName: z.string().min(2, "Bank name must be at least 2 characters"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
});

type KYCFormValues = z.infer<typeof kycFormSchema>;

const KYCPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Define KYC status type
  interface KYCStatusResponse {
    status: 'not_started' | 'pending' | 'verified' | 'rejected';
    submittedAt?: string;
    verifiedAt?: string;
    rejectionReason?: string;
    submission?: any;
  }
  
  // Get KYC status
  const { data: kycStatus, isLoading: statusLoading, error: statusError } = useQuery<KYCStatusResponse>({
    queryKey: ['/api/kyc/status'],
    enabled: !!user,
  });

  const form = useForm<KYCFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      fullName: '',
      address: '',
      idType: 'national_id',
      idNumber: '',
      bankName: '',
      accountNumber: '',
    },
  });

  const kycMutation = useMutation({
    mutationFn: async (data: KYCFormValues) => {
      const response = await apiRequest('POST', '/api/kyc', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted",
        description: "Your KYC information has been submitted for verification.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
      setSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your KYC information. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    },
  });

  const onSubmit = (data: KYCFormValues) => {
    setSubmitting(true);
    kycMutation.mutate(data);
  };

  // Display status cards based on KYC status
  const renderKYCStatus = () => {
    if (statusLoading) {
      return (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (statusError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading KYC status</AlertTitle>
          <AlertDescription>
            Unable to retrieve your KYC status. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      );
    }

    if (!kycStatus) {
      return null;
    }

    const statusMap = {
      not_started: {
        icon: <Shield className="h-8 w-8 text-gray-500" />,
        title: "KYC Not Started",
        description: "Complete your KYC to unlock investment opportunities.",
        color: "border-gray-200 bg-gray-50",
      },
      pending: {
        icon: <Clock className="h-8 w-8 text-amber-500" />,
        title: "KYC Pending Verification",
        description: "Your KYC submission is under review. We'll notify you once it's verified.",
        color: "border-amber-200 bg-amber-50",
      },
      verified: {
        icon: <Check className="h-8 w-8 text-green-500" />,
        title: "KYC Verified",
        description: "Your identity has been verified. You can now invest in all available properties.",
        color: "border-green-200 bg-green-50",
      },
      rejected: {
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        title: "KYC Rejected",
        description: `Your KYC was rejected. Reason: ${kycStatus.rejectionReason || 'Not specified'}. Please update and resubmit.`,
        color: "border-red-200 bg-red-50",
      }
    };

    const currentStatus = statusMap[kycStatus.status as keyof typeof statusMap];

    return (
      <div className={`mb-8 rounded-lg border p-4 ${currentStatus.color}`}>
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            {currentStatus.icon}
          </div>
          <div>
            <h3 className="text-lg font-medium">{currentStatus.title}</h3>
            <p className="text-sm text-gray-600">{currentStatus.description}</p>
            {kycStatus.submittedAt && (
              <p className="mt-2 text-xs text-gray-500">
                Submitted: {new Date(kycStatus.submittedAt).toLocaleDateString()}
              </p>
            )}
            {kycStatus.verifiedAt && (
              <p className="text-xs text-gray-500">
                Verified: {new Date(kycStatus.verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show form only if KYC is not yet submitted or was rejected
  const showForm = !kycStatus || kycStatus.status === 'not_started' || kycStatus.status === 'rejected';

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-6 text-3xl font-bold">KYC Verification</h1>
      <p className="mb-6 text-gray-600">
        To comply with regulations and protect our investors, we require Know Your Customer (KYC) verification.
        This information helps us verify your identity and prevent fraud.
      </p>

      {renderKYCStatus()}

      {showForm && (
        <Tabs defaultValue="shadcn" className="mb-8">
          <div className="mb-4 flex justify-center">
            <TabsList>
              <TabsTrigger value="shadcn">ShadCN UI Form</TabsTrigger>
              <TabsTrigger value="material">Material UI Form</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="shadcn">
            <Card>
              <CardHeader>
                <CardTitle>KYC Submission Form</CardTitle>
                <CardDescription>
                  Please provide the required information to complete your KYC verification.
                  All fields are mandatory and will be verified.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Legal Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter your name as it appears on official documents
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Residential Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St, City" {...field} />
                            </FormControl>
                            <FormDescription>Your current residential address</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="idType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="national_id">National ID</SelectItem>
                                <SelectItem value="drivers_license">Driver's License</SelectItem>
                                <SelectItem value="passport">International Passport</SelectItem>
                                <SelectItem value="voters_card">Voter's Card</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the type of identification you will provide
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                              <Input placeholder="ID12345678" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the number on your identification document
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Access Bank" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your primary bank for investment transactions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="0123456789" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your bank account number (minimum 10 digits)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-2">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Document Uploads Coming Soon</AlertTitle>
                        <AlertDescription>
                          In the next phase, you'll be able to upload photos of your ID and proof of address. 
                          For now, please complete this basic information.
                        </AlertDescription>
                      </Alert>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit KYC Information"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col text-sm text-gray-500">
                <p>Your information is secured with bank-level encryption and will only be used for verification purposes.</p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="material">
            <MaterialKYCForm />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default KYCPage;