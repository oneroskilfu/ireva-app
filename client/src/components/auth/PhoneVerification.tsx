import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Shield, Phone } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

// Phone number validation with Nigerian format (starts with 0 or +234 followed by 10 digits)
export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(14, 'Phone number cannot exceed 14 characters')
    .regex(
      /^(0|\+234)[0-9]{10}$/,
      'Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)'
    ),
});

// OTP code validation (6 digits)
export const verificationCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^[0-9]{6}$/, 'Verification code must contain only digits'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type VerificationFormValues = z.infer<typeof verificationCodeSchema>;

type PhoneVerification = {
  phoneNumber: string;
  code: string;
};

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
        description: "Your phone number has been successfully verified",
      });
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
    requestOtpMutation.mutate({ phoneNumber: data.phoneNumber });
  };
  
  const onVerificationSubmit = (data: VerificationFormValues) => {
    verifyOtpMutation.mutate({
      phoneNumber: phoneNumber,
      code: data.code,
    });
  };
  
  const resendCode = () => {
    requestOtpMutation.mutate({ phoneNumber });
  };
  
  return (
    <div className="space-y-6">
      {!otpSent && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Phone Number</CardTitle>
            <CardDescription>
              We'll send a verification code to your phone number
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
                            placeholder="08012345678 or +2348012345678" 
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
                    <FormItem className="space-y-4">
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
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