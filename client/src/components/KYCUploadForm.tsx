import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, FileText, Upload, CreditCard, Home, User, ClipboardCheck } from 'lucide-react';

// File size limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

// Form schema for KYC
const kycFormSchema = z.object({
  idType: z.string().min(1, { message: 'Please select ID type' }),
  idNumber: z.string().min(1, { message: 'ID number is required' }),
  // ID card document validation
  idCardFile: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
    .refine(
      file => ACCEPTED_FILE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png, and .pdf files are accepted'
    ),
  // Address proof document validation
  addressProofFile: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
    .refine(
      file => ACCEPTED_FILE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png, and .pdf files are accepted'
    ),
  // Optional additional document
  additionalDocumentFile: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      file => !file || file.size <= MAX_FILE_SIZE,
      'File size must be less than 5MB'
    )
    .refine(
      file => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png, and .pdf files are accepted'
    ),
  // Additional user information
  occupation: z.string().min(1, { message: 'Occupation is required' }),
  sourceOfIncome: z.string().min(1, { message: 'Source of income is required' }),
  // Agreement checkbox
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' })
  })
});

type KycFormValues = z.infer<typeof kycFormSchema>;

const KYCUploadForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      idType: '',
      idNumber: '',
      occupation: '',
      sourceOfIncome: '',
      agreedToTerms: false
    }
  });

  const onSubmit = async (data: KycFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your KYC documents",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('idType', data.idType);
      formData.append('idNumber', data.idNumber);
      formData.append('idCard', data.idCardFile);
      formData.append('addressProof', data.addressProofFile);
      formData.append('occupation', data.occupation);
      formData.append('sourceOfIncome', data.sourceOfIncome);
      
      if (data.additionalDocumentFile) {
        formData.append('additionalDocument', data.additionalDocumentFile);
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Send data to backend
      const response = await apiRequest('POST', '/api/kyc/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update UI for success
      setUploadSuccess(true);
      toast({
        title: "KYC Submitted Successfully",
        description: "Your documents have been received and will be reviewed shortly.",
        variant: "default"
      });
    } catch (error) {
      console.error('KYC submission error:', error);
      
      let errorMessage = "Failed to submit KYC documents. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Manage form navigation
  const goToNextStep = () => {
    const currentTabFields = {
      1: ['idType', 'idNumber'],
      2: ['idCardFile', 'addressProofFile'],
      3: ['occupation', 'sourceOfIncome', 'agreedToTerms']
    }[currentStep];

    // Validate current tab fields
    const isValid = currentTabFields?.every(field => {
      form.trigger(field as keyof KycFormValues);
      return !form.formState.errors[field as keyof KycFormValues];
    });

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      // Show errors for current fields
      currentTabFields?.forEach(field => {
        form.trigger(field as keyof KycFormValues);
      });
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Helper for file input labels
  const getFileInputLabel = (file: File | null | undefined, defaultLabel: string) => {
    return file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : defaultLabel;
  };

  if (uploadSuccess) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            KYC Verification Submitted
          </CardTitle>
          <CardDescription className="text-center">
            Thank you for submitting your KYC documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification in Progress</AlertTitle>
            <AlertDescription>
              Our team will review your documents and update your verification status within 1-2 business days.
              You will receive a notification once the verification is complete.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-medium">What's Next?</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>While waiting, you can browse available investment opportunities</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Complete your investor profile by updating your investment preferences</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Explore educational resources to learn more about real estate investing</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Submit your documents to verify your identity and comply with regulatory requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            value={currentStep.toString()}
            onValueChange={(value) => setCurrentStep(parseInt(value))}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1" disabled={isSubmitting}>
                <User className="h-4 w-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="2" disabled={isSubmitting}>
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="3" disabled={isSubmitting}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Additional Info
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Personal Information */}
            <TabsContent value="1" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="idType">ID Type</Label>
                  <Select
                    onValueChange={(value) => form.setValue('idType', value)}
                    defaultValue={form.getValues('idType')}
                  >
                    <SelectTrigger id="idType" className="w-full">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">National ID Card</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="passport">International Passport</SelectItem>
                      <SelectItem value="voters_card">Voter's Card</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.idType && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.idType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    {...form.register('idNumber')}
                    placeholder="Enter your ID number"
                  />
                  {form.formState.errors.idNumber && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.idNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="button" onClick={goToNextStep}>
                  Next Step
                </Button>
              </div>
            </TabsContent>

            {/* Step 2: Document Upload */}
            <TabsContent value="2" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="idCardFile" className="flex items-center mb-2">
                    <CreditCard className="h-4 w-4 mr-2" />
                    ID Card Upload (Front & Back)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label 
                      htmlFor="idCardFile" 
                      className="border-2 border-dashed rounded-md p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50"
                    >
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {getFileInputLabel(form.getValues('idCardFile'), 'Click to upload or drag and drop')}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or PDF (max. 5MB)
                      </span>
                    </Label>
                    <Input
                      id="idCardFile"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue('idCardFile', file);
                          form.trigger('idCardFile');
                        }
                      }}
                    />
                  </div>
                  {form.formState.errors.idCardFile && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.idCardFile.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="addressProofFile" className="flex items-center mb-2">
                    <Home className="h-4 w-4 mr-2" />
                    Proof of Address
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label 
                      htmlFor="addressProofFile" 
                      className="border-2 border-dashed rounded-md p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50"
                    >
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {getFileInputLabel(form.getValues('addressProofFile'), 'Click to upload or drag and drop')}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Utility bill, bank statement (max. 5MB)
                      </span>
                    </Label>
                    <Input
                      id="addressProofFile"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue('addressProofFile', file);
                          form.trigger('addressProofFile');
                        }
                      }}
                    />
                  </div>
                  {form.formState.errors.addressProofFile && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.addressProofFile.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="additionalDocumentFile" className="flex items-center mb-2">
                    <FileText className="h-4 w-4 mr-2" />
                    Additional Document (Optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label 
                      htmlFor="additionalDocumentFile" 
                      className="border-2 border-dashed rounded-md p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50"
                    >
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {getFileInputLabel(form.getValues('additionalDocumentFile'), 'Click to upload or drag and drop')}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Bank statement, tax ID, etc. (max. 5MB)
                      </span>
                    </Label>
                    <Input
                      id="additionalDocumentFile"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue('additionalDocumentFile', file);
                          form.trigger('additionalDocumentFile');
                        }
                      }}
                    />
                  </div>
                  {form.formState.errors.additionalDocumentFile && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.additionalDocumentFile.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={goToPreviousStep}>
                  Previous Step
                </Button>
                <Button type="button" onClick={goToNextStep}>
                  Next Step
                </Button>
              </div>
            </TabsContent>

            {/* Step 3: Additional Information */}
            <TabsContent value="3" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    {...form.register('occupation')}
                    placeholder="Enter your occupation"
                  />
                  {form.formState.errors.occupation && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.occupation.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sourceOfIncome">Source of Income</Label>
                  <Select
                    onValueChange={(value) => form.setValue('sourceOfIncome', value)}
                    defaultValue={form.getValues('sourceOfIncome')}
                  >
                    <SelectTrigger id="sourceOfIncome" className="w-full">
                      <SelectValue placeholder="Select primary source of income" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary/Employment</SelectItem>
                      <SelectItem value="business">Business Income</SelectItem>
                      <SelectItem value="investments">Investment Returns</SelectItem>
                      <SelectItem value="inheritance">Inheritance/Gift</SelectItem>
                      <SelectItem value="pension">Pension/Retirement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.sourceOfIncome && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.sourceOfIncome.message}</p>
                  )}
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="agreedToTerms"
                    checked={form.getValues('agreedToTerms')}
                    onCheckedChange={(checked) => {
                      form.setValue('agreedToTerms', checked as boolean);
                      form.trigger('agreedToTerms');
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="agreedToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm that the information provided is accurate and complete
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      By submitting this form, I agree to the verification process and consent to the processing of my personal data.
                    </p>
                  </div>
                </div>
                {form.formState.errors.agreedToTerms && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.agreedToTerms.message}</p>
                )}
              </div>

              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={goToPreviousStep}>
                  Previous Step
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit KYC Documents'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>

        {isSubmitting && (
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Uploading documents...</span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col space-y-4">
        <Separator />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">Document Guidelines:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>All documents must be clear, legible, and unexpired</li>
            <li>Address proof should be dated within the last 3 months</li>
            <li>Photos/scans must show all corners of the document</li>
            <li>Maximum file size: 5MB per document</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default KYCUploadForm;