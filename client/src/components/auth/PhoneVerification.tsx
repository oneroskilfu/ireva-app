import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Phone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneVerification } from "@shared/schema";

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
});

const verificationCodeSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type VerificationFormValues = z.infer<typeof verificationCodeSchema>;

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
}

export function PhoneVerificationForm({ onVerificationComplete, initialPhoneNumber }: PhoneVerificationProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const { toast } = useToast();
  
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: initialPhoneNumber || "",
    },
  });
  
  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      code: "",
    },
  });
  
  const requestOtpMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const response = await apiRequest("POST", "/api/auth/request-otp", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send verification code");
      }
      return response.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
  
  const verifyOtpMutation = useMutation<any, Error, PhoneVerification>({
    mutationFn: async (data: PhoneVerification) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify code");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Phone verified",
        description: "Your phone number has been verified successfully",
      });
      // Call the callback with the verified phone number
      onVerificationComplete(phoneNumber);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      });
    },
  });
  
  const onPhoneSubmit = (data: PhoneFormValues) => {
    setPhoneNumber(data.phoneNumber);
    requestOtpMutation.mutate(data);
  };
  
  const onVerificationSubmit = (data: VerificationFormValues) => {
    verifyOtpMutation.mutate({
      phoneNumber,
      code: data.code,
    });
  };
  
  const resendCode = () => {
    if (phoneNumber) {
      requestOtpMutation.mutate({ phoneNumber });
    }
  };
  
  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      {!otpSent && (
        <Card>
          <CardHeader>
            <CardTitle>Phone Verification</CardTitle>
            <CardDescription>
              Verify your phone number to secure your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Phone className="text-muted-foreground h-5 w-5" />
                          <Input 
                            placeholder="Enter your phone number" 
                            className="flex-1" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestOtpMutation.isPending}
                >
                  {requestOtpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {otpSent && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Phone</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {phoneNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-6">
                <FormField
                  control={verificationForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Shield className="text-muted-foreground h-5 w-5" />
                          <Input 
                            placeholder="Enter 6-digit code" 
                            maxLength={6}
                            className="flex-1" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={verifyOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resendCode}
                    disabled={requestOtpMutation.isPending}
                  >
                    {requestOtpMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setOtpSent(false)}
                  >
                    Change Phone Number
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}