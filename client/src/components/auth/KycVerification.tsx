import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { KycDocument } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Loader2,
  Upload,
  FileImage,
  FileCheck,
  Info,
  Check,
  X
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Form validation schema
const kycSchema = z.object({
  idType: z.enum(["national_id", "drivers_license", "passport", "voters_card"], {
    required_error: "Please select an ID type",
  }),
  idNumber: z.string()
    .min(3, { message: "ID number must be at least 3 characters" })
    .max(50, { message: "ID number must not exceed 50 characters" }),
  frontImage: z.string({
    required_error: "Please upload the front of your ID",
  }),
  backImage: z.string().optional(),
  selfieImage: z.string({
    required_error: "Please upload a selfie photo",
  }),
  addressProofType: z.enum(["utility_bill", "bank_statement", "tax_document", "rental_agreement"], {
    required_error: "Please select an address proof type",
  }).optional(),
  addressProofImage: z.string().optional(),
});

type KycFormValues = z.infer<typeof kycSchema>;

interface KycVerificationProps {
  onVerificationSubmitted: () => void;
  kycStatus?: string;
}

export function KycVerificationForm({ onVerificationSubmitted, kycStatus }: KycVerificationProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("identity");
  const [uploading, setUploading] = useState(false);
  
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      idType: undefined,
      idNumber: "",
      frontImage: "",
      backImage: "",
      selfieImage: "",
      addressProofType: undefined,
      addressProofImage: "",
    },
  });

  const submitKycMutation = useMutation({
    mutationFn: async (data: KycDocument) => {
      const response = await apiRequest("POST", "/api/auth/submit-kyc", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC information submitted successfully!",
        description: "We'll review your information and update your status shortly.",
      });
      onVerificationSubmitted();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: KycFormValues) => {
    submitKycMutation.mutate(data as KycDocument);
  };

  const mockFileUpload = async (acceptedFileTypes: string) => {
    setUploading(true);
    // Simulating file upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUploading(false);
    // Return a mock URL - in a real implementation this would be the URL of the uploaded file
    return "https://example.com/uploaded-file.jpg";
  };

  const handleFileUpload = async (field: keyof KycFormValues) => {
    try {
      const fileUrl = await mockFileUpload("image/*");
      form.setValue(field, fileUrl);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (kycStatus === "pending") {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Your KYC verification is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Loader2 className="h-5 w-5 mr-2 animate-spin text-orange-500" />
            <AlertTitle>Under review</AlertTitle>
            <AlertDescription>
              Your identity verification is currently being reviewed by our team. This usually takes 24-48 hours. We'll notify you once the review is complete.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (kycStatus === "verified") {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Your identity has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-5 w-5 mr-2 text-green-500" />
            <AlertTitle className="text-green-700">Verification successful</AlertTitle>
            <AlertDescription className="text-green-600">
              Your identity has been verified. You now have access to all features of the platform.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (kycStatus === "rejected") {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Your KYC verification was not approved
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-red-50 border-red-200">
            <X className="h-5 w-5 mr-2 text-red-500" />
            <AlertTitle className="text-red-700">Verification rejected</AlertTitle>
            <AlertDescription className="text-red-600">
              Your identity verification was rejected. Please resubmit with clearer documents and ensure all information is accurate.
            </AlertDescription>
          </Alert>
          
          <Button onClick={() => window.location.reload()} className="mt-4 w-full">
            Resubmit Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Complete identity verification to unlock all platform features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs 
              defaultValue="identity" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="identity">Identity Verification</TabsTrigger>
                <TabsTrigger value="address">Address Verification</TabsTrigger>
              </TabsList>
              
              <TabsContent value="identity" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="idType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={submitKycMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="national_id">National ID</SelectItem>
                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="voters_card">Voter's Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the type of identification you'll provide
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
                          <Input 
                            placeholder="Enter your ID number" 
                            {...field} 
                            disabled={submitKycMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the number on your identification document
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="frontImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Front of ID</FormLabel>
                        <FormControl>
                          <div className="mt-1">
                            {field.value ? (
                              <div className="relative h-40 border rounded-md overflow-hidden bg-muted/30">
                                <div className="absolute inset-0 flex items-center justify-center bg-green-50">
                                  <FileCheck className="h-16 w-16 text-green-500 opacity-70" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                    Document uploaded
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 h-8 w-8 p-0 rounded-full"
                                  onClick={() => form.setValue("frontImage", "")}
                                  disabled={submitKycMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                type="button"
                                variant="outline"
                                className="h-40 w-full border-dashed flex flex-col items-center justify-center gap-2"
                                onClick={() => handleFileUpload("frontImage")}
                                disabled={uploading || submitKycMutation.isPending}
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                    <span className="text-sm text-muted-foreground">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileImage className="h-10 w-10 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Click to upload front of ID</span>
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a clear photo of the front of your ID
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
                        <FormLabel>Back of ID (Optional)</FormLabel>
                        <FormControl>
                          <div className="mt-1">
                            {field.value ? (
                              <div className="relative h-40 border rounded-md overflow-hidden bg-muted/30">
                                <div className="absolute inset-0 flex items-center justify-center bg-green-50">
                                  <FileCheck className="h-16 w-16 text-green-500 opacity-70" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                    Document uploaded
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 h-8 w-8 p-0 rounded-full"
                                  onClick={() => form.setValue("backImage", "")}
                                  disabled={submitKycMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                type="button"
                                variant="outline"
                                className="h-40 w-full border-dashed flex flex-col items-center justify-center gap-2"
                                onClick={() => handleFileUpload("backImage")}
                                disabled={uploading || submitKycMutation.isPending}
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                    <span className="text-sm text-muted-foreground">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileImage className="h-10 w-10 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Click to upload back of ID</span>
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a clear photo of the back of your ID (if applicable)
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
                      <FormLabel>Selfie Photo</FormLabel>
                      <FormControl>
                        <div className="mt-1">
                          {field.value ? (
                            <div className="relative h-40 w-40 mx-auto border rounded-md overflow-hidden bg-muted/30">
                              <div className="absolute inset-0 flex items-center justify-center bg-green-50 rounded-full">
                                <FileCheck className="h-16 w-16 text-green-500 opacity-70" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                  Selfie uploaded
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 h-8 w-8 p-0 rounded-full"
                                onClick={() => form.setValue("selfieImage", "")}
                                disabled={submitKycMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              type="button"
                              variant="outline"
                              className="h-40 w-40 mx-auto border-dashed flex flex-col items-center justify-center gap-2 rounded-full"
                              onClick={() => handleFileUpload("selfieImage")}
                              disabled={uploading || submitKycMutation.isPending}
                            >
                              {uploading ? (
                                <>
                                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                  <span className="text-sm text-muted-foreground">Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-10 w-10 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground text-center">Upload selfie</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-center">
                        Upload a clear photo of your face for verification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-6 flex items-center justify-between">
                  <div></div> {/* Empty div for spacing */}
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("address")}
                    disabled={
                      !form.getValues().idType || 
                      !form.getValues().idNumber ||
                      !form.getValues().frontImage ||
                      !form.getValues().selfieImage
                    }
                  >
                    Continue to Address Verification
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="address" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Address verification is optional</AlertTitle>
                  <AlertDescription>
                    While not required, providing address verification documents can help increase your investment limits.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <FormField
                    control={form.control}
                    name="addressProofType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Proof Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={submitKycMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="utility_bill">Utility Bill</SelectItem>
                            <SelectItem value="bank_statement">Bank Statement</SelectItem>
                            <SelectItem value="tax_document">Tax Document</SelectItem>
                            <SelectItem value="rental_agreement">Rental Agreement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the type of address proof you'll provide
                        </FormDescription>
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
                          <div className="mt-1">
                            {field.value ? (
                              <div className="relative h-40 border rounded-md overflow-hidden bg-muted/30">
                                <div className="absolute inset-0 flex items-center justify-center bg-green-50">
                                  <FileCheck className="h-16 w-16 text-green-500 opacity-70" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                    Document uploaded
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 h-8 w-8 p-0 rounded-full"
                                  onClick={() => form.setValue("addressProofImage", "")}
                                  disabled={submitKycMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                type="button"
                                variant="outline"
                                className="h-40 w-full border-dashed flex flex-col items-center justify-center gap-2"
                                onClick={() => handleFileUpload("addressProofImage")}
                                disabled={uploading || submitKycMutation.isPending || !form.getValues().addressProofType}
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                    <span className="text-sm text-muted-foreground">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileImage className="h-10 w-10 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Click to upload address proof</span>
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a clear photo of your address proof document (not older than 3 months)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => setActiveTab("identity")}
                  >
                    Back to Identity
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="w-48"
                    disabled={submitKycMutation.isPending}
                  >
                    {submitKycMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Verification"
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
}