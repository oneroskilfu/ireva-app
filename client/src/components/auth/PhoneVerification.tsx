import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PhoneVerification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// Input validation schema
const phoneSchema = z.object({
  phoneNumber: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must not exceed 15 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" }),
});

// Verification code schema
const verificationCodeSchema = z.object({
  code: z.string()
    .length(6, { message: "Verification code must be 6 digits" })
    .regex(/^[0-9]+$/, { message: "Verification code must only contain numbers" }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type VerificationFormValues = z.infer<typeof verificationCodeSchema>;

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
}

export function PhoneVerificationForm({ onVerificationComplete, initialPhoneNumber }: PhoneVerificationProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "verification">("phone");
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  
  // Form for collecting phone number
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: initialPhoneNumber || "",
    },
  });

  // Form for verification code
  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  // Request OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const response = await apiRequest("POST", "/api/auth/request-otp", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification code sent!",
        description: `We've sent a 6-digit code to ${phoneNumber}`,
      });
      setStep("verification");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send verification code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: PhoneVerification) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Phone verified successfully!",
        description: "Your phone number has been verified.",
      });
      onVerificationComplete(phoneNumber);
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onPhoneSubmit = (data: PhoneFormValues) => {
    setPhoneNumber(data.phoneNumber);
    requestOtpMutation.mutate({ phoneNumber: data.phoneNumber });
  };

  const onVerificationSubmit = (data: VerificationFormValues) => {
    verifyOtpMutation.mutate({
      phoneNumber,
      code: data.code,
    });
  };

  const handleResendCode = () => {
    requestOtpMutation.mutate({ phoneNumber });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          {step === "phone" 
            ? "Please enter your phone number to receive a verification code"
            : "Enter the 6-digit code sent to your phone"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+234 80 1234 5678" 
                        {...field}
                        disabled={requestOtpMutation.isPending}
                      />
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
                    Sending Code...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...verificationForm}>
            <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground">
                  Code sent to <span className="font-medium text-foreground">{phoneNumber}</span>
                </div>
              </div>
              <FormField
                control={verificationForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123456" 
                        className="text-center tracking-widest text-lg"
                        maxLength={6}
                        {...field} 
                        disabled={verifyOtpMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </form>
          </Form>
        )}
      </CardContent>
      {step === "verification" && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            disabled={requestOtpMutation.isPending}
            onClick={() => setStep("phone")}
          >
            Change Number
          </Button>
          <Button 
            variant="link" 
            size="sm"
            disabled={requestOtpMutation.isPending}
            onClick={handleResendCode}
          >
            {requestOtpMutation.isPending ? "Sending..." : "Resend Code"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}