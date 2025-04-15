import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Upload, FileText, CreditCard, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { KycDocument } from "@shared/schema";

const kycSchema = z.object({
  idType: z.enum(["national_id", "drivers_license", "passport", "voters_card"], {
    required_error: "Please select an ID type",
  }),
  idNumber: z.string().min(5, "ID number must be at least 5 characters"),
  frontImage: z.string().min(10, "Please upload the front of your ID"),
  backImage: z.string().optional(),
  selfieImage: z.string().min(10, "Please upload a selfie holding your ID"),
  addressProofType: z.enum(["utility_bill", "bank_statement", "rental_agreement", "tax_document"], {
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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
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
  
  const submitKycMutation = useMutation<any, Error, KycDocument>({
    mutationFn: async (data: KycDocument) => {
      const response = await apiRequest("POST", "/api/auth/submit-kyc", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit KYC documents");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documents submitted",
        description: "Your verification documents have been submitted for review",
      });
      onVerificationSubmitted();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message,
      });
    },
  });
  
  const onSubmit = (data: KycFormValues) => {
    submitKycMutation.mutate(data);
  };
  
  const mockFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // This is a mock upload - in a real implementation, you would upload the file to a server
    // and get back a URL. Here we're just creating a data URL for demo purposes.
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(fieldName as any, reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
      });
    }
  };
  
  // When KYC is already submitted, show the status
  if (kycStatus && kycStatus !== "not_started") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Status</CardTitle>
          <CardDescription>
            {kycStatus === "pending" && "Your documents are being reviewed by our team."}
            {kycStatus === "verified" && "Your identity has been verified successfully."}
            {kycStatus === "rejected" && "Your verification was rejected. Please contact support."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            {kycStatus === "pending" && (
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-muted-foreground">This usually takes 1-2 business days.</p>
              </div>
            )}
            {kycStatus === "verified" && (
              <div className="text-center text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-muted-foreground">You are now fully verified and can access all features.</p>
              </div>
            )}
            {kycStatus === "rejected" && (
              <div className="text-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-muted-foreground">Please contact our support team for assistance.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>
          Verify your identity to unlock full access to the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="idType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>ID Document Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="national_id"
                          id="national_id"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="national_id"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <CreditCard className="mb-3 h-6 w-6" />
                          National ID
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="drivers_license"
                          id="drivers_license"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="drivers_license"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <CreditCard className="mb-3 h-6 w-6" />
                          Driver's License
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="passport"
                          id="passport"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="passport"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          Passport
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="voters_card"
                          id="voters_card"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="voters_card"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <CreditCard className="mb-3 h-6 w-6" />
                          Voter's Card
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
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
                    <Input placeholder="Enter your ID number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="frontImage"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Front of ID</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-full">
                          <Label
                            htmlFor="frontImage"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            {value ? (
                              <div className="flex flex-col items-center justify-center">
                                <img
                                  src={value}
                                  alt="Front of ID"
                                  className="w-28 h-28 object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload
                                </p>
                              </div>
                            )}
                            <Input
                              id="frontImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => mockFileUpload(e, "frontImage")}
                              disabled={isUploading}
                              {...fieldProps}
                            />
                          </Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="backImage"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Back of ID (if applicable)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-full">
                          <Label
                            htmlFor="backImage"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            {value ? (
                              <div className="flex flex-col items-center justify-center">
                                <img
                                  src={value}
                                  alt="Back of ID"
                                  className="w-28 h-28 object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload
                                </p>
                              </div>
                            )}
                            <Input
                              id="backImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => mockFileUpload(e, "backImage")}
                              disabled={isUploading}
                              {...fieldProps}
                            />
                          </Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Skip this if you're uploading a passport
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="selfieImage"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Selfie with ID</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-full">
                          <Label
                            htmlFor="selfieImage"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            {value ? (
                              <div className="flex flex-col items-center justify-center">
                                <img
                                  src={value}
                                  alt="Selfie with ID"
                                  className="w-28 h-28 object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload
                                </p>
                              </div>
                            )}
                            <Input
                              id="selfieImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => mockFileUpload(e, "selfieImage")}
                              disabled={isUploading}
                              {...fieldProps}
                            />
                          </Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Take a photo of yourself holding your ID
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="addressProofType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Proof of Address (Optional)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="utility_bill"
                          id="utility_bill"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="utility_bill"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Home className="mb-3 h-6 w-6" />
                          Utility Bill
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="bank_statement"
                          id="bank_statement"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="bank_statement"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          Bank Statement
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="rental_agreement"
                          id="rental_agreement"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="rental_agreement"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          Rental Agreement
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="tax_document"
                          id="tax_document"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="tax_document"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          Tax Document
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Select a document type that shows your current address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("addressProofType") && (
              <FormField
                control={form.control}
                name="addressProofImage"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Address Document</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-full">
                          <Label
                            htmlFor="addressProofImage"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            {value ? (
                              <div className="flex flex-col items-center justify-center">
                                <img
                                  src={value}
                                  alt="Address proof"
                                  className="w-28 h-28 object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload
                                </p>
                              </div>
                            )}
                            <Input
                              id="addressProofImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => mockFileUpload(e, "addressProofImage")}
                              disabled={isUploading}
                              {...fieldProps}
                            />
                          </Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isUploading || submitKycMutation.isPending}
            >
              {submitKycMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Documents"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}