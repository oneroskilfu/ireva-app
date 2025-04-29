import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText, Camera, Check } from 'lucide-react';

// KYC form schema
const kycFormSchema = z.object({
  firstName: z.string().min(2, 'First name is required and must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name is required and must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Address is required and must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  idType: z.enum(['national_id', 'drivers_license', 'passport', 'voters_card'], {
    required_error: 'Please select an ID type',
  }),
  idNumber: z.string().min(3, 'ID number is required'),
});

type KycFormValues = z.infer<typeof kycFormSchema>;

interface KycVerificationProps {
  onVerificationSubmitted: () => void;
  kycStatus?: string;
}

export function KycVerificationForm({ onVerificationSubmitted, kycStatus }: KycVerificationProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      country: '',
      idType: 'national_id',
      idNumber: '',
    },
  });
  
  const submitKycMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit KYC verification");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted",
        description: "Your KYC verification has been submitted successfully. We'll review it shortly.",
      });
      onVerificationSubmitted();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message,
      });
    },
  });
  
  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'idFront' | 'idBack' | 'selfie') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Create file preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (fileType === 'idFront') {
        setIdFrontFile(file);
        setIdFrontPreview(reader.result as string);
      } else if (fileType === 'idBack') {
        setIdBackFile(file);
        setIdBackPreview(reader.result as string);
      } else if (fileType === 'selfie') {
        setSelfieFile(file);
        setSelfiePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const isFormValid = () => {
    return form.formState.isValid && idFrontFile !== null && selfieFile !== null;
  };
  
  const onSubmit = async (values: KycFormValues) => {
    // All required files must be uploaded
    if (!idFrontFile || !selfieFile) {
      toast({
        variant: "destructive",
        title: "Missing Documents",
        description: "Please upload your ID (front) and selfie photo.",
      });
      return;
    }
    
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add form values to FormData
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Add files to FormData
    formData.append('idFront', idFrontFile);
    if (idBackFile) formData.append('idBack', idBackFile);
    formData.append('selfie', selfieFile);
    
    submitKycMutation.mutate(formData);
  };
  
  // Navigate to next tab
  const nextTab = () => {
    if (activeTab === 'personal') {
      // Validate personal fields
      const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'address', 'city', 'state', 'country'];
      const isPersonalValid = personalFields.every(field => !form.formState.errors[field as keyof KycFormValues]);
      
      if (isPersonalValid) {
        setActiveTab('document');
      } else {
        form.trigger(personalFields as Array<keyof KycFormValues>);
        toast({
          variant: "destructive",
          title: "Incomplete Information",
          description: "Please fill all required personal information fields correctly.",
        });
      }
    } else if (activeTab === 'document') {
      // Validate document fields
      const documentFields = ['idType', 'idNumber'];
      const isDocumentValid = documentFields.every(field => !form.formState.errors[field as keyof KycFormValues]);
      
      if (isDocumentValid) {
        setActiveTab('upload');
      } else {
        form.trigger(documentFields as Array<keyof KycFormValues>);
        toast({
          variant: "destructive",
          title: "Incomplete Information",
          description: "Please fill all required document information fields correctly.",
        });
      }
    }
  };
  
  // Navigate to previous tab
  const prevTab = () => {
    if (activeTab === 'document') {
      setActiveTab('personal');
    } else if (activeTab === 'upload') {
      setActiveTab('document');
    }
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="document">Document Details</TabsTrigger>
              <TabsTrigger value="upload">Document Upload</TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Nigeria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </TabsContent>
            
            {/* Document Details Tab */}
            <TabsContent value="document" className="space-y-4 py-4">
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
                      <Input placeholder="ID Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={prevTab}>
                  Back
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </TabsContent>
            
            {/* Document Upload Tab */}
            <TabsContent value="upload" className="space-y-6 py-4">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                <p className="text-sm text-gray-500">
                  Please upload clear photos of your ID document and a selfie holding your ID.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="id-front" className="mb-2 block">ID Document (Front) *</Label>
                  <Card className="border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      {idFrontPreview ? (
                        <div className="relative w-full h-40">
                          <img 
                            src={idFrontPreview} 
                            alt="ID Front Preview" 
                            className="w-full h-full object-contain" 
                          />
                          <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full m-2">
                            <Check size={16} />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FileText className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
                          <p className="text-sm text-gray-500">
                            Click to upload front side of your ID
                          </p>
                        </div>
                      )}
                      <Input 
                        id="id-front" 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'idFront')}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Label htmlFor="id-back" className="mb-2 block">ID Document (Back)</Label>
                  <Card className="border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      {idBackPreview ? (
                        <div className="relative w-full h-40">
                          <img 
                            src={idBackPreview} 
                            alt="ID Back Preview" 
                            className="w-full h-full object-contain" 
                          />
                          <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full m-2">
                            <Check size={16} />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FileText className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
                          <p className="text-sm text-gray-500">
                            Click to upload back side of your ID (if applicable)
                          </p>
                        </div>
                      )}
                      <Input 
                        id="id-back" 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'idBack')}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <Label htmlFor="selfie" className="mb-2 block">Selfie with ID *</Label>
                <Card className="border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    {selfiePreview ? (
                      <div className="relative w-full h-56">
                        <img 
                          src={selfiePreview} 
                          alt="Selfie Preview" 
                          className="w-full h-full object-contain" 
                        />
                        <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full m-2">
                          <Check size={16} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
                        <p className="text-sm text-gray-500">
                          Click to upload a selfie photo holding your ID
                        </p>
                      </div>
                    )}
                    <Input 
                      id="selfie" 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'selfie')}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={prevTab}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isFormValid() || submitKycMutation.isPending}
                >
                  {submitKycMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit KYC"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}