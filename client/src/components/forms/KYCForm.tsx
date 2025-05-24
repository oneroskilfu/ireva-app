import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// KYC form validation schema
const kycFormSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  idNumber: z.string().min(3, "ID number must be at least 3 characters"),
  idType: z.enum(["national_id", "drivers_license", "passport", "voters_card"], {
    required_error: "Please select an ID type",
  }),
  bankName: z.string().min(2, "Bank name must be at least 2 characters"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
});

type KYCFormValues = z.infer<typeof kycFormSchema>;

const KYCForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with react-hook-form
  const form = useForm<KYCFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      address: '',
      idNumber: '',
      idType: undefined,
      bankName: '',
      accountNumber: '',
    },
  });
  
  // KYC submission mutation
  const kycMutation = useMutation({
    mutationFn: async (data: KYCFormValues) => {
      const res = await apiRequest("POST", "/api/kyc", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/kyc"] });
      toast.success("KYC information submitted successfully");
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error(`KYC submission failed: ${error.message}`);
      setIsSubmitting(false);
    },
  });
  
  // Handle form submission
  const onSubmit = (data: KYCFormValues) => {
    setIsSubmitting(true);
    kycMutation.mutate(data);
  };
  
  // List of major Nigerian banks
  const NIGERIAN_BANKS = [
    "Access Bank",
    "Zenith Bank",
    "First Bank",
    "GT Bank",
    "UBA",
    "Fidelity Bank",
    "Union Bank",
    "Ecobank",
    "FCMB",
    "Sterling Bank",
    "Wema Bank",
    "Polaris Bank",
    "Stanbic IBTC",
    "Unity Bank",
    "Heritage Bank",
    "Keystone Bank",
    "Citibank",
    "Standard Chartered",
    "Providus Bank",
    "Jaiz Bank",
    "Titan Trust Bank"
  ];
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Please provide your personal and banking information for verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
                  <FormLabel>Residential Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your complete address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NIGERIAN_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select your primary bank for receiving investment returns
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
                    <Input 
                      placeholder="Enter your 10-digit account number" 
                      {...field} 
                      maxLength={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your NUBAN account number (10 digits)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit KYC"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default KYCForm;