import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Check, 
  AlertTriangle, 
  Upload, 
  ShieldCheck,
  User, 
  CreditCard, 
  Home
} from 'lucide-react';

interface KYCStatus {
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  documents?: {
    idType?: string;
    idNumber?: string;
    hasFrontImage?: boolean;
    hasBackImage?: boolean;
    hasSelfie?: boolean;
    hasAddressProof?: boolean;
  };
}

// Form schema
const kycFormSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters.",
  }),
  idType: z.string({
    required_error: "Please select an ID type.",
  }),
  idNumber: z.string().min(1, {
    message: "ID number is required.",
  }),
  bankName: z.string().min(1, {
    message: "Bank name is required.",
  }),
  accountNumber: z.string().min(10, {
    message: "Account number must be at least 10 digits.",
  }),
  address: z.string().min(10, {
    message: "Please provide a complete address.",
  }),
  frontImage: z.string().min(1, {
    message: "ID front image is required.",
  }),
  backImage: z.string().optional(),
  selfieImage: z.string().min(1, {
    message: "Selfie with ID is required.",
  }),
  addressProofType: z.string().optional(),
  addressProofImage: z.string().optional(),
});

type KYCFormValues = z.infer<typeof kycFormSchema>;

const KYCForm = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  
  // Get KYC status
  const { data: kycStatus, isLoading: isLoadingStatus } = useQuery<KYCStatus>({
    queryKey: ['/api/investor/kyc/status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investor/kyc/status');
      return await res.json();
    },
  });

  // Form initialization
  const form = useForm<KYCFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      fullName: "",
      idType: "",
      idNumber: "",
      bankName: "",
      accountNumber: "",
      address: "",
      frontImage: "",
      backImage: "",
      selfieImage: "",
      addressProofType: "",
      addressProofImage: "",
    },
  });

  // File upload handling
  const [files, setFiles] = useState<{
    frontImage?: File;
    backImage?: File;
    selfieImage?: File;
    addressProofImage?: File;
  }>({});

  // Submit KYC information
  const submitMutation = useMutation({
    mutationFn: async (values: KYCFormValues) => {
      // In a real implementation, this would first upload files to get URLs
      // Then submit the form with those URLs
      const res = await apiRequest('POST', '/api/investor/kyc/submit', values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted Successfully",
        description: "Your KYC information has been submitted for verification. We'll notify you once it's processed.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/investor/kyc/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit KYC information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, we would save the file and get a URL
      setFiles(prev => ({ ...prev, [field]: file }));
      
      // For demonstration purposes, we'll create a mock URL that would normally come from file upload
      // In production, you would upload the file to a server or S3 first
      const mockFileUrl = `https://example.com/uploads/${field}_${file.name}`;
      form.setValue(field as any, mockFileUrl);
    }
  };

  const onSubmit = (values: KYCFormValues) => {
    submitMutation.mutate(values);
  };

  // Render KYC status section if already submitted
  if (kycStatus && kycStatus.status !== 'not_started') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Status</CardTitle>
          <CardDescription>Your identity verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              {kycStatus.status === 'pending' && (
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-50 text-yellow-700 rounded-full p-3 mb-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium">Verification In Progress</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your documents are being reviewed by our team. This usually takes 1-2 business days.
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Submitted on {new Date(kycStatus.submittedAt || '').toLocaleDateString()}
                  </p>
                </div>
              )}

              {kycStatus.status === 'verified' && (
                <div className="flex flex-col items-center">
                  <div className="bg-green-50 text-green-700 rounded-full p-3 mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium">Verification Complete</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your identity has been verified. You now have full access to all platform features.
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Verified on {new Date(kycStatus.verifiedAt || '').toLocaleDateString()}
                  </p>
                </div>
              )}

              {kycStatus.status === 'rejected' && (
                <div className="flex flex-col items-center">
                  <div className="bg-red-50 text-red-700 rounded-full p-3 mb-4">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium">Verification Rejected</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your verification was rejected for the following reason:
                  </p>
                  <div className="mt-2 p-4 bg-red-50 text-red-800 rounded-md text-sm">
                    {kycStatus.rejectionReason || 'No reason provided.'}
                  </div>
                  <Button variant="default" className="mt-6" onClick={() => submitMutation.reset()}>
                    Resubmit Information
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render the KYC form for new submissions
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Please provide your information for identity verification. 
          This is required for regulatory compliance and to protect your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" /> Personal
                </TabsTrigger>
                <TabsTrigger value="banking">
                  <CreditCard className="h-4 w-4 mr-2" /> Banking
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <ShieldCheck className="h-4 w-4 mr-2" /> Documents
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full legal name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide your name exactly as it appears on your ID document.
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
                        <Textarea 
                          placeholder="Enter your complete residential address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide your current residential address. P.O. boxes are not accepted.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab('banking')}
                  >
                    Next <CreditCard className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="banking" className="space-y-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your bank name" {...field} />
                      </FormControl>
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
                        <Input 
                          placeholder="Enter your bank account number" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This is where your investment returns will be sent.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('personal')}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab('documents')}
                  >
                    Next <ShieldCheck className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
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
                            <SelectValue placeholder="Select an ID type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="national_id">National ID</SelectItem>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="voters_card">Voter's Card</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input 
                          placeholder="Enter your ID number" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="frontImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Front Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'frontImage')}
                              className="flex-1"
                            />
                            {field.value && (
                              <div className="bg-green-100 text-green-800 p-1 rounded-md">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a clear photo of the front of your ID.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="backImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Back Image (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'backImage')}
                              className="flex-1"
                            />
                            {field.value && (
                              <div className="bg-green-100 text-green-800 p-1 rounded-md">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a clear photo of the back of your ID if applicable.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="selfieImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selfie with ID</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'selfieImage')}
                            className="flex-1"
                          />
                          {field.value && (
                            <div className="bg-green-100 text-green-800 p-1 rounded-md">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a photo of yourself holding your ID document.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                  <h3 className="text-sm font-medium">Address Verification (Optional)</h3>
                  <FormField
                    control={form.control}
                    name="addressProofType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Proof Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an address proof type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="utility_bill">Utility Bill</SelectItem>
                            <SelectItem value="bank_statement">Bank Statement</SelectItem>
                            <SelectItem value="tax_document">Tax Document</SelectItem>
                            <SelectItem value="rental_agreement">Rental Agreement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="addressProofImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Proof Document</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'addressProofImage')}
                              className="flex-1"
                            />
                            {field.value && (
                              <div className="bg-green-100 text-green-800 p-1 rounded-md">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a document that shows your name and current address.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('banking')}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit KYC Documents
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default KYCForm;