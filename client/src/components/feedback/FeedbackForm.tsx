import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form validation schema
const feedbackSchema = z.object({
  message: z.string().min(1, "Please enter your feedback")
    .max(1000, "Feedback message is too long (maximum 1000 characters)")
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess?: () => void;
  className?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ 
  onSuccess,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Form setup
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      message: '',
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: FeedbackFormValues) => {
      const response = await apiRequest('POST', '/api/feedback', data);
      return response.json();
    },
    onSuccess: () => {
      setFormStatus('success');
      form.reset();
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      });
      
      // Invalidate any user feedback queries
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/user'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      setFormStatus('error');
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FeedbackFormValues) => {
    setFormStatus('idle');
    submitMutation.mutate(data);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Send Feedback</CardTitle>
        <CardDescription>
          We value your input! Please share your thoughts, suggestions, or report any issues you've encountered.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you think about the platform, suggest new features, or report issues..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your feedback helps us improve the iREVA platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {formStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Feedback Submitted</AlertTitle>
                <AlertDescription className="text-green-700">
                  Thank you for your feedback! We'll review it shortly.
                </AlertDescription>
              </Alert>
            )}
            
            {formStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem submitting your feedback. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Feedback"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;