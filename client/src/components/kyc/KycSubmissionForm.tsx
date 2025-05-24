import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { kycSubmissionFormSchema } from "@/shared/validators/formValidators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Upload } from "lucide-react";
import { useNavigate } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";

// List of Nigerian states
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

type KycFormValues = z.infer<typeof kycSubmissionFormSchema>;

export default function KycSubmissionForm() {
  const [, navigate] = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is authorized
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  // Initialize form with default values
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSubmissionFormSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dateOfBirth: undefined,
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
      postalCode: "",
      idDocument: {
        idType: undefined,
        idNumber: "",
        frontImage: "",
        backImage: "",
        selfieImage: "",
        addressProofImage: "",
        addressProofType: undefined,
      },
    },
  });
  
  async function onSubmit(data: KycFormValues) {
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      // await kycService.submitKyc(data);
      console.log("KYC data submitted:", data);
      
      // Show success toast
      toast.success("KYC information submitted successfully! It will be reviewed by our team.");
      
      // Redirect to dashboard
      navigate('/investor');
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast.error("Failed to submit KYC information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Helper function to simulate file upload
  function handleFileUpload(
    fieldName: 'frontImage' | 'backImage' | 'selfieImage' | 'addressProofImage',
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real application, you would upload this file to your server or cloud storage
    // For demo purposes, we'll just set a placeholder URL
    const reader = new FileReader();
    reader.onloadend = () => {
      // This is just for demo - in a real app, replace with actual upload logic
      // and store the returned URL
      form.setValue(`idDocument.${fieldName}`, reader.result as string);
    };
    reader.readAsDataURL(file);
  }
  
  // Function to switch tabs and validate current tab
  const handleTabChange = (tab: string) => {
    // Basic validation based on current tab before switching
    if (activeTab === "personal") {
      const isPersonalValid = form.trigger(["firstName", "lastName", "dateOfBirth"]);
      if (!isPersonalValid) {
        return;
      }
    } else if (activeTab === "address") {
      const isAddressValid = form.trigger(["address", "city", "state", "country"]);
      if (!isAddressValid) {
        return;
      }
    }
    
    setActiveTab(tab);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary">
            KYC Verification
          </CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Complete your Know Your Customer (KYC) verification to gain full access to all investment opportunities.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="address">Address Details</TabsTrigger>
              <TabsTrigger value="documents">Identity Documents</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="personal" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        />
                        <FormDescription>
                          You must be at least 18 years old to invest
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => handleTabChange("address")}
                    >
                      Next: Address Details
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="address" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="123 Investment Street"
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Lagos" {...field} />
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
                          <FormLabel>State</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NIGERIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="100001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleTabChange("personal")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => handleTabChange("documents")}
                    >
                      Next: Identity Documents
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Identity Verification</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please provide a valid government-issued ID for verification.
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="idDocument.idType"
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
                              <SelectItem value="national_id">National ID Card</SelectItem>
                              <SelectItem value="drivers_license">Driver's License</SelectItem>
                              <SelectItem value="passport">International Passport</SelectItem>
                              <SelectItem value="voters_card">Voter's Card</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="idDocument.idNumber"
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="idDocument.frontImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Front of ID</FormLabel>
                            <FormControl>
                              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 bg-gray-50">
                                {field.value ? (
                                  <div className="relative w-full h-full">
                                    <img 
                                      src={field.value} 
                                      alt="ID Front" 
                                      className="w-full h-full object-contain" 
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-0 right-0"
                                      onClick={() => form.setValue("idDocument.frontImage", "")}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <span className="mt-2 text-sm text-gray-500">Upload front of ID</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload("frontImage", e)}
                                    />
                                  </label>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="idDocument.backImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Back of ID (if applicable)</FormLabel>
                            <FormControl>
                              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 bg-gray-50">
                                {field.value ? (
                                  <div className="relative w-full h-full">
                                    <img 
                                      src={field.value} 
                                      alt="ID Back" 
                                      className="w-full h-full object-contain" 
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-0 right-0"
                                      onClick={() => form.setValue("idDocument.backImage", "")}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <span className="mt-2 text-sm text-gray-500">Upload back of ID</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload("backImage", e)}
                                    />
                                  </label>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium">Selfie Verification</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please upload a clear selfie holding your ID and a paper with today's date
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="idDocument.selfieImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selfie with ID</FormLabel>
                          <FormControl>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 bg-gray-50">
                              {field.value ? (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={field.value} 
                                    alt="Selfie with ID" 
                                    className="w-full h-full object-contain" 
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-0 right-0"
                                    onClick={() => form.setValue("idDocument.selfieImage", "")}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer">
                                  <Upload className="w-8 h-8 text-gray-400" />
                                  <span className="mt-2 text-sm text-gray-500">Upload selfie with ID</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload("selfieImage", e)}
                                  />
                                </label>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium">Address Verification</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please provide a document proving your current residential address
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="idDocument.addressProofType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Proof Document Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="idDocument.addressProofImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Proof Document</FormLabel>
                          <FormControl>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 bg-gray-50">
                              {field.value ? (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={field.value} 
                                    alt="Address Proof" 
                                    className="w-full h-full object-contain" 
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-0 right-0"
                                    onClick={() => form.setValue("idDocument.addressProofImage", "")}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer">
                                  <Upload className="w-8 h-8 text-gray-400" />
                                  <span className="mt-2 text-sm text-gray-500">Upload address proof document</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload("addressProofImage", e)}
                                  />
                                </label>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleTabChange("address")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit KYC Information"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-6 text-center text-sm text-muted-foreground rounded-b-lg">
          <div className="w-full">
            <p>
              Your information is encrypted and securely stored. We comply with data protection regulations.
            </p>
            <p className="mt-1">
              Need help? Contact our support team at support@ireva.com
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}